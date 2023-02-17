## DATESYSTEM Macros

The Datesystem macros are intended to provide an entire date/time system, capable of imitating a Gregorian calendar, or supporting an entirely custom date/time system. It offers a variety of macros, and corresponding JS functions.

**Basic Example**
```html
<<datesetup>>         // create a datesystem
<<dateset "now">>     // set the time to the current time and date
<<date "datetime">>   // print out the time and date
```

### Installation

Add the contents of date.js to your story Javascript.

Place the `<<datesetup>>` macro in your **StoryInit**.

## Basic Concepts

The Datesystem macros create and access a DATESYSTEM object, which lives in `setup.datesystems`. A datesystem contains the definitions of a system of date and time — months, weeks, day names, leap years, seasons, etc. Dates and times are represented by the number of seconds that have passed since the start of your calendar (i.e. day 1 of month 1 of year 1). When you create a new Datesystem, its BASE_TIME (by default, `setup.datesystem.default.BASE_TIME`) represents the date and time at the start of the game, while a story variable (by default, `$time`) holds the time that has passed in the game since it began.

### Time Format

Dates and times provided to the various macros in the date system use the following notation:

```
0y 0mo 0d 0h 0m 0s
```

Where `0` is any positive whole number. e.g. a timespan of 1 day and 5 hours would be `1d 5h`, an absolute date of 1st January 2000 would be `2000y 1mo 1d`. Note that this notation covers two situations, _absolute_ dates (such as `1900y 2mo 3d 10h`) and _timespans_ (such as `3mo`). When supplying date values to the datesystem macros, you will always use this format.

### Story Variables

The date and time associated with a date system are stored as a single numerical value in a story variable. By default this is `$time`. (See [`<<datesetup>>`](#datesetup) for more details on custom date systems)

### Base and Elapsed Time

When you create a datesystem, you can set a base time, which is the starting time of your game. The `DATESYSTEM.elapsed` property tells you how much time has passed since that start time (i.e. base time - $time).

## Creating a Datesystem

To create a datesystem, you must always use `<<datesetup>>`. Generally, you will want to place this in **StoryInit**.

### `<<datesetup>>`

Syntax: `<<datesetup ["time format"] [{options}]>>`

A call to `<<datesetup>>` with no arguments will create a new Gregorian calendar system, with the current date set to 1st Jan 1AD. `$time` will equal 0.

You can pass a **base time** as a string, using the time format, in which case that will be the starting date. e.g. `<<datesetup "2000y 5mo 3d">>`. Passing `"now"` as the base time will set the starting date/time to the current real-world date and time in the user's timezone.

Instead of a base time string, you can pass an options object. This can allow you to create an entire custom time system. For more details see [Custom Datesystems](custom_datesystems.md).

The datesystem object will be stored in `setup.datesystems[systemname]`. If you have not passed a custom name, it will be `setup.datesystems.default`. `setup.datesystem.default.BASE_TIME` is a number of seconds (counting from the start of your date system) representing the base time. `setup.datesystem.default.varname` is the name of the story variable holding your current game time (e.g. `time`).

---
## Macros

For all of the following macros, you may pass an additional argument specifying which datesystem to use. This must be the final argument. e.g. if one of your datesystems is called "lunar", all of the following are legal: `<<date "lunar">>`, `<<date "format" "lunar">>`. The example syntax shows this argument as `[system-id]`

### `<<date>>`

Syntax: `<<date ["format"] [system-id]>>`

The `<<date>>` macro outputs the current date and time. If you do not specify a format, it will output the current short date as a "d-m-yyyy".

You can pass a format to the macro to control the output. Formats can be "short" (the default), "long" (day-name 0th month-name yyyy), "datetime" (day-name the 0th of month-name, yyyy hh:mm:ss), or "time" (hh:mm:ss). Alternatively you can supply your own custom format, such as `[d][mo] [season]`. Text inside `[]` is treated as a token and replaced if it matches a valid token name, other text is left alone. The following tokens are available:

```
    Y              — Year, all digits (e.g. 2001)
    y              — Year, two digits (e.g. 01)
    year_short     — Same as 'y'
    year_sep       — Year, all digits, with separators (useful for 5-digit years)
    year_mil       — The millenium part of the year (e.g. 2)
    mo             — Month, in digits (e.g. 12)
    0mo            — Month, prefixed with 0s if less than 10
    M              — Month, full name
    month_long     — Same as 'M'
    month_short    — First three letters of month
    d              — Day, in digits
    0d             — Day, prefixed with 0s if less than 10
    D              — Weekday, full name
    weekday        — Weekday, in digits
    day_long       - Same as 'D'
    day_short      — First two letters of Day
    day_ordinal    — st/nd/rd as appropriate for day
    day_of_year    — Day count from first day of year
    day_half       — am/pm
    h              — Hour, in digits
    0h             — Hour, prefixed with 0s if less than 10
    h12            — Hour, counting up to half way through the day length
    0h12           — Hour, prefixed with 0s if less than 10
    m              — Minute, in digits
    0m             — Minute, prefixed with 0s if less than 10
    s              — Second, in digits
    0s             — Second, prefixed with 0s if less than 10
    e              — Number of seconds since second 0 (same as $time)
    season         — Season, as text
```

**Example**
```html
<<dateset "2000y 2mo 12d 15h 5m">>

<<date>>                   // outputs "12/2/2000"
<<date "long">>            // outputs "Friday 12th February 1000"
<<date "datetime">>        // outputs "Friday the 12th of February, 2000 15:05:00"
<<date "time">>            // outputs "15:05:00"
<<date "the [d][day_ordinal] of [mo] in the [season] season">> // outputs "the 12th of February in the winter season"
```

If you want to format a date in a way more complex than `<<date>>` allows, you can use the `DATESYSTEM.getDate()` method ([see below](#getdate)).


### `<<dateset>>`

Syntax: `<<dateset "absolute date" [system-id]>>`

The `<<dateset>>` macro lets you set an absolute date or time. e.g. `<<dateset "2000y 10mo 3d">>` (3rd day of the 10th month of year 2000). If you omit the year, month, or day, they will be assumed to be 1. If you omit the hour, minute or second, they will be assumed to be 0.

`<<dateset>>` sets the `$time` variable. If you set a time before the 0 date of your system, the result is undefined. If you wish to move the base date of your system as well, see `<<datereset>>`. To set a partial date, see `<<dateto>>`.

**Example**
```html
<<link "Travel in time">>
    <<datenext "1112y 5mo 12d 9h 0m 0s">>
<</link>>
```

### `<<dateto>>`

Syntax: `<<dateto "absolute date" [system-id]>>`

The `<<dateto>>` macro is similar to `<<dateset>>` but it handles missing date parts differently. For `<<dateto>>` any missing part is assumed to be the same as the current date. For example, if the current date/time is "2000y 1mo 1d 15h 0m 0s", `<<dateto "7mo 2d">>` will set the date to "2000y 7mo 2d 15h 0m 0s".

As with `<<dateset>>`, setting the time to earlier than the 0 date of your system is undefined. If you wish to move the base date of your system, see `<<datereset>>`. To set a full date, see `<<dateset>>`.

**Example**
```html
<<link "Visit the fox on his birthday">>
    <<dateto "5mo 12d">>
<</link>>
```

### `<<dateadd>> <<datesubtract>>`

Syntax: `<<dateadd/datesubtract "timespan" [system-id]>>`

The `<<dateadd>>` and `<<datesubtract>>` macros increment or decrement the current time by the value provided. e.g. `<<dateadd "1s">>` increases time by 1 second. The value provided is a _timespan_. `<<dateadd "1d">>` moves time forward by 1 day, rather than setting the day to 1.

`<<datesubtract>>` will not move the time below 0 (i.e. the first second of your date/time system). If you wish to move the base date of your system, see `<<datereset>>`.

**Example**
```html
<<link 'Collect berries - 5 minutes'>>
  <<dateadd '5m'>>
<</link>>
```

### `<<datenext>>`

Syntax: `<<datenext "single date unit" [system-id]>>`

The `<<datenext>>` macro will attempt to move time forward to the next whole unit of whatever type you have provided. e.g. `<<datenext "1d">>` will move the time forward to the first second of the next day. `<<datenext "1mo">>` will move the time forward to the first second of the first day of the next month.

**Example**
```html
<<link "Wait till noon">>
    <<datenext "12h>>
<</link>>
```

### `<<datereset>>`

Syntax: `<<datenext "absolute date" [system-id]>>`

The `<<datereset>>` macro acts like `<<dateset>>` but it additionally resets the _base time_ of your system, just like you had passed a value to `<<datesetup>>`. This will set `setup.datesystems[systemname].BASE_TIME` to your new date/time, and `DATESYSTEM.elapsed` to 0. If you just want to set a date without changing the base time, see `<<dateset>>`.

**Example**
```html
<<link "On the first day of the new century ...">>
    <<datereset "2000y 1mo 1d>>
<</link>>
```

### `<<dateperiod>>`

Syntax: `<<dateperiod seconds ["separator"] ["final separator"] [system-id]>>`

The `<<dateperiod>>` macro renders a timespan (in seconds) in a human readable format. e.g. `<<dateperiod 3601>>` will output "1 hour 1 second". You can use this to represent the duration between any two events in the date system. `<<dateperiod $time>>` will represent the span of time since the start of the game.

You can optionally pass a separator for the output. The default is ' '. You can also pass a final separator, which will be placed before the final value in the output. e.g. `<<dateperiod 6601 ", " " and ">>` will output "1 hour, 50 minutes and 1 second".

**Example**
```html
You spent <<dateperiod ($endTime - $startTime) ", " " and ">> in the forest, looking for mushrooms.
```

### `<<dateticker>>`

Syntax: `<<dateticker [format] [interval] [send-events] [system-id]>>`

The `<<dateticker>>` macro creates a constantly ticking clock on screen. As the clock ticks, it also updates the game time. The clock can be formatted using the same format strings as `<<date>>`. The default is `"time"`

You can specify a custom interval in the second argument by passing a time string. The default is `"1s"`. This controls how often the clock ticks *and* how much time is added.

The clock doesn't send `:dateupdated` events (see below) by default. Pass `true` as the third argument to have the clock trigger events.

**Example**
Make a 12hr clock that ticks once a minute and sends events.
```html
<<dateticker "[0h12]:[0m] [day_half]" "1m" true>>
```

---
## Events

Every time the time is updated by the use of a Datesystem macro, the `:dateupdated` event is fired (on document). The event passed with this event receives three special arguments:
```js
{
    system: (string), // the name of the datesystem
    from:   (int),    // timestamp before the change
    to:     (int),    // timestamp after the change
}
```

**Example**
```js
$(document).on(":dateupdated", function(e) {
  console.log(e.system+ " changed from " + e.from + " to " + e.to); 
});
```

---
## The DATESYSTEM Object

The DATESYSTEM object represents the date/time system you are using, and provides a set of methods for operating on it. When you use `<<datesetup>>` an instance of DATESYSTEM is created and stored in `setup.datesystems`. If you have just created a single default Datesystem, the object can be found at `setup.datesystems.default`.

As well as the methods described in the next section, the object exposes the following values:

```js
{
    systemname:  (string), // the name of the datesystem, which is also the key in setup.datesystems
    varname:     (string), // the name of the variable holding the timestamp of the system, defaults to 'time'
    MIN_LENGTH:  (int),    // number of seconds in a minute
    HOUR_LENGTH: (int),    // number of minutes in an hour
    DAY_LENGTH:  (int),    // number of hours in a day
    YEAR_LENGTH: (int),    // number of days in a a (non-leap) year
    YEAR_OFFSET: (int),    // value to add to the year (custom datesystems)
    hl:          (int),    // number of seconds in an hour
    dl:          (int),    // number of seconds in a day
    yl:          (int),    // number of seconds in a (non-leap) year
    MONTHS:      (array),  // an array of objects defining the months, see custom datesystems
    DAYS:        (array),  // an array of the names of days in a week
    WEEK_START:  (int),    // index of the start day of year 1 in the DAYS list
    PERIODS:     (obj),    // an object containing the singular and plural names of each time unit
    equal_years: (bool),   // true if there are no leap years in the system
    BASE_TIME:   (int),    // the base time of the system in seconds since day 1
    elapsed:     (int),    // the number of seconds between BASE_TIME and the current time
}
```

---
## Methods

Instead of using the macros, you can access a datesystem using methods of the appropriate DATESYSTEM object. If you have just created a single default Datesystem, the object can be found at `setup.datesystems.default`.

In the following examples, the datesystem will be represented as **DATESYSTEM**.

### `getDate()`

Syntax: `DATESYSTEM.getDate(timestamp, output = [date|period])`

Returns a date object, representing the timestamp (an int representing a number of seconds since the start of the date system) passed. The keys of this object are the same as the formats accepted by `<<date>>` (above), and `dateFormat()` (below).

By default, this is formatted as a date, i.e. the timestamp `0` is represented as `{ mo: 1, d: 1 ...}`. If you pass the string "period" as the second argument, it will format the result as a period (like the ones from `<<dateperiod>>`) instead. i.e. the timestamp `0` is represented as `{ mo: 0, d: 0 ...}`.

### `dateFormat()`

Syntax: `DATESYSTEM.dateFormat("format string",timestamp)`

Given a format string and a timestamp (an int representing a number of seconds since the start of the date system), returns a string in the same format as `<<date>>`.

e.g. `setup.datesystem.default.dateFormat("short",63103763100)` returns "5/9/2000"

### `setToTime()`

Syntax: `DATESYSTEM.setToTime("format string",[base])`

Given an absolute date (in the Datesystem format), returns a timestamp representing that date, in the same way as `<<dateset>>`. The optional second argument provides a date object (as returned by `getDate()`).

If you want to reproduce `<<datereset>>`, do:
```js
      variables()[DATESYSTEM.varname] = 0;
      let new_time = DATESYSTEM.setToTime(dateargs.args[0]);
      variables()[DATESYSTEM.varname] = DATESYSTEM.BASE_TIME = new_time;
```

### `moveToTime()`

Syntax: `DATESYSTEM.moveToTime("format string")`

Given a format string, returns a timestamp representing the current time moved forward to the next instance of that time, in the same way as `<<dateto>>`. Internally, `moveToTime()` constructs a new format string in the form "Xy Xmo Xd Xh Xm Xs" by combining the current date/time with whatever part of that string you supply in the first argument, and then passes it to `setToTime()`.

For example, given
```js
variables()[DATESYSTEM.varname] = DATESYSTEM.setToTime("2000y 2mo 5d 10h 9m 0s");
```
The following call:
```js
DATESYSTEM.moveToTime("5mo");
```
Will construct the string "2000y 5mo 5d 10h 9m 0s", pass it to `setToTime()` and return the new timestamp.

### `dateToTime()`

Syntax: `DATESYSTEM.dateToTime("format string", options = {})`

This is the most low-level time changing function. Given a format string representing a date/time it will calculate the representation of that date/time as a number of seconds since the start of the date system (0 seconds) and return that number. If you can use `moveToTime()` or `setToTime()`, you should prefer those over a call to `dateToTime()`, however if you wish to emulate `<<dateadd>>` and `<<datesubtract>>` you will need to use this function.

#### Options

The options object contains the following properties:
```js
{
    type: (string) "set" or "add" // defaults to "set"
    direction: (string) "forward" or "backward" // defaults to "forward"
    base: {date object} // as returned by getDate, defaults to the current tim
}
```
When `type` is "set", the format string will be treated as an absolute date. When it is "add", it will be treated as a timespan instead.
When `direction` is "forward", month lengths will be calculated going forward. When it is "backward", it will be calculated going backward.

To emulate `<<dateset>>`, call `dateToTime(datestring,{ type: "set", base: getDate(0,"date") })`, and set `$time` to the result
To emulate `<<dateadd>>`, call `dateToTime(datestring,{ type: "add" })`, and add the result to `$time`
To emulate `<<datesubtract>>`, call `dateToTime(datestring,{ type: "add", direction: "backward" })`, and subtract the result from `$time`

Note: You can always add seconds to `$time` directly.

### `dateNext()`

Syntax: `DATESYSTEM.dateNext("timespan",[timestamp])`

Given a format string representing a timespan, returns a timestamp representing the current time moved forward to the next whole instance of that unit, in the same way as `<<datenext>>`. Smaller units will be set to zero (e.g. if you set the hours, then the minutes and seconds will be set to 0). Unlike most of the other date functions, it only accepts a single unit specification. Thus you can call `dateNext("12h")` to move to the next noon, but not `dateNext("12 15m")`.

The optional second argument allows you to pass the timestamp (an int representing a number of seconds since the start of the date system) to move forward from, so you can chain calls to `dateNext()` to use multiple units. e.g. `dateNext("15m",dateNext("12h"))`.

### `datePeriod()`

Syntax: `DATESYSTEM.datePeriod(seconds,[separator],[last_separator])`

Given an int representing a number of seconds, returns a string expressing that number as a human-readable timespan, in the same way as `<<dateperiod>>`. The singular and plural names of each time unit are controlled by `DATESYSTEM.PERIODS`. 

e.g. `datePeriod(3601)` returns "1 hour 1 second"

You can specify a custom separator in the second argument (the default is ' '), and a special case separator for the final value in the third argument.

e.g. `datePeriod(6601,', ',' and ')` returns "1 hour, 50 minutes and 1 second"

### `dateCompare()`

Syntax: `DATESYSTEM.dateCompare("format string",target date)`

Given a format string and a date (the target date can be a format string, a timestamp, or a date object), returns true if they represent the same date, and false if they do not. Only the parts of the date given in the first argument are checked, so if you just pass a month and day, only the month and day of the target date are checked, if you only pass the year, only the year needs to match, and so forth.

**Example**
```html
<<if setup.datesystems.default.dateCompare("5mo 12d",$time)>>
    It's your birthday!
<</if>>
```

---
## Utility Methods
### `getYearLength()`

Syntax: `getYearLength(year)`

Given a year, returns the number of days in that year. e.g. `getYearLength(2023)` returns 365 in the default date system.

### `getMonthLength()`

Syntax: `getMonthLength(month,year)`

Given a month object (as in `DATESYSTEM.MONTHS`) and a year, returns the number of days in that month in that year. e.g. `getYearLength({ name: "January", length: 31},2023)` returns 31. If the month has leap-day conditions, those are evaluated to arrive at the number of days.

### `getOrdinal()`

Syntax: `getOrdinal(number)`

Given a number, returns the english ordinal suffix for that number. e.g. `getOrdinal(2)` returns "nd"

### `getRealDate()`

Syntax: `getRealDate()`

Returns a format string representing the current date and time according to the user's real timezone. e.g. on the 1st of May, 2023, at 5:15pm, `getRealDate()` returns "2023y 5mo 1d 17h 15m 0s"
