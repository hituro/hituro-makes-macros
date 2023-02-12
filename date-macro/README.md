## DATESYSTEM Macros

The Datesystem macros are intended to provide an entire date/time system, capable of imitating a Gregorian calendar, or supporting an entirely custom date/time system.

### Time Format

Dates and times provided to the various macros in the date system use the following notation:

```
0y 0mo 0d 0h 0m 0s
```

Where `0` is any positive whole number. e.g. a timespan of 1 day and 5 hours would be `1d 5h`, an absolute date of 1st January 2000 would be `2000y 1mo 1d`. Note that this notation covers two situations, _absolute_ dates (such as `1900y 2mo 3d 10h`) and _timespans_ (such as `3mo`). When supplying date values to the datesystem macros, you will always use this format.

### Story Variables

The date and time associated with a date system are stored as a single numerical value in a story variable. By default this is `$time`. (See [`<<datesetup>>`](#datesetup) for more details on custom date systems)

## Creating a Datesystem

To create a datesystem, you must always use `<<datesetup>>`. Generally, you will want to place this in **StoryInit**.

### `<<datesetup>>`

Syntax: `<<datesetup ["time format"] [{options}]>>`

A call to `<<datesetup>>` with no arguments will create a new Gregorian calendar system, with the current date set to 1st Jan 1AD. `$time` will equal 0.

You can pass a **base time** as a string, using the time format, in which case that will be the starting date. e.g. `<<datesetup "2000y 5mo 3d">>`. Passing `"now"` as the base time will set the starting date/time to the current real-world date and time in the user's timezone.

Instead of a base time string, you can pass an options object. This can allow you to create an entire custom time system. For more details see [Custom Timesystms](custom_datesystems.md).

The datesystem object will be stored in `setup.datesystems[systemname]`. If you have not passed a custom name, it will be `setup.datesystems.default`. `setup.datesystem.default.BASE_TIME` is a number of seconds (counting from the start of your date system) representing the base time. `setup.datesystem.default.varname` is the name of the story variable holding your current game time (e.g. `time`).

## Macros

### `<<date>>`

Syntax: `<<datesetup ["format"]>>`

The `<<date>>` macro outputs the current date and time. If you do not specify a format, it will output the current short date as a "d-m-yyyy".

You can pass a format to the macro to control the output. Formats can be "short" (the default), "long" (day-name 0th month-name yyyy), "datetime" (day-name the 0th of month-name, yyyy hh:mm:ss), or "time" (hh:mm:ss). Alternatively you can supply your own custom format, such as `[d][mo] [season]`. Text inside `[]` is treated as a token and replaced, other text is left alone. The following tokens are available:

```
    Y              — Year, all digits (e.g. 2001)
    y              — Year, two digits (e.g. 01)
    year_short     — Same as 'y'
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
    m              — Minute, in digits
    0m             — Minute, prefixed with 0s if less than 10
    s              — Second, in digits
    0s             — Second, prefixed with 0s if less than 10
    e              — Number of seconds since second 0 (same as $time)
    season         — Season, as text
```

---
### `<<dateset>>`

Syntax: `<<dateset "absolute date" [system-id]>>`

The `<<dateset>>` macro lets you set an absolute date or time. e.g. `<<dateset "2000y 10mo 3d">>` (3rd day of the 10th month of year 2000). If you ommit the year, month, or day, they will be assumed to be 1. If you ommit the hour, minute or second, they will be assumed to be 0.

`<<dateset>>` sets the `$time` variable _relative to your base date_ (as set in `<<datesetup>>`). If you set a time before the base date of your system, the result is undefined. If you wish to move the base date of your system, see `<<datereset>>`. To set a partial date, see `<<dateto>>`.

---
### `<<dateto>>`

Syntax: `<<dateto "absolute date" [system-id]>>`

The `<<dateto>>` macro is similar to `<<dateset>>` but it handles missing date parts differently. For `<<dateto>>` any missing part is assumed to be the same as the current date. For example, if the current date/time is "2000y 1mo 1d 15h 0m 0s", `<<dateto "7mo 2d">>` will set the date to "2000y 7mo 2d 15h 0m 0s".

As with `<<dateset>>`, setting the time to earlier than the base date of your system is undefind. If you wish to move the base date of your system, see `<<datereset>>`. To set a full date, see `<<dateset>>`.

---
### `<<dateadd>> <<datesubtract>>`

Syntax: `<<dateadd/datesubtract "timespan" [system-id]>>`

The `<<dateadd>>` and `<<datesubtract>>` macros increment or decrement the current time by the value provided. e.g. `<<dateadd "1s">>` increases time by 1 second. The value provided is a _timespan_. `<<dateadd "1d">>` moves time forward by 1 day, rather than setting the day to 1.

`<<datesubtract>>` will not move the time below 0 (i.e. the first second of your date/time system), and if it moves the time before the base date of your system, the rsult is undefined. If you wish to move the base date of your system, see `<<datereset>>`.

---
### `<<datenext>>`

Syntax: `<<datenext "single date unit" [system-id]>>`

The `<<datenext>>` macro will attempt to move time forward to the next whole unit of whatever type you have provided. e.g. `<<datenext "1d">>` will move the time forward to the first second of the next day. `<<datenext "1mo">>` will move the time forward to the first second of the first day of the next month.

---
### `<<datereset>>`

Syntax: `<<datenext "absolute date" [system-id]>>`

The `<<datereset>>` macro acts like `<<dateset>>` but it resets the _base time_ of your system, just like you had passed a value to `<<datesetup>>`. This will reset `$time` to 0 (and set `setup.datesystems[systemnam].BASE_TIME` to your new date/time). If you just want to set a date without changing the base time, see `<<dateset>>`. If you want to move the game time to a date/time _earlier_ than the base time set in `<<datesetup>>`, you must use `<<datereset>>` to do it.

---
### `<<dateperiod>>`

Syntax: `<<dateperiod seconds ["separator"] ["final separator]>>`

The `<<dateperiod>>` macro renders a timespan (in seconds) in a human readable format. e.g. `<<dateperiod 3601>>` will output "1 hour 1 second". You can use this to represent the duration between any two events in the date system. `<<dateperiod $time>>` will represent the span of time since the start of the game.

You can optionally pass a separator for the output. The default is ' '. You can also pass a final separator, which will be placed before the final value in the output. e.g. `<<dateperiod 6601 ", " " and ">>` will output "1 hour, 50 minutes and 1 second".

---
### `<<dateticker>>`

Syntax: `<<dateticker [format]>>`

The `<<dateticker>>` macro creates a constantly ticking clock on screen. As the clock ticks, it also updates the game time. The clock can be formated using the same format strings as `<<date>>`. The default is "time". 