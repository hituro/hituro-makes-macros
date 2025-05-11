window.MQBN = class MQBN {
  
  version = "1.5.2";

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
  
  static twsRequirement(r) {
    return !!Scripting.evalTwineScript(r.cond);
  }
  
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
  
  static storyletscan() {
    const match   = /<<storylet(?:| ([A-z_-]*))>>/;
    const replace = /<<storylet([A-z_ -]*)>>([\S\s]*)<<\/storylet>>/;
    const cond    = /<<cond>>([\S\s]*)<<\/cond>>/;
    Story.filter((p) => p.text.match(match)).forEach(p => {
      const store = p.text.match(match)[1] ?? "storylets";
      if (!(store in setup)) {
        this.storyletsinit(store);
        setup[store] = [];
      }
      const content  = p.text.match(replace)[2].trim();
      let   storylet;
      if (content.match(cond)) {
        let matches   = content.match(cond);
        let condition = matches[1];
            storylet  = content.replace(matches[0],'').trim();
            storylet  = storylet ? Scripting.evalJavaScript(`(${storylet})`) : {};
        	storylet.any = [ { type: "tws", cond: condition } ];
      } else if (content[0] == '{') {
      	storylet = Scripting.evalJavaScript(`(${content})`);
      } else if (content.length == 0) {
        storylet = {};
      } else {
        storylet = { any: [ { type: "tws", cond: content } ] };
      }
      storylet.id = storylet.id ?? p.name
      storylet.title = storylet.title ?? p.title
      storylet.passage = p.title
      setup[store].push(storylet)
    });
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
    const seq = new Sequence(values,initial,mode);
    State.setVar(name,seq);
  }
  
};

window.Sequence = class Sequence {
  constructor(values, curr, mode = "linear", count = 1) {
    this.values = values;
    this.val    = curr;
    this.mode   = mode;
    this.name   = this.getSequenceName();
    this.count  = count;
  }
  
  get value() { return this.val }
  
  set value(newval) {
    this.sequenceChange(newval - this.val);
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
  
  getSequenceName() {
    let previous = "";
    for (let val in this.values) {
      if (val > this.val) {
        return previous;
      }
      previous = this.values[val];
    }
    return previous;
  }
  
  sequenceChange(inc) {
    const idx   = this.val;
    const len   = this.values.length;
    let   newidx;

    if (this.mode == "linear") {
      newidx = Math.max(Math.min(idx + inc,len -1),0);
    } else if (this.mode == "cycling") {
      newidx = idx + inc;
      if (inc > 0 && newidx > len -1) {
        this.count += Math.floor(newidx / len);
      } else if (inc < 0 && newidx < 0) {
        this.count -= Math.abs(Math.floor(newidx / len));
      }
      newidx = Math.abs(newidx % len);
    }
    this.name  = this.getSequenceName(newidx);
    this.val   = newidx;
  }
  
  toJSON() { // the custom revive wrapper for SugarCube's state tracking
      // use `setup` version in case the global version is unavailable
      return JSON.reviveWrapper(String.format("new Sequence({0},{1},{2},{3})",
        JSON.stringify(this.values),
        JSON.stringify(this.val),
        JSON.stringify(this.mode),
        JSON.stringify(this.count)
      ));
  }
  
  clone() { return new Sequence(this.values,this.val,this.mode,this.count); }
};

window.macroPairedArgsParser = function(args,start=0,singletons=[]) {
  const parsed = {};
  for (let i = start; i < args.length; i += 1) {
  	if (singletons.includes(args[i])) {
    	parsed[args[i]] = true;
    } else {
    	parsed[args[i].replace(/[^a-zA-Z0-9_]/g,'')] = args[i+1];
        i++;
    }
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

Macro.add("storyletinclude",{
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
      jQuery(this.output).wiki(Story.get(passage).processText());
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
    MQBN.storyletscan();
  }
});

Macro.add("storylet",{
  tags: [],
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
    let   inc   = this.args[1] ?? 1;
    if (this.name == "sequencerewind") { inc = -1 * inc; }
    const seq   = State.getVar(this.args[0]);
          seq.sequenceChange(inc);
    State.setVar(this.args[0],seq);
  }
});
