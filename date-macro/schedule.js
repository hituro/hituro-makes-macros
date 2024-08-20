window.Schedule = class Schedule {
  constructor(schedule,datesystem) {
    this.schedule    = schedule ?? {};
    this.datesystem  = datesystem ?? "default";
    for (let event in schedule) {
      schedule[event] = this.parseEvent(event,schedule[event]);
    }
  }

  parseEvent(event,when) {
      when = Array.isArray(when) ? when : [when];
      const opts = [];
      for (let opt of when) {
          let [start,end] = opt.split(' -> ');
          opts.push({ start: DATESYSTEM.dateQueryFromString(start), end: DATESYSTEM.dateQueryFromString(end) });
      }
      return { event: event, when: opts };
  }
  
  get ds() {
    return setup.datesystems[this.datesystem];
  }
  
  add(event,when) {
    this.schedule[event] = this.parseEvent(event,when);
  }
  
  check(event,date) {
    date = date ?? variables()[this.ds.varname];
    if (typeof date == "number") { date = this.ds.getDate(date); }
    return this.isValid(this.schedule[event],date);
  }
  
  events(date) {
    date = date ?? variables()[this.ds.varname];
    if (typeof date == "number") { date = this.ds.getDate(date); }
    return Object.values(this.schedule).filter((event) => this.isValid(event,date));
  }
  
  isValid(event,date) {
    return event.when.some((time) => {
      if (time.start && time.end) {
        let s = this.ds.dateFromPartialDate(time.start);
        let e = this.ds.dateFromPartialDate(time.end);
        return s <= date.e && e >= date.e;
      } else {
        return this.ds.dateCompare(time.start,date);
      }
    });
  }
  
  toJSON() { // the custom revive wrapper for SugarCube's state tracking
      // use `setup` version in case the global version is unavailable
      return JSON.reviveWrapper(String.format("new Schedule({0},{1})",
        JSON.stringify(this.schedule),
        JSON.stringify(this.datesystem)
      ));
  }
  
  clone() { return new Schedule(this.schedule,this.datesystem); }
};

Macro.add("schedule",{
  tags: ["event"],
  handler: function() {
    if (!this.args.length || !['$','_'].includes(this.args[0][0])) {
      throw new Error("Argument one must be the name of a story or temporary variable");
    }
    const varname    = this.args[0];
    const datesystem = this.args[1] ?? "default";
    const events     = {};
    
    for (let entry of this.payload) {
      console.log(entry);
      if (entry.name == "event") {
        events[entry.args[0]] = entry.args[1];
      }
    }
    
    State.setVar(varname,new Schedule(events,datesystem));
  }
});

Macro.add("addevent",{
  handler: function() {
    if (!this.args.length || !['$','_'].includes(this.args[0][0])) {
      throw new Error("Argument one must be the name of a story or temporary variable");
    }
    const varname    = this.args[0];
    const schedule   = State.getVar(varname);
    if (!(schedule instanceof Schedule)) {
      throw new Error("Argument one is not a valid Schedule");
    }
    schedule.add(this.args[1],this.args[2]);
  }
});

Macro.add("removeevent",{
  handler: function() {
    if (!this.args.length || !['$','_'].includes(this.args[0][0])) {
      throw new Error("Argument one must be the name of a story or temporary variable");
    }
    const varname    = this.args[0];
    const schedule   = State.getVar(varname);
    if (!(schedule instanceof Schedule)) {
      throw new Error("Argument one is not a valid Schedule");
    }
    delete schedule.schedule[this.args[1]];
  }
});