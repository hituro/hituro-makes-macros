## Schedules

Schedules are an optional add-on to the Datesystem, allowing you to create lists of events that you can then check against the current time (or, optionally, a time you supply) to see if they are occurring or not.

**Basic Example**
```html
<<schedule "$myschedule">>                       // create a schedule
    <<event "country fair" "5mo 1d -> 5mo 7d">
<</schedule>> 
<<addevent "$myschedule" "birthday" "5mo 12d">>  // add an event to an existing schedule
<<removeevent "$myschedule" "birthday">>         // remove an event from an existing schedule
<<if $myschedule.check("country fair")>>         // check to see if an event is happening
<<for _event range $myschedule.events()>>        // get a list of currently happening events
```

### Installation

Add the contents of schedule.js to your story Javascript.

## Basic Concepts

A Schedule contains a list of events, along with the date/times they happen at. An event can have a single date (like "Thursday" or "June 5th"), or a start and end time (like "1st-10th of December"). Each event in a schedule has a unique ID (it's name). Event names can be duplicates across different Schedules if you like.

Each Schedule is attached to a specific datesystem. If you have more than one, you can have schedules attached to each.

Each Schedule is stored in a story or temporary variable. You can use that variable to check for events happening at the current time. 

## Creating a Schedule

You can create a Schedule using the `<<schedule>>` macro. Each individual event gets its own `<<event>>` entry inside. For example, here's a schedule showing where some NPC is on each day of the week. It creates a Schedule and puts it in the story variable `$bob`.

```html
<<schedule "$bob">>
    <<event "work" "Monday[D]">>
    <<event "college" "Tuesday[D]">>
    <<event "cafe" "Wednesday[D]">>
    <<event "home" "Thursday[D]">>
<</schedule>>
```

Event names have to be unique on a schedule, but you can give an array of values for when it happens if the same event can happen on multiple days.

```html
<<schedule "$bob">>
    <<event "work" `["Monday[D]","Tuesday[D]","Wednesday[D]","Thursday[D]"]`>>
    <<event "cafe" "Friday[D]">>
    <<event "home" `["Saturday[D]","Sunday[D]"]`>>
<</schedule>>
```

Alternatively you can specify a range of dates by separating the start and end dates with ` -> `, for example:

```html
<<schedule "$bob">>
    <<event "college" "1mo -> 6mo">>
    <<event "home"    "7mo -> 9mo">>
<</schedule>>
```

And you can combine these techniques.

```html
<<schedule "$bob">>
    <<event "college" `["1mo -> 6mo", "10mo -> 12mo 20d" ]`>>
    <<event "home"    "7mo -> 9mo">>
<</schedule>>
```

> [!NOTE]
> You can't use day/month/hour names (e.g. `Thursday[D]`) in a date range, only the standard `y/mo/d/h/m/s` indicators.
> `Thursday[D] -> Saturday[D]` is not valid.

You can create the same Schedule using javascript by creating a new `Schedule` object and assigning it to a variable.

```js
State.variables.bob = new Schedule({
    college: [ "1mo -> 6mo", "10mo -> 12mo 20d" ],
    home: "7mo -> 9mo"
});
```

### Event Specifiers

The following sort of event specifiers are legal:

* A full or partial date/time using the normal **Time Format**. e.g. "2024y 7mo" or "10h 30m"
* A range of two partial date/times in normal **Time Format**, separated by `->`. e.g. "1mo -> 6mo". The space is not optional
* Any other valid date format element in `[]`. e.g. "Thursday[D]", "June[M]", "7[mo]", "07[0h]"
* An array of event specifiers. e.g. `["7mo 1d","7mo 2d","9mo 10d"]`

## Checking a Schedule

You can check whether a particualr event is currently active using the `check()` method of a Schedule. e.g.
```html
<<if $bob.check("home")>> ... <</if>>
```

You can instead get a list of active events using the `events()` method.
```html
<<for _event range $bob.events()>>
    _event.name is active
<</for>>
```

The `events()` method accepts an optional time (either a timestamp or a **Time Format**) if you want to check a time other than the current one.

---
## Macros

### `<<schedule>>`

Syntax: `<<schedule "schedule" [system-id]>><event ...>><</schedule>>`
Syntax: `<<event "name" "when">>`

Create a new schedule. The first argument is the variable name in which you would like the schedule to be stored, including the `$` or `_` sigil (e.g. "$myvarname" or "_tempname"). The optional second argument allows you to attach the schedule to a datesystem other than "default".

#### `<<event>>`

The body of the `<<schedule>>` should be one or more `<<event>>`s. Each `<<event>>` specifies the name of the event (which must be unique to that schedule) in the first argument, and when it should happen in the second argument. The second argument must be:

* A string indicating a partial date, or a range of dates: e.g. "7mo" or "7mo -> 8mo"
* An array of date strings

See [Event Specifiers](#event-specifiers) above for more details.

### `<<addevent>>`

Syntax: `<<addevent "schedule" "event" "when">>`

Adds an additional event to an existing schedule. The first argument is the variable name holding the schedule, the second and third arguments are the same as those to `<<event>>`. e.g. `<<addevent "$bob" "party" "2024y 7mo 12d">>`. This is equivalent to `<<run $bob.add('party',"2024y 7mo 12d")>>`.

### `<<removeevent>>`

Syntax: `<<removeevent "schedule" "event">>`

Removes an event from an existing schedule. The first argument is the varibale name holding the schedule, the second is the name of the event to remove. e.g. `<<removeevent "$bob" "party">>`. This is euivalent to `<<run delete $bob.schedule.party>>`.

---
## Classes

### `Schedule`

The core class of this extension. Holds a schedule.

### Properties
#### `Schedule.ds`
A reference to the datesystem that the schedule relates to.

#### `Schedule.schedule`
An object containing the schedule. Each event name is a key of that object.

### Methods
#### `Schedule.add()`

Syntax: `Schedule.add(event, when)`

Add an event to the schedule. The first argument is the name of the new event (which must be unique to the schedule), the second is the time specification, either as a string or an array of strings.

#### `Schedule.check()`

Syntax: `Schedule.check("event_name", [date])`

Returns true if the specified event is happening at the current date. You can supply your own date. If not, the current date of the associated datesystem is used.

#### `Schedule.events()`

Syntax: `Schedule.check([date])`

Returns an array of events active at the current date. You can supply your own date. If not, the current date of the associated datesystem is used.