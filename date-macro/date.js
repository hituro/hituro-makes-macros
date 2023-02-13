(function() {
  "use strict";
  
  variables()["time"] = 0;
  
  window.DATESYSTEM = class DATESYSTEM {
    constructor(config = {}) {
      this.systemname  = config.name ?? "default";
      this.varname     = this.systemname == "default" ? "time" : this.systemname + '-time';
      this.MIN_LENGTH  = config.min_length ?? 60;
      this.HOUR_LENGTH = config.hour_length ?? 60;
      this.DAY_LENGTH  = config.day_length ?? 24;
      this.DAYS        = config.days ?? [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      this.WEEK_START  = config.week_start ?? 5;
      this.MONTHS      = config.months ?? [
        { name: "January"  , length: 31, season: "winter" }, 
        { name: "February" , length: 28, season: "winter", leap_century: [[400,29]], leap: [[4,29]] }, 
        { name: "March"    , length: 31, season: "spring" }, 
        { name: "April"    , length: 30, season: "spring" }, 
        { name: "May"      , length: 31, season: "spring" }, 
        { name: "June"     , length: 30, season: "summer" }, 
        { name: "July"     , length: 31, season: "summer" }, 
        { name: "August"   , length: 31, season: "summer" }, 
        { name: "September", length: 30, season: "autumn" }, 
        { name: "October"  , length: 31, season: "autumn" }, 
        { name: "November" , length: 30, season: "autumn" }, 
        { name: "December" , length: 31, season: "winter" }
      ];
      this.YEAR_LENGTH = this.MONTHS.reduce((total,m) => { return total + m.length},0)
      this.PERIODS    = config.periods ?? { 
        y: ["year","years"], mo: ["month","months"], d: ["day","days"], h: ["hour","hours"], m: ["minute","minutes"], s: ["second","seconds"]
      };
      this.hl = this.MIN_LENGTH * this.HOUR_LENGTH;
      this.dl = this.hl * this.DAY_LENGTH;
      this.yl = this.dl * this.YEAR_LENGTH;
      this.equal_years = this.MONTHS.reduce((total,m) => { total += (m.leap_century || m.leap) ? 1 : 0; }) == 0;
      this.BASE_TIME  = config.base_time ? this.dateToTime(config.base_time) : 0;
      this.cache = { };
    }
    
    setToTime(datestring, base) {
      return this.dateToTime(datestring, { type: "set", base: base ?? this.getDate(0,"date") });
    }
    
    dateToTime(datestring, options = {}) {
      // set options
      options.type      = options.type ?? "set";
      options.direction = options.direction ?? "forward";
      
      //set base values
      const base   = options.base ?? this.getDate(this.BASE_TIME + variables()[this.varname]);
      if (datestring == "now") {
        datestring = this.getRealDate();
      }
      
      const parts  = datestring.toLowerCase().split(" ");
      let   time   = 0;
      
      for (const part of parts) {
        let [ , num, unit ] = part.match(/^([0-9]+)(s|m|h|d|mo|y)$/) || [];
        
        if (!unit || !num) throw new Error("Unrecognised date element in dateToTime(): please use s, m, h, d, mo, or y");
        
        if (options.type == "set" && ["mo","d","y"].includes(unit)) {
          num --;
        }
        
        switch (unit) {
          case "s" : time += num * 1; break;
          case "m" : time += num * this.MIN_LENGTH;  break;
          case "h" : time += num * this.hl; break;
          case "d" : time += num * this.dl; break;
          case "y" : num *= this.MONTHS.length; unit = 'mo'; break;
        }
        if (unit == 'mo') {
          if (options.direction == "forward") {
            for (let i = 0; i < num; i++) {
              const year  = base.Y + Math.floor((base.mo + i) / this.MONTHS.length);
              const month = this.MONTHS[(base.mo - 1 + i) % this.MONTHS.length];
              const days  = this.getMonthLength(month,year);
              time += days * (this.dl);
            }
          } else {
            for (let i = num; i > 0; i--) {
              const year  = base.Y+ Math.floor((base.mo + i) / this.MONTHS.length);
              const month = this.MONTHS[(base.mo - 1 - i) % this.MONTHS.length];
              const days  = this.getMonthLength(month,year);
              time += days * (this.dl);
            }
          }
        }
      }
      return time;
    }
    
    moveToTime(datestring) {
      const base  = this.getDate(this.BASE_TIME + variables()[this.varname]);
      const parts = datestring.toLowerCase().split(" ");
      const full  = [["y","Y"], ["mo","mo"], ["d","d"], ["h","h"], ["m","m"], ["s","s"]];
      const user  = {};
      //make an object out of what the user has provided
      for (const part of parts) {
        let [ , num, unit ] = part.match(/^([0-9]+)(s|m|h|d|mo|y)$/) || [];
        user[unit] = num;
      }

      //make a new time string filling in missing elments from base
      const out   = [];
      for (const e of full) {
        out.push((user[e[0]] ?? base[e[1]]) + e[0]);
      }
      return this.setToTime(out.join(' '));
    }

    dateNext(interval,time) {
      let   r     = time ?? this.BASE_TIME + variables()[this.varname];
      const base  = this.getDate(r);
      let [ , num, unit ] = interval.match(/^([0-9]+)(s|m|h|d|mo|y)$/) || [];

      if (!unit || !num) throw new Error("Unrecognised date element in dateToTime(): please use s, m, h, d, mo, or y");

      // find out how far to the next unit asked for
      switch (unit) {
        case "m" : num -= base.m; break;
        case "h" : num -= base.h; break;
        case "mo": num --; break;
      }
      // set the new time
      switch (unit) {
        case "s" : r += 1; break;
        case "m" : r = (Math.floor(r / this.MIN_LENGTH)  * this.MIN_LENGTH) + this.MIN_LENGTH; break;
        case "h" : r = (Math.floor(r / this.hl) * this.hl) + (num * this.hl); break;
        case "d" : r = (Math.floor(r / this.dl) * this.dl) + (num * this.dl); break;
        case "y" : r = (Math.floor(r / this.yl) * this.yl) + (num * this.yl); break;
      }
      if (unit == 'mo') {
        const month = this.MONTHS[base.mo -1];
        const days  = this.getMonthLength(month,base.y);
        // reset to end of month
        r = (Math.floor(r / this.dl) * this.dl) ;
        r += ((days - base.d) + 1) * this.dl;
        for (let i = base.mo; i <= num; i++) {
          const year  = base.Y + Math.floor((base.mo + i) / this.MONTHS.length);
          const month = this.MONTHS[(base.mo - 1 + i) % this.MONTHS.length];
          const days  = this.getMonthLength(month,year);
          r += (this.dl * days)
        }
      }
      return r;
    }
    
    getDate(date, output = "date") {
      let r = (date !== undefined) ? date : this.BASE_TIME + variables()[this.varname];
      const initial = r;

      // caching
      if (this.cache.time === r) { 
        return this.cache.value; 
      }

      const out   = {
        Y: output == "date" ? 1 : 0,
        y: 0,
        year_short: 0,
        mo: output == "date" ? 1 : 0,
        "0mo": "",
        M: "",
        month_long: "",
        month_short: "",
        d: output == "date" ? 1 : 0,
        D: "",
        "0d": "",
        day_of_year: 0,
        day_long: "",
        day_short: "",
        day_ordinal: "th",
        weekday: "",
        h: 0,
        h12: 0,
        "0h": "",
        day_half: "",
        m: 0,
        "0m": "",
        s: 0,
        "0s": "",
        e: r,
        season: ""
      };
      
      if (!r) { return out; }
      
      // months & years
      let months = 0;
      let total_days = 0;
      while (true) {
        const year  = out.Y + Math.floor(months / this.MONTHS.length);
        const moy   = months % this.MONTHS.length;
        const month = this.MONTHS[moy];
        const days  = this.getMonthLength(month,year);
        if (r >= (days * this.dl)) {
          r -= (days * this.dl);
          if (moy == 0) { out.day_of_year = days } else { out.day_of_year += days; }
          total_days += days;
        } else {
          out.Y           = year;
          out.year_short  = out.y = out.Y % 100;
          out.mo          = moy + 1;
          out.month_long  = out.M = month.name;
          out.month_short = month.short ?? month.name.substring(0,3);
          out.season      = month.season ?? "";
          break;
        }
        months ++;
      }
      out["0mo"] = out.mo < 10 ? `0${out.mo}` : out.mo;
      
      // days
      out.d += Math.floor(r / (this.dl));
      out.day_of_year += out.d;
      out.day_ordinal = this.getOrdinal(out.d);
      out["0d"] = out.d < 10 ? `0${out.d}` : out.d;
      r = r % (this.dl);
      
      // day of week
      out.weekday   = ((out.Y * this.YEAR_LENGTH) + out.day_of_year + this.WEEK_START) % this.DAYS.length;
      out.day_long  = out.D = this.DAYS[out.weekday];
      out.day_short = out.day_long.substring(0,2);
      
      // hours
      out.h = Math.floor(r / (this.hl));
      out.h12 = out.h % Math.floor(this.DAY_LENGTH / 2);
      out.day_half = out.h > 12 ? "pm" : "am";
      out["0h"] = out.h < 10 ? `0${out.h}` : out.h;
      r = r % (this.hl);
      
      // minutes
      out.m = Math.floor(r / this.MIN_LENGTH);
      out["0m"] = out.m < 10 ? `0${out.m}` : out.m;
      r = r % (this.MIN_LENGTH);
      
      // seconds
      out.s = r;
      out["0s"] = out.s < 10 ? `0${out.s}` : out.s;

      // caching
      this.cache.time = initial;
      this.cache.value = out;
      
      return out;
    }
    
    getRealDate() {
      const date = new Date(); // use whatever timezone the user is in
      const s    = date.getSeconds();
      const m    = date.getMinutes();
      const h    = date.getHours();
      const d    = date.getDate();
      const mo   = date.getMonth() + 1;
      const y    = date.getFullYear();
      return `${y}y ${mo}mo ${d}d ${h}h ${m}m ${s}s`;
    }
    
    getYearLength(year) {
      if (this.equal_years) return this.YEAR_LENGTH;
      let days = 0;
      for (let month of this.MONTHS) {
        days += this.getMonthLength(month,year);
      }
      return days;
    }
    
    getMonthLength(month,year=0) {
      if (this.equal_years) return month.length;
      if (month.leap_century && !(year % 100)) {
        // it's a century, and month has a leap_century rule
        for (const leap_cond of month.leap_century) {
          if (year % leap_cond[0] == 0) {
            return leap_cond[1];
          }
        }
      }
      else if (month.leap && ((month.leap_century && year % 100) || !month.leap_century)) {
        for (const leap_cond of month.leap) {
          if (year % leap_cond[0] == 0) {
            return leap_cond[1];
          }
        }
      }
      return month.length;
    }
    
    dateFormat(format,date) {
      const d = this.getDate(date);
      if (!format || format == "short") {
        return `${d.d}-${d.mo}-${d.Y}`;
      }
      else if (format == "long") {
        return `${d.day_long} ${d.d}${d.day_ordinal} ${d.month_long} ${d.Y}`;
      }
      else if (format == "datetime") {
        return `${d.day_long} the ${d.d}${d.day_ordinal} of ${d.month_long}, ${d.Y} ${d['0h']}:${d['0m']}:${d['0s']}`;
      }
      else if (format == "time") {
        return `${d['0h']}:${d['0m']}:${d['0s']}`;
      }
      else {
        return format.replaceAll(/\[([A-Z0-9a-z_]+)\]/g, (match, capture) => {
          return d[capture] ?? '';
        });
      }
    }
    
    getOrdinal(n) {
      if (n > 10 && n < 20) { return "th" }
      let c = n.toString().slice(-1);
      switch (c) {
        case "1":
          return "st";
        case "2":
          return "nd";
        case "3":
          return "rd";
        default:
          return "th";
      }
    }
    
    datePeriod(span, separator = ' ', last_separator) {
      // given a timespan, format it
      const s = this.getDate(span, "period");
            s.mo = Math.max(0,s.mo - 1);
      const parts = ["y","mo","d","h","m","s"];
      let out = [];
      for (const part of parts) {
        if (s[part]) {
          out.push(s[part] + ' ' + (s[part[0]] > 1 ? this.PERIODS[part][1] : this.PERIODS[part][0]));
        }
      }
      if (last_separator && out.length > 1) {
        let last = out.pop();
        return out.join(separator) + last_separator + last;
      }
      return out.join(separator).trim();
    }
    
  }
  
  /* --------------------------- */
  /* UTILITY                     */
  /* --------------------------- */

  window.dateargs = function(args) {
    if (setup.datesystems[args[args.length - 1]]) {
      // last arg is a datesystem
      let ds = args[args.length -1];
      return { args: args.slice(0,-1), datesystem: setup.datesystems[ds], varname: setup.datesystems[ds].varname };
    } else {
      return { args: args, datesystem: setup.datesystems["default"], varname: setup.datesystems["default"].varname }
    }
  }
  
  /* --------------------------- */
  /* MACROS                      */
  /* --------------------------- */
  
  Macro.add('date', {
    handler: function handler() {
      let dateargs = window.dateargs(this.args);
      if (!dateargs.datesystem) throw new Error("Please set up the datesystem with <<datesetup>> before using <<date>>");
      this.output.append(dateargs.datesystem.dateFormat(dateargs.args[0],dateargs.args[1]));
    }
  });
  
  Macro.add('dateset', {
    handler: function handler() {
      let dateargs = window.dateargs(this.args);
      if (!dateargs.datesystem) throw new Error("Please set up the datesystem with <<datesetup>> before using <<date>>");
      let new_time = dateargs.datesystem.setToTime(dateargs.args[0]);
      variables()[dateargs.datesystem.varname] = new_time - dateargs.datesystem.BASE_TIME;
    }
  });
  
  Macro.add('dateto', {
    handler: function handler() {
      let dateargs = window.dateargs(this.args);
      if (!dateargs.datesystem) throw new Error("Please set up the datesystem with <<datesetup>> before using <<dateto>>");
      let new_time = dateargs.datesystem.moveToTime(dateargs.args[0]);
      variables()[dateargs.datesystem.varname] = new_time - dateargs.datesystem.BASE_TIME;
    }
  });
  
  Macro.add('dateadd', {
    handler: function handler() {
      let dateargs = window.dateargs(this.args);
      if (!dateargs.datesystem) throw new Error("Please set up the datesystem with <<datesetup>> before using <<dateadd>>");
      variables()[dateargs.datesystem.varname] += dateargs.datesystem.dateToTime(dateargs.args[0],{ type: "add" });
    }
  });
  
  Macro.add('datesubtract', {
    handler: function handler() {
      let dateargs = window.dateargs(this.args);
      if (!dateargs.datesystem) throw new Error("Please set up the datesystem with <<datesetup>> before using <<datesubtract>>");
      let new_time = dateargs.datesystem.dateToTime(dateargs.args[0],{ type: "add", direction: "backward" });
      variables()[dateargs.datesystem.varname] = Math.max(0,variables()[dateargs.datesystem.varname] - new_time);
    }
  });
  
  Macro.add('datenext', {
    handler: function handler() {
      let dateargs = window.dateargs(this.args);
      if (!dateargs.datesystem) throw new Error("Please set up the datesystem with <<datesetup>> before using <<datenext>>");
      let new_time = dateargs.datesystem.dateNext(dateargs.args[0]);
      variables()[dateargs.datesystem.varname] = new_time - dateargs.datesystem.BASE_TIME;
    }
  });
  
  Macro.add('datereset', {
    handler: function handler() {
      let dateargs = window.dateargs(this.args);
      if (!dateargs.datesystem) throw new Error("Please set up the datesystem with <<datesetup>> before using <<datereset>>");
      variables()[dateargs.datesystem.varname] = 0;
      let new_time = dateargs.datesystem.setToTime(dateargs.args[0]);
      dateargs.datesystem.BASE_TIME = new_time;
    }
  });
  
  Macro.add('dateperiod', {
    handler: function handler() {
      let dateargs = window.dateargs(this.args);
      if (!dateargs.datesystem) throw new Error("Please set up the datesystem with <<datesetup>> before using <<dateperiod>>");
      this.output.append(dateargs.datesystem.datePeriod(dateargs.args[0],dateargs.args[1],dateargs.args[2]));
    }
  });
  
  Macro.add('dateticker', {
    handler: function handler() {
      let dateargs = window.dateargs(this.args);
      if (!dateargs.datesystem) throw new Error("Please set up the datesystem with <<datesetup>> before using <<dateticker>>");
      const $ticker = $("<div class='macro-dateticker'>");
      const format  = dateargs.args[0] ?? "[0h]:[0m]:[0s]";
      const ds      = dateargs.datesystem.systemname; // use the key so we survive passage transitions
      $ticker.html(dateargs.datesystem.dateFormat(format));
      $ticker.appendTo(this.output);
      
      const ticker  = setInterval(function() {
        if (document.contains($ticker[0])) {
          variables()[setup.datesystems[ds].varname] += setup.datesystems[ds].dateToTime("1s");
          $ticker.html(setup.datesystems[ds].dateFormat(format));
        } else {
          clearInterval(ticker);
        }
      },1000); 
    }
  });
  
  Macro.add('datesetup', {
    handler: function handler() {
      let dateargs = {};
      if (this.args[0]) {
        if (typeof this.args[0] == "string") { 
          dateargs.base_time = this.args[0];
        } else if (typeof this.args[0] == "object") {
          dateargs = this.args[0];
        } else {
          throw new Error("The first argument to <<datesetup>> must either be a default base_time, or a config object");
        }
      }
      let ds = new DATESYSTEM(dateargs);
      setup.datesystems = setup.datesystems ?? {};
      setup.datesystems[ds.systemname] = ds;
    }
  });
})();