## Custom Datesystems

You may create multiple date systems in the same game with multiple calls to `<<datesetup>>` provided that you give a unique `systemname` in the options for each system. e.g.

```html
<<set _datesetup = {
    base_time: "now",
    name: "solar"
}>>
<<datesetup _datesetup>>
```

The point of doing this, is to allow you to create your own calendars with different months, year lengths, or day names, such as a lunar calendar, a fantasy calendar, or even the French revolutionary decimal calendar (see below — with thanks to @Maliface).

### Custom Datesystem Arguments

There are many values you can pass to set up your custom calendar. Anything you don't specify as different will take the default Gregorian values. For example, if you only want to change the names of the weekdays, you only need to pass `days`.

The following block shows the default values for the Gregorian calendar.

```js
{
    name: "default",
    min_length: 60,
    hour_length : 60,
    day_length : 24,
    days : [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    week_start: 5,
    months : [
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
    ],
    periods: { 
        y: ["year","years"], mo: ["month","months"], d: ["day","days"], h: ["hour","hours"], m: ["minute","minutes"], s: ["second","seconds"]
    }
    year_starts: { 1: 3, 325: 6, 1752: 5 }
}
```
The `name` argument defines the name of the Datesystem. This is the `system-id` argument to use in all of the date system macros, the key in `setup.datesystems` that contains the DATESYSTEM object, and the prefix of the story variable containing the system's time variable. 

e.g. if you pass `solar` as the `name` argument, the DATESYSTEM will be saved in `setup.datesystem.solar` and the time variable will be `$solar-time`.

The other system definition values are as follows:

```
    min_length:   The number of seconds in a minute
    hour_length:  The number of minutes in an hour
    day_length:   The number of hours in a day
    days:         The names of each day of the week
    week_start:   The weekday on which day 1 of your calendar starts
    months:       An array of month information
    periods:      Singular and plural names for each of your time units (as used by <<dateperiod>>)
    year_offset:  An int value to add to the returned year (see below)
```

For `months`, the `length` value is the number of days in a non-leap year, and the `season` is the name of the season (as returned by `[season]`).

For `year_offset` the value is a fixed number of years to add to the value returned by `getDate()`. Use this when you wish to use some SF date system set far into the future, which also has leap years, to reduce the calculation required. For example, if your game is set in the year 40,000, you might set `year_offset` to 40000, so that your zero-year counts from there. If your system does not have leap years, you probably do not need to do this.

`year_starts` is a magic value to cope with the fact that at different periods, different calendars were in use to determine the day of the week. It's only needed for the Gregorian calendar, for a custom datesystem, set it to `{}`

## Intercalary Months

Intercalary months, for year-length adjustments, or for special festivals, can be defined in a number of ways.

### Special Days of the Week

Some months may interrupt the normal days of the week for some specially named days, or can override the days of the month without interrupting the sequence. You can use the following rules to specify this:

* `skip_day_sequence` mandates that the days in this month don't count towards the normal cycle of days
* `special_days` defines an array of day names that override the normal day names

If a month has only `special_days` set, then alternate names are used for its days, but the day sequence continues as normal. e.g.

```js
        { name: "Firstmonth"  , length: 10, season: "winter" }, 
        { name: "Secondmonth" , length: 2, season: "winter", special_days: [ "Oneday", "Twoday" ] }, 
        { name: "Thirdmonth"  , length: 10, season: "winter" }, 
```

If the last day of Firstmonth is a Monday, the next day is Oneday, the day affter Twoday, and the day after (the first of Thirdmonth) a Thursday.

```js
        { name: "Firstmonth"  , length: 10, season: "winter" }, 
        { name: "Secondmonth" , length: 2, season: "winter", skip_day_sequence: true, special_days: [ "Oneday", "Twoday" ] }, 
        { name: "Thirdmonth"  , length: 10, season: "winter" }, 
```

If the last day of Firstmonth is a Monday, the next day is Oneday, the day affter Twoday, and the day after (the first of Thirdmonth) a Tuesday — i.e. the special days of Secondmonth are skipped for deciding the day of the week.

### Leap Years

The Datesystem will run significantly faster if your calendar has no leap-days. However, if this is not possible (as it is not possible in the default Gregorian calendar) then you can specify the leap day rules as follows:

For any month that has a varying number of days:

* `leap` defines an array of rules to match based on the current year
* `leap_century` defines an array of rules to match based on the current year if it is a century year

Each rule is an array of two elements, a number, and a day length. If the year is evenly divisible by the number, then the month length will be set to the second value. If there are multiple rules, the first will match. If a month has both a `leap` and `leap_century` rule, the leap rule will *not* be applied if the year in question is a century (i.e. only the leap_century rule will apply). Any number of months may have leap rules.

**Example**
```js
{ name: "February" , length: 28, season: "winter", leap_century: [[400,29]], leap: [[4,29]] }
```
In the standard calendar, February is 28 days long. In centuries divisible by 400, or non-centuries divisible by 4, it is 29 days instead.

## Synchronising Datesystems

Although each Datesystem keeps its own time variable by default, you can easily change that by setting `DATESYSTEM.varname` to the same value. 

**Example**
```html
<<datesetup `{
    systemname: "solar",
    ...
}`>>
<<datesetup `{
    systemname: "lunar",
    ...
}`>>
<<set setup.datesystems.lunar.varname = "solar-time">>
```

## Example Calendars
### French Republican Calendar (with leap years)
```html
<<nobr>><<datesetup `{
    name: "RepCalendar",
    day_length : 10,
    hour_length : 100,
    min_length : 100,
    days : ['Primidi','Duodi','Tridi','Quartidi','Quintidi','Sextidi','Septidi','Octidi','Nonidi','Décadi'],
    months : [
        { name: 'Vendémiaire', length: 30, season: 'autumn'}, 
        { name: 'Brumaire', length: 30, season: 'autumn'}, 
        { name: 'Frimaire', length: 30, season: 'autumn'},
        { name: 'Nivôse', length: 30, season: 'winter'}, 
        { name: 'Pluviôse', length: 30, season: 'winter'}, 
        { name: 'Ventôse', length: 30, season: 'winter'}, 
        { name: 'Germinal', length: 30, season: 'spring'}, 
        { name: 'Floréal', length: 30, season: 'spring'}, 
        { name: 'Prairial', length: 30, season: 'spring'}, 
        { name: 'Messidor', length: 30, season: 'summer'}, 
        { name: 'Thermidor', length: 30, season: 'summer'}, 
        { name: 'Fructidor', length: 30, season: 'summer'}, 
        { name: 'Sansculottides', length: 5, season: 'none', leap_century: [[400,6]], leap: [[4,6]]}
    ],
    year_starts: {}
}`>><</nobr>>
```
### Approximate Lunar Calendar
```html
<<nobr>><<datesetup `{
    name: "lunar",
    days : [
        'new',
        'waxing crescent','waxing crescent','waxing crescent','waxing crescent','waxing crescent',
        'first quarter','first quarter',
        'waxing gibbous','waxing gibbous','waxing gibbous','waxing gibbous','waxing gibbous',
        'full','full',
        'waning gibbous','waning gibbous','waning gibbous','waning gibbous','waning gibbous',
        'last quarter','last quarter',
        'waning crescent','waning crescent','waning crescent','waning crescent','waning crescent',
        'new'
    ],
    months : [
        { name: "Full", length: 30, },
        { name: "Hollow", length: 29, },
        { name: "Full", length: 30, },
        { name: "Hollow", length: 29, },
        { name: "Full", length: 30, },
        { name: "Hollow", length: 29, },
        { name: "Full", length: 30, },
        { name: "Hollow", length: 29, },
        { name: "Full", length: 30, },
        { name: "Hollow", length: 29, },
        { name: "Full", length: 30, },
        { name: "Hollow", length: 29, },
    ],
    year_starts: {}
}`>><</nobr>>
```
### Discworld
```html
<<nobr>><<datesetup `{
    name: "discworld",
    days : [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Octday" ],
    months : [
        { name: "Ick",      length: 16, },
        { name: "Offle",    length: 32, },
        { name: "February", length: 32, },
        { name: "March",    length: 32, },
        { name: "April",    length: 32, },
        { name: "May",      length: 32, },
        { name: "June",     length: 32, },
        { name: "Grune",    length: 32, },
        { name: "August",   length: 32, },
        { name: "Spune",    length: 32, },
        { name: "Sektober", length: 32, },
        { name: "Ember",    length: 32, },
        { name: "December", length: 32, },
    ],
    year_starts: {}
}`>><</nobr>>
```

### Warhammer 40k

Warhammer doesn't actually *have* a custom calendar, it uses the Gregorian system, counting from 1AD, but it does have a way of expressing dates that's a bit different.
```html
<<nobr>><<datesetup `{
    year_offset: 40000
}`>><</nobr>>
```
To output a 40k style date/time:
```html
<<set _gd = setup.datesystems.default.getDate()>>
<<= Math.floor(_gd.day_of_year * 24 + _gd.h * 0.11407955)  + '.' + _gd.Y.toString().substring(3).padStart(3,'0') +'.M' +  (_gd.year_mil + 1)>>
```