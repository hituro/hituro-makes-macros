window.MQBN = class MQBN {

  static getStorylets(limit,store="storylets",needAvailable=true) {
    const available = [];
    let   priority  = 0;
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
    return available.slice(0,limit);
  }

  static prioritySort(a, b) {
    if (a.priority && !b.priority) {
      return -1;
    } else if (a.priority != b.priority) {
      return a.priority > b.priority ? -1 : 1;
    } else {
      return randomFloat(0,1) - 0.5;
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
      return this.operators[r.op ?? "eq"](this.sequenceCount(r.name),r.count);
    } else {
      return this.operators[r.op == "not" ? "neq" : "eq"](State.getVar(r.name),r.value);
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
      val = Object.hasOwn(r.has) && _var[r.has];
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
      const s = p.text.replace(replace,"$1");
      const storylet   = Scripting.evalJavaScript(`(${s.trim()})`);
      storylet.title   = storylet.title ?? p.title;
      storylet.passage = p.title;
      storylets.push(storylet);
    }
    setup[store] = setup[store].concat(storylets);
  }
  
  static storyletsinit(store = "storylets") {
    State.setVar('$'+store+'_used',new Map());
    State.setVar('$'+store+'_current',false);
  }

  static pruneStorylets(store = "storylets") {
    setup[store] = setup[store].filter((s) => !variables()[store+'_used'].has(s.id ?? s.title));
  }

  /* SEQUENCES */

  static createSequence(name, values, mode = "linear") {
    setup.MQBNsequences = setup.MQBNsequences || {};
    setup.MQBNsequences[MQBN.sequenceName(name)] = values;
    setup.MQBNsequences[MQBN.sequenceName(name)].mode = mode;
    setup.MQBNsequences[MQBN.sequenceName(name)].loops = 1;
    State.setVar(name,values[0]);
  }

  static sequenceChange(varname, inc) {
    const name  = MQBN.sequenceName(varname);
    const value = State.getVar(varname);
    const idx   = setup.MQBNsequences[name].indexOf(value);
    let   newidx;

    if (setup.MQBNsequences[name].mode == "linear") {
      newidx = Math.max(Math.min(idx + inc,setup.MQBNsequences[name].length -1),0);
    } else if (setup.MQBNsequences[name].mode == "cycling") {
      newidx = idx + inc;
      if (inc > 0 && newidx > setup.MQBNsequences[name].length -1) {
        setup.MQBNsequences[name].loops += Math.floor(newidx / setup.MQBNsequences[name].length);
      } else if (inc < 0 && newidx < 0) {
        setup.MQBNsequences[name].loops -= Math.floor(Math.abs(newidx) / setup.MQBNsequences[name].length);
      }
      newidx = Math.abs(newidx % setup.MQBNsequences[name].length);
    }
    State.setVar(varname,setup.MQBNsequences[name][newidx]);
  }

  static sequenceName(name) {
    return name.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  }

  static sequenceValue(varname) {
    const name  = MQBN.sequenceName(varname);
    const value = State.getVar(varname);
    const idx   = setup.MQBNsequences[name].indexOf(value);
    return idx;
  }

  static sequenceCount(varname) {
    const name  = MQBN.sequenceName(varname);
    return setup.MQBNsequences[name].loops;
  }
  
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
      const storylets = setup[store].find((s) => { return s.title == this.args[0] || s.id == this.args[0]});
      if (ifopen) {
        // we wish to use the first open one
        const filtered = storylets.toSorted(MQBN.prioritySort).filter((s) => MQBN.meetsRequirements(s));
        storylet = filtered.length ? filtered[0] : storylets[0];
      } else {
        storylet = storylets[0];
      }
    }

    if (storylet) {
      const passage = storylet.passage ?? storylet.title;
      variables()[store+'_used'].set(storylet.id ?? storylet_title);
      variables()[store+'_current'] = storylet;
      MQBN.trigger(storylet);
      Engine.play(passage);
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
      variables()[store+'_used'].set(storylet.id ?? storylet_title);
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
    if (Array.isArray(this.args[1])) {
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
    const name = MQBN.sequenceName(this.args[0]);
    if (!setup.MQBNsequences[name]) {
      return this.error(`sequence ${this.args[0]} has not been defined`);
    }
    let   inc   = this.args[1] ?? 1;
    if (this.name == "sequencerewind") { inc = -1 * inc; }
    MQBN.sequenceChange(this.args[0],inc);
  }
});