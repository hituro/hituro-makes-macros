window.MQBN = class MQBN {

  static getStorylets(limit,store="storylets",needAvailable=true) {
    const available = [];
    let   priority  = -Infinity;
    let   count     = 0;
    for (let s of setup[store].sort(MQBN.prioritySort)) {
      if (this.meetsRequirements(s,store)) {
        count ++;
        if ((s.priority ?? 0) >= priority) {
          available.push(s);
        }
        if (count == limit) { 
          priority = s.priority ?? 0; 
          if (!needAvailable) { break; }
        } 
      }
    };
    temporary()[store+'_available'] = available;
    return available.slice(0,limit).sort(MQBN.weightSort);
  }

  static prioritySort(a, b) {
    const ap = a.priority ?? 0;
    const bp = b.priority ?? 0;
    if (ap != bp) {
      return ap > bp ? -1 : 1;
    } else {
      return randomFloat(0,1) - 0.5;
    }
  }

  static weightSort(a, b) {
    if (a.priority && !b.priority) {
      return 1;
    } else if (a.weight != b.weight) {
      return a.weight > b.weight ? 1 : -1;
    } else {
      return 0;
    }
  }
  
  static meetsRequirements(s,store="storylets") {
    if (!s.sticky && variables()[store+"_used"].has(s.id ? s.id : s.title)) { return false; }
    if (s.all) {
      for (const r of s.all) {
        if (!this[r.type+"Requirement"](r,store)) { return false; }
      }
    }
    if (s.any) {
      for (const r of s.any) {
        if (this[r.type+"Requirement"](r,store)) { return true; }
      }
      return false;
    }
    return true;
  }
  
  static anyRequirement(r,store) { return this.meetsRequirements(r,store); }
  static allRequirement(r,store) { return this.meetsRequirements(r,store); }
  
  static visitedRequirement(r) {
    if (r.op == "not") {
      return !visited(r.passage);
    } else {
      return visited(r.passage);
    }
  }
  
  static varRequirement(r) {
    return this.operators[r.op ?? "eq"](State.getVar(r.var),r.value);
  }
  
  static sequenceRequirement(r) {
    if (r.count) {
      return this.operators[r.op ?? "eq"](State.getVar(r.seq).count,r.count);
    } else if (r.value) {
      return this.operators[r.op ?? "eq"](State.getVar(r.seq).value,r.value);
    } else {
      return this.operators[r.op == "not" ? "neq" : "eq"](State.getVar(r.seq).name,r.name);
    }
  }
  
  static playedRequirement(r,store) {
    if (r.op == "not") {
      return !variables()[store+"_used"].has(r.story);
    } else {
      return variables()[store+"_used"].has(r.story);
    }
  }

  static collectionRequirement(r) {
    const _var = State.getVar(r.var);
    let   val;
    if (_var instanceof Set || _var instanceof Map) {
      val = _var.has(r.has);
    } else if (_var instanceof Array) {
      val = _var.includes(r.has);
    } else if (Util.toStringTag(_var) == "Object") {
      val = Object.hasOwn(_var,r.has) && _var[r.has];
    } else {
      throw(`The variable ${r.var} is not any kind of collection`);
    }
    if (r.op == "not") {
      return !val;
    } else {
      return val;
    }
  }

  static functionRequirement(r,store) {
    return r.func(r,store);
  }
  
  static randRequirement(r) {
    let x = this.getRandomInt(1,100);
    return (x <= r.chance);
  }
  
  static pullsRequirement(r,store) {
    return this.operators[r.op ?? "eq"](r.pulls,variables()[store+"_used"].size);
  }

  static operators = {
    eq:  function(a, b) { return a == b },
    neq: function(a, b) { return a != b },
    lt:  function(a, b) { return a < b  },
    gt:  function(a, b) { return a > b  },
    lte: function(a, b) { return a <= b },
    gte: function(a, b) { return a >= b },
    includes: function(a, b) { return Array.isArray(a) && a.includes(b) },
    notincludes: function(a, b) { return Array.isArray(a) && !a.includes(b) },
    has: function(a, b) { 
      return (a instanceof Set || a instanceof Map) && a.has(b) 
    }
  }

  /* UTILITY */

  static trigger(story) {
    $(document).trigger({ type: ":storyletchosen", storylet: story});
  }

  // helper to avoid a seeded prng
  static getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
  }

  static played(story,store="storylets") {
    return this.playedRequirement({ story : story },store);
  }

  /* SCAN */
  
  static storyletscan(store = "storylets") {
    const st      = (store == "storylets") ? "" : ` ['"]{0,1}*${store}['"]{0,1}`;
    const match   = new RegExp(`<<storylet${st}>>`);
    const replace = new RegExp(`<<storylet${st}>>(.*)<<\/storylet>>`,"s");
    const ps      = Story.lookupWith((p) => p.text.match(match));
    const storylets = [];
    for (let p of ps) {
      const s = p.text.match(replace)[1];
      const storylet   = Scripting.evalJavaScript(`(${s.trim()})`);
      storylet.title   = storylet.title ?? p.title;
      storylet.passage = p.title;
      storylets.push(storylet);
    }
    setup[store] = setup[store] ? setup[store].concat(storylets) : storylets;
  }
  
  static storyletsinit(store = "storylets") {
    if (!State.variables[store+'_used']) {
    	State.setVar('$'+store+'_used',new Map());
    }
    if (!State.variables[store+'_current']) {
    	State.setVar('$'+store+'_current',false);
    }
  }

  static pruneStorylets(store = "storylets") {
    setup[store] = setup[store].filter((s) => !variables()[store+'_used'].has(s.id ?? s.title));
  }

  /* SEQUENCES */

  static createSequence(name, values, mode = "linear") {
    setup.MQBNsequences = setup.MQBNsequences || {};
    let initial = 0;
    if (Util.toStringTag(values) == "Object") {
      let va = [];
      let setinitial = false;
      for (let val in values) {
        if (!setinitial) { initial = val; setinitial = true; }
        va[val] = values[val];
      }
      values = va;
    }
    setup.MQBNsequences[name] = { values: values, mode: mode };
    const seq = new Sequence(name,values[initial],initial);
    State.setVar(name,seq);
  }

  static sequenceChange(name, inc) {
    const seq   = State.getVar(name);
    const idx   = seq.value;
    const len   = setup.MQBNsequences[name].values.length;
    let   newidx;

    if (setup.MQBNsequences[name].mode == "linear") {
      newidx = Math.max(Math.min(idx + inc,len -1),0);
    } else if (setup.MQBNsequences[name].mode == "cycling") {
      newidx = idx + inc;
      if (inc > 0 && newidx > len -1) {
        seq.count += Math.floor(newidx / len);
      } else if (inc < 0 && newidx < 0) {
        seq.count -= Math.abs(Math.floor(newidx / len));
      }
      newidx = Math.abs(newidx % len);
    }
    seq.name  = this.sequenceName(name,newidx);
    seq.val   = newidx;
    State.setVar(name,seq);
  }

  static sequenceName(name,value) {
    let previous = "";
    for (let val in setup.MQBNsequences[name].values) {
      if (val > value) {
        return previous;
      }
      previous = setup.MQBNsequences[name].values[val];
    }
    return previous;
  }
  
};

window.Sequence = class Sequence {
  constructor(type, name, value, count = 1) {
    this.type  = type;
    this.name  = name;
    this.val   = value;
    this.count = count;
  }

  toString() {
    return this.name;
  }

  [Symbol.toPrimitive](hint) {
    if (hint == "string") {
    	return this.name;
    } else {
    	return this.value;
    }
  }
  
  set value(newval) {
    MQBN.sequenceChange(this.type, newval - this.value);
  }
  get value() { return this.val }
  
  toJSON() { // the custom revive wrapper for SugarCube's state tracking
      // use `setup` version in case the global version is unavailable
      return JSON.reviveWrapper(String.format("new Sequence({0},{1},{2},{3})",
        JSON.stringify(this.type),
        JSON.stringify(this.name),
        JSON.stringify(this.val),
        JSON.stringify(this.count)
      ));
  }
  
  clone() { return new Sequence(this.type,this.name,this.val,this.count); }
};

window.macroPairedArgsParser = function(args,start=0) {
  const parsed = {};
  for (let i = start; i < args.length; i += 2) {
    parsed[args[i].replace(/[^a-zA-Z0-9_]/g,'')] = args[i+1];
  }
  return parsed;
}

Macro.add(["storyletsinit","initstorylets"],{
  handler: function() {
      MQBN.storyletsinit(this.args[0]);
  }
});

Macro.add(["storyletsprune","prunestorylets"],{
  handler: function() {
      MQBN.pruneStorylets(this.args[0]);
  }
});

Macro.add("storyletgoto",{
  handler: function() {
    if (this.args.length === 0) {
        return this.error(`no storylet specified`);
    }

    const args    = macroPairedArgsParser(this.args,1);
    const store   = args.store ?? 'storylets';
    const ifopen  = args.open  ?? false;
    let   storylet;
    
    if (typeof this.args[0] === 'object') {
      // Argument was a storylet object
      storylet = this.args[0]; 
    } else {
      // Argument was a storylet name
      const storylets = setup[store].filter((s) => { return s.title == this.args[0] || s.id == this.args[0]});
      if (ifopen) {
        // we wish to use the first open one
        const filtered = storylets.toSorted(MQBN.prioritySort).filter((s) => MQBN.meetsRequirements(s,store));
        storylet = filtered.length ? filtered[0] : false;
      } else {
        storylet = storylets[0];
      }
    }

    if (storylet) {
      const passage = storylet.passage ?? storylet.title;
      variables()[store+'_used'].set(storylet.id ?? storylet.title);
      variables()[store+'_current'] = storylet;
      MQBN.trigger(storylet);
      setTimeout(() => Engine.play(passage), Engine.minDomActionDelay);
    }
  }
});

Macro.add("storyletlink",{
  tags    : null,
  handler() {
    if (this.args.length === 0) {
      return this.error("no storylet specified");
    }

    const args    = macroPairedArgsParser(this.args,1);
    const store   = args.store ?? 'storylets';
    const style   = args.behaviour ?? 'hidden'; 
    const payload = this.payload[0].contents.trim();
    const $link   = jQuery(document.createElement('a'));
      
    let storylet;
    if (typeof this.args[0] === 'object') {
      // Argument was a storylet object
      storylet = this.args[0]; 
    }
    else {
      // Argument was a storylet name
      if (!temporary()[store+'_available']) {
          MQBN.getStorylets(0,store);
      }
      const s = temporary()[store+'_available'].find((s) => { return s.title == this.args[0] || s.id == this.args[0] });
      if (s) {
        storylet = s;
      }
    }
    
    if (storylet) {
          
      $link.append(document.createTextNode(args.text ?? (storylet.link ?? storylet.title)));
      
      let passage = storylet.passage ?? storylet.title;
      
      if (passage != null) { // lazy equality for null
        $link.attr('data-passage', passage);
        if (Story.has(passage)) {
          if (Config.addVisitedLinkClass && State.hasPlayed(passage)) {
            $link.addClass('link-visited');
          }
        }
        else {
          $link.addClass('link-broken');
        }
      }

      $link
        .addClass('macro-storylet-link')
        .addClass('link-internal')
        .ariaClick({
          namespace : '.macros',
          role      : passage != null ? 'link' : 'button', // lazy equality for null
          one       : passage != null // lazy equality for null
        }, this.createShadowWrapper(
            function() {
                variables()[store+'_used'].set(storylet.id ?? storylet.title);
                variables()[store+'_current'] = storylet;
                if (payload) {
                  Wikifier.wikifyEval(payload)
                }
              },
          passage != null // lazy equality for null
            ? () => { MQBN.trigger(storylet); Engine.play(passage); }
            : null
        ))
        .appendTo(this.output);
          
    } else if (style == "disabled" && typeof this.args[0] === "string") {
      storylet = setup[store].find((s) => s.id == this.args[0] || s.title == this.args[0]);
      if (storylet) {
        jQuery(this.output).wiki(`<span class="link-disabled">${args.disabledtext ?? (storylet.link ?? storylet.title)}</span>`);
      } else {
        return this.error(`storylet ${this.args[0]} cannot be found`);
      }
    }
  }
});

Macro.add("storyletuse",{
  handler: function() {
    if (this.args.length === 0) {
        return this.error(`no storylet specified`);
    }

    const args    = macroPairedArgsParser(this.args,1);
    const store   = args.store ?? 'storylets';
    let   storylet;

    if (typeof this.args[0] === 'object') {
      // Argument was a storylet object
      storylet = this.args[0]; 
    } else {
      // Argument was a storylet name
      const storylets = setup[store].find((s) => { return s.title == this.args[0] || s.id == this.args[0]});
    }

    if (storylet) {
      variables()[store+'_used'].set(storylet.id ?? storylet.title);
      variables()[store+'_current'] = storylet;
    }
  }
});

/* SCAN MACROS */

Macro.add("storyletscan",{
  handler: function() {
    MQBN.storyletscan(this.args[0]);
  }
});

Macro.add("storylet",{
  handler: function() {
    // null placeholder to allow the <<storylet>> syntax
  }
});

/* SEQUENCE MACROS */

Macro.add("sequence",{
  handler: function() {
    if (this.args.length === 0) {
      return this.error("no sequence name specified");
    }
    if (this.args[1] != "linear" && this.args[1] != "cycling") {
      return this.error(`argument 2 must be either linear or cycling, ${this.args[1]} found`);
    }
    if (this.args.length < 3) {
      return this.error("no sequence values specified");
    }
    if (Array.isArray(this.args[1]) || Util.toStringTag(this.args[1]) == "Object") {
      MQBN.createSequence(this.args[0],this.args[2],this.args[1]);
    } else {
      MQBN.createSequence(this.args[0],this.args.slice(2),this.args[1]);
    }
  }
});

Macro.add(["sequenceadvance","sequencerewind"],{
  handler: function() {
    if (this.args.length === 0) {
      return this.error("no sequence name specified");
    }
    if (!setup.MQBNsequences) {
      return this.error("you must create a sequence using <<sequence>> before ${this.name == 'sequenceadvance' ? 'advancing' : 'rewinding'} it");
    }
    if (!setup.MQBNsequences[this.args[0]]) {
      return this.error(`sequence ${this.args[0]} has not been defined`);
    }
    let   inc   = this.args[1] ?? 1;
    if (this.name == "sequencerewind") { inc = -1 * inc; }
    MQBN.sequenceChange(this.args[0],inc);
  }
});