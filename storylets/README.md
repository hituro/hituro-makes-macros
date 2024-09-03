# Mouse QBN (MQBN)

MQBN (Mouse QBN) is an implementation of storylet functionality (also called *Quality Based Narrative*, hence QBN) for the SugarCube story format. MQBN allows you to create events/encounters/snippets of story (storylets) and select them dynamically based on the current state of your game. 

For a deeper description of what storylets are (and are not), see below.

Credit is also due to Joshua Gram's [TinyQBN](https://github.com/JoshuaGrams/tiny-qbn) implementation for SugarCube which gave me much inspiration in writing my own.

### Installation ###

Add the contents of [mqbn.js](mqbn.js) to your story Javascript.

You must use the macro `<<storyletsinit>>` before using any MQBN functions. It is normal to put this in the **StoryInit** special passage.

> [!WARNING]
> There are breaking changes between v1.4 and v1.5 that might affect a saved game created under the earlier version, if you are using Sequences.

## Storylets ##

Storylets are a concept first introduced in Fallen London, and made popular in the Story Nexus engine that drove it. Rather than controlling a narrative with a fixed series of linked passages, storylets break gameplay into distinct segments, each with their own conditions for when they can appear. A classic example (for some reason) might be visiting a farm. Depending on the season you visit, different products might be for sale, or incidents happen. Each of those incidents (or indeed products) could be contained in a storylet whose two requirements are:

* Current location is the farm
* Current season is (whatever season)

MQBN provides an engine for defining and selecting storylets for your game.

If you prefer to start with a tutorial, take a trip to [MQBN Farm](TUTORIAL.md).

---
### Defining a Storylet

A storylet is defined by an object with at minimum a title:

```js
{
    title: "Haymaking",
}
```

You may also wish to add an optional description:

```js
{
    title: "Haymaking",
    desc: "It's haymaking time at the farm"
}
```

> [!NOTE] 
> You can also define storylets using a `<<storylet>>` macro in the storylet's starting passage. See the documentation on `<<storylet>>` and `<<storyletscan>>` below.

#### `passage` attribute

By default, a storylet relates to a passage of the same name as the storylet's title. For example, if the `<<storyletlink>>` macro pulled the storylet above, it would send you to a passage called **Haymaking**. You can send the player to a different passage by adding a `passage` attribute.

```js
{
    title: "Haymaking",
    passage: "cutting-hay",
    desc: "It's haymaking time at the farm"
}
```

Note that the specified passage is just the _entry point_ for the storylet. You can link to other passages in the normal way as much as you like, and you can have multiple storylets link to the same passage.

#### `id` attribute

Each storylet in a given store must have a unique id. By default, the id is the same as the title, but you may want to have multiple storylets with the same title (e.g. when presenting storylets as cards to be played, as Fallen London did). In this case you can provide an `id` attribute.

```js
{
    id: "haymaking-1",
    title: "Haymaking",
    passage: "cutting-hay",
    desc: "It's haymaking time at the farm"
}
```

#### `sticky` attribute

By default, storylets can only be chosen once in the course of a game, and then they are *used* and can't come up again. If you want a storylet to be available more than once, make it `sticky`. Our farming events can happen year after year, so it makes perfect sense for them to be sticky. The default value of sticky is false.

```js
{
    title: "Haymaking",
    desc: "It's haymaking time at the farm",
    sticky: true
}
```

#### `priority` attribute

By default, all storylets have equal priority. The choice of which one you get out of the eligible pool is random. If some particular storylet should always be amongst those chosen when it's available, give it a `priority`. Higher priority storylets will be chosen over lower priority ones when both are available. The default priority is 0.

```js
{
    title: "Haymaking",
    desc: "It's haymaking time at the farm",
    priority: 1
}
```

#### `weight` attribute

The `weight` attribute controls the order in which storylets selected by [getStorylets()](#getting-a-set-of-storylets) are returned. It has no effect on which storylets are selected, only the order in which they are shown. 

#### `link` attribute

The `link` attribute is used by the `<<storyletlink>>` macro as link text for a storylet. If not specified, the storylet's title is used instead.

#### `any` and `all` attributes

Use these attributes to specify conditions for the storylet to be avaialble. See [storylet conditions](#storylet-conditions) below.

> [!NOTE]
> You can specify other attributes on the storylet if you wish. Attributes other than the ones specified here are ignored.

### Storylet stores

A bank of storylets is referred to as a *store*, and is an array of one or more storylet objects. By default, MQBN expects to see a store called `setup.storylets`, but you can have multiple stores if you want. All stores should be stored on setup.

```html
<<set setup.storylets = [
    {
        title: "Haymaking",
        desc: "It's haymaking time at the farm"
    },
    {
        title: "Mowing",
        desc: "You are invited to help mow the fields"
    }
]>>
```

You can manually define storylets like shown above, or you can place them in their corresponding passages using the `<<storylet>>` macro, and the `<<storyletscan>>` macros ([see below](#storyletscan)).

### Storylet conditions

A storylet without conditions is always available. If you pick a storylet from a store where no storylet has conditions, you get a random one.

To specify conditions, add an `any` or `all` attribute to the storylet, which is an array of conditions. For an `any` condition, any of the conditions must match for the storylet to be picked, for `all` all of them must. A storylet can have both an any and all attribute (which means it is available if all of the `all` conditions match, and any of the `any`).

```js
{
    title: "Haymaking",
    desc: "It's haymaking time at the farm",
    all: [
        { type: "var", var: "$season",   value: "autumn" },
        { type: "var", var: "$location", value: "farm" }
    ]
}
```

There are many possible types of condition, which are listed below. You can also nest conditions using the `all` and `any` condition types, e.g.

```js
{
    title: "Haymaking",
    desc: "It's haymaking time at the farm",
    all: [
        { type: "var", var: "$season",   value: "autumn" },
        { type: "var", var: "$location", value: "farm" },
        { type: "any", any: [
            { type: "var", var: "$luck", op: "gt", value: 20 },
            { type: "rand", chance: 40 }
        ]}
    ]
}
```

### Condition types

#### `collection`
_Syntax_: `{ type: "collection", var: "$varname:, op: "|not", has: "value" }`

Check the value of a variable (either story, temporary, or setup) to see if it contains a value. The variable must be an array, a Map, a Set, or a generic object (in which case it will be checked to see if it has a matching attribute and that attribute is true). Set `op` to "not" to negate the check.

#### `function`
_Syntax_: `{type: "function", func: function() {condition, store} }`

Check the return value of a custom function, which should evaluate to true if the storylet is available. The function is passed the condition object, and the name of the storylet store.

#### `var`
_Syntax_: `{ type: "var", var: "$varname", op: "gt|gte|le|lte|eq|neq|includes|notincludes|has", value: "value" }`

Check the value of a variable (either story, temporary, or setup). The `op` (operator) condition controls how the value is compared to the variable. The `includes`, `notincludes`, and `has` operators let you check for array or map values, but see the `collection` condition.

#### `visited`
_Syntax_: `{ type: "visited", op: "|not", passage: "passageName" }`

True if a given passage has been visited (or with `op` "not", not visited) in the current play history.

#### `played` 
_Syntax_: `{ type: "played", op: "|not", story: "storyid" }`

True if a given storylet has already been played. Set `op` to "not" to negate the check. Note that the "storyid" will be the title of the given storylet unless you supplied a separate id value.

#### `pulls` 
_Syntax_: `{ type: "pulls", op: "|eq|neq|gt|lt|gte|lge", pulls: "number", store: "store" }`

True if some number of storylets (by default the operator is `gte`) have already been used from the indicated store. If no store is indicated then the same story as the storylet is used.

#### `rand`
_Syntax_: `{ type: "rand", chance: int }`

True if a random number from 1-100 is less than or equal to the supplied chance. You can use this to make a given storylet less likely than other eligible storylets of the same priority. For example given two storylets, one of which has a chance of 50, that storylet will be picked only half as often as the other.

#### `sequence`
_Syntax_: `{ type: "sequence", seq: "$varname", op: "|not", name: "value" }`  
_Syntax_: `{ type: "sequence", seq: "$varname", op: "eq|neq|gt|lt|gte|lge", count: "value" }`  
_Syntax_: `{ type: "sequence", seq: "$varname", op: "eq|neq|gt|lt|gte|lge", value: "value" }`

Check the value, name, or cycle count (see [`<<sequencecreate>>`](#sequence)) of a sequence (created with `<<sequence>>`) to see if it equals "value". You can do the same check with a `var` condition: `{ type: "var", name: "$varname.name", value: "name" }`.

#### `tws` (twinescript)
_Syntax_: `{ type: "tws", cond: "any valid twinescript expression" }`

True if the twinescript expression evaluates to true, in the same way that the `<<if>>` macro works. So an expression like `$area is "forest" and $metWitch is false` is valid.

#### `all` and `any`
_Syntax_: `{ type: "all", all: [ array of conditions ]}`  
_Syntax_: `{ type: "any", any: [ array of conditions ]}`

These conditions allow you to nest other conditions inside them. An `all` condition is true if all of the nested conditions are true, an `any` is true if any of them are.

---
## Using Storylets

### Getting a set of storylets

Syntax: `MQBN.getStorylets()`

You can get a set of available storylets using the `MQBN.getStorylets()` function. With no arguments it will get all available storylets in the `setup.storylets` store and return them as an array. You can specify the number of storylets you want back as the first argument.

e.g. `<<set _stories = MQBN.getStorylets(3)>>`

You can then display these stories as choices, for example as links (using their titles) or as a hand of cards (using their titles and descriptions).

The `<<storyletlink>>` macro automatically makes a link to a storylet, either by name, or by passing the selected storylets from getStorylets().

e.g.
```html
<<set _stories = MQBN.getStorylets(3)>>
* <<storyletlink _stories[0]>>
* <<storyletlink _stories[1]>>
* <<storyletlink _stories[2]>>
```

When you request a set of storylets, the temporary variable `_STORENAME_available` (by default, `_storylets_available`) is set with the list of all the storylets that were available. You can check `_storylets_available.length` to see if there were more available storylets than shown.

If you want to get storylets from a different store, pass the store name as the second argument, e.g. `MQBN.getStorylets(3,"quips")`.

If you don't need to know the number of available storylets, you can skip it by passing `false` as the third argument. e.g. `MQBN.getStorylets(3,"storylets",false)`.

> [!IMPORTANT]
> `getStorylets()` uses SugarCube's random() function to order and select storylets. This means that you can use the `State.prng.init()` function to make the order of storylet selection resistant to page refreshing and save reloading.

### Linking to a storylet

You can link to a storylet manually with a normal `<<link>>` macro.
```html
<<set _story = MQBN.getStorylets(1)[0]>>
<<link _story.title `_story.passage ?? _story.title`>><<storyletuse _story>><</link>>
```
The `<<storyletlink>>` macro makes this easier, and also supplies default text if the story isn't available, as well as firing a `:storyletchosen` event when the link is clicked.

You can automatically go to a storylet with the `<<storyletgoto>>` macro.
```html
<<set _story = MQBN.getStorylets(1)[0]>>
<<link "See what happens">><<storyletgoto _story>><</link>>
```

Many games may want to display storylets as a list of cards to be played. Your code will look something like the following:
```html
<<set _hand = MQBN.getStorylets($HAND_SIZE)>>
<div class="hand">
<<for _card range _hand>>
    <div class="card" @data-drop-passage="_card.passage ? _card.passage :  _card.title" @data-title="_card.title">
        <div class="title">_card.title</div>
        <div class="desc">_card.desc</div>
        <div class="icon play"></div>
    </div>
<</for>>
</div>
```

Note that a storylet is _not_ marked as used just by selecting it from the store. The `<<storyletlink>>` and `<<storyletgoto>>` macros do this for you. If you don't use those, then the `<<storyletuse>>` macro will mark a storylet used.

### Checking for storylets

You can check if a particular story has been played with the utility function `MQBN.played("storyname")`.

You can check if a storylet is currently available with `_storylets_available.find((s) => s.title = "storyname")`.

You can access the current storylet as `_storylets_current` (or `_STORENAME_current` if using a different store).

### `:storyletchosen` event

When a storylet is chosen with `<<storyletlink>>`, `<<storyletgoto>>`, or `<<storyletuse>>`, a `:storyletchosen` event is fired, with the chosen storylet as event data.

```js
$(document).on(":storyletchosen",function(e) {
  console.log("Storylet chosen",e.storylet);
}); 
```

---
## Macros

### `<<storyletsinit>>`

_Syntax_: `<<storyletsinit [store name]>>`

The `<<storyletsinit>>` macro sets up the storylet tracking variables for a particular store. If you do not pass a store name as the argument, it will set up the default "storylets" store. You _must_ call this macro at least once before using MQBN, normally this will be in the **StoryInit** special passage.

You can also use the name `<<initstorylets>>` for this macro.

### `<<storyletsprune>>`

_Syntax_: `<<storyletsprune [store name]>>`

The `<<storyletsprune>>` macro deletes all used storylets from the given store, so that they will no longer be checked when you call `MQBN.getStorylets()`. You do not need to do this, but if your storylet store is very large, you may wish to do so to reduce computation time.

Note that since storylet stores are part of `setup`, reloading the game will undo the pruning. For this reason, you may want to add `<<storyletsprune>>` to the **StoryInit** special passage, after the store is defined.

You can also use the name `<<prunestorylets>>` for this macro.

### `<<storyletscan>>`

_Syntax_: `<<storyletscan>>`

The `<<storyletscan>>` macro scans the game's passages for `<<storylet>>` macros and turns their contents into storylets, which it then adds to the specified store. You can use this macro to associate storylets with the passages they reference, which you may find easier to track than a separate list created elsewhere.

You should almost certainly only call this macro in the **StoryInit** special passage.

### `<<storylet>>`

_Syntax_: `<<storylet [store name]>>`

The `<<storylet>>` macro allows you to define a storylet in the passage it corresponds to, rather than in your story javascript, or StoryInit. Use the `<<storyletscan>>` macro to scan for such storylets.

The body of the `<<storylet>>` macro should either be a valid storylet object definition, a single twinescript expression, or a `<<cond>>` macro followed by a single twinescript expression. If it's a twinescript expression, it will be come a single `tws` condition. If it's a `<<cond>>` followed by a storylet object, the `<<cond>>` becomes a single `tws` condition on the storylet. 

e.g.

```html
:: Harvest
<<storylet>>
    {
        desc: "It is harvest time at the farm"
    }
<</storylet>>
Text of the harvest passage ...
```

```html
:: Harvest
<<storylet>>
$season is "autumn"
<</storylet>>
Text of the harvest passage ...
```

*Becomes `{ all: [ { type: "tws", cond: '$season is "autumn"' }]}`*

```html
:: Harvest
<<storylet>>
    <<cond>>$season is "autumn"<</cond>>
    {
        sticky: true
    }
<</storylet>>
Text of the harvest passage ...
```

*Becomes `{ sticky: true, all: [ { type: "tws", cond: '$season is "autumn"' }]}`*

The `<<storylet>>` macro should only contain one storylet. If you don't specify the storylet title, it defaults to the passage title. If you do, the storylet's `passage` is set to the passage name instead. If you don't specity the optional store name, the storylet will be added to the "storylets" store.

### `<<storyletgoto>>`

_Syntax_: `<<storyletgoto storyletname-or-object [store "store name"] [open true|false]>>`

The `<<storyletgoto>>` macro sends you to the passage corresponding to the storylet given in the first argument, marks that storylet as used, and fires the `:storyletchosen` event.

You can specify the storylet by passing a valid storylet object (e.g. one returned from `MQBN.getStorylets()`), in which case the storylet is not checked for validity (i.e. it can be already played, not meeting the requirments etc.). Alternatively you can specify the storylet by name or id. In this case the storylet is checked for availability if you specify `open true` in the arguments.

If you supply a name that matches multiple storylet titles, then the first storylet matching that title (or the first open one, if you specify `open true`) is used.

e.g.
```html
<<link "Goto an object">>
    <<set _story = MQBN.getStorylets(1)[0]>>
    <<storyletgoto _story>>
<</link>>
<<link "Goto by name">>
    <<storyletgoto "farm-event" open true>>
<</link>>
```

### `<<storyletinclude>>`

_Syntax_: `<<storyletinclude storyletname-or-object [store "store name"] [open true|false]>>`

The storylet version of `<<include>>`. Given a storylet object or name, includes that storylet's passage's contents into the current passage. This marks the storylet used, just as if you had gone to it with `<<storyletgoto>>` or `<<storyletlink>>`.

You can specify the storylet by passing a valid storylet object (e.g. one returned from `MQBN.getStorylets()`), in which case the storylet is not checked for validity (i.e. it can be already played, not meeting the requirments etc.). Alternatively you can specify the storylet by name or id. In this case the storylet is checked for availability if you specify `open true` in the arguments.

If you supply a name that matches multiple storylet titles, then the first storylet matching that title (or the first open one, if you specify `open true`) is used.

e.g.
```html
<<set _story = MQBN.getStorylets(1)[0]>>
<<storyletinclude _story>>
```

### `<<storyletlink>`

_Syntax_: `<<storyletlink storyletname-or-object [store "store name"] [behaviour disabled|hidden] [text "link text"] [disabled-text "link text"]>><</storyletlink>>`

The `<<storyletlink>>` macro creates a link to a storylet passage. When clicked it runs its contents (like `<<link>>` does), navigates to the passage corresponding to the storylet given in the first argument, marks that storylet as used, and fires the `:storyletchosen` event.

If the first argument is a storylet object, the macro will always create a link to that storylet, without checking if it is available or not. The link's title will be the storylet's `link` attribute, or `title` if it doesn't have one. You can override this by supplying your own title with the `text` argument.

e.g.
```html
<<set _story = MQBN.getStorylets(1)[0]>>
<<storyletlink _story text "See what happens">><</storylet>>
```

If the first argument is a storylet name, the macro makes a link to that storylet. If the storylet is available, the link functions like the object version, however if the storylet is not available, the behaviour depends on the `behaviour` argument. If behaviour is "hidden" (the default), the link does not show. If behaviour is "disabled" it will show a disabled link instead. You can specify different text for the disabled link with the `disabed-text` argument.

e.g.
```html
<<storyletlink "Visit the Farm" behaviour "disabled" disabled-text "No More Farm">><</storyletlink>>
```

### `<<storyletuse>>`

_Syntax_: `<<storyletuse storyletname-or-object [store "store name"]>>`

The `<<storyletuse>>` macro marks a storylet as used, which means it will no-longer be returned by `MQBN.getStorylets()` (unless it is `sticky`), and fires the `:storyletchosen` event. You can use `<<storyletuse>>` where you don't want to use `<<storyletgoto>>` or `<<storyletlink>>` to do this automatically.

---
## Sequences

The original implementation of Quality Based Narratives in Fallen London, used "qualities" to track everything happening in the game, and then based the availability of storylets on them. Although all the qualities were numerical internally, StoryNexus allowed you to label the values with names when setting up qualities e.g. the seasons might be "Summer", "Winter", "Spring" and "Autumn" instead of 1, 2, 3 and 4.

MQBN provides the same functionality through `sequences`, which are just story variables with names for each value, which can be automatically advanced or cycled through.

### `<<sequence>>`

_Syntax_: `<<sequence "$varname" "cycling|linear" [values]>>`

The `<<sequence>>` macro sets up a sequence. You must set up each sequence before you use it, so its normal to place `<<sequence>>` in the **StoryInit** special passage. Each sequence has a name, which is the name of the variable that holds it, and a set of values, which are what you can advance through.

e.g.
```html
<<sequence "$season" cycling "Spring" "Summer" "Autumn" "Winter">>
```

By default a sequence is "linear", which means that advancing it when it has reached the end, does nothing. If you specify that the sequence is "cycling", then advancing it when it is on its last value returns to the beginning. The same happens in the opposite direction if you rewind it.

The values supplied to the `<<sequence>>` macro can be supplied as an array: 
```html
<<set _seasons = ["Spring", "Summer", "Autumn", "Winter"]>>
<<sequence "$season" _seasons>>
```

You can supply an explcit numerical value for each name by passing an object instead of an array:
```html
<<set _levels = { 1: "level 1", 100: "level 2", 300: "level 3", 1000: "level 4" }>>
<<sequence "$level" _levels>>
```

In this way you could track XP (`$level.value`) and the corresponding level (`$level`).

If you place the related story variable in a sting context (e.g. `<<=$season>>`) you will get the name. You can access the value with `$season.value`. You can also explicitly get the name with `$season.name`.

You can create a sequence from javascript by calling `MQBN.createSequence("$varname", values, mode)` where mode is one of `linear` or `cycling`, and `values` is an array or object of values as described above.

### `<<sequenceadvance>> <<sequencerewind>>`

_Syntax_: `<<sequenceadvance|sequencerewind "$sequence" [steps]>>`

The `<<sequenceadvance>>` and `<<sequencerewind>>` macros advance or rewind a given sequence, usually by one step, but you can specify a different number of steps with the optional argument. e.g. `<<sequenceadvance "$season" 2>>`.

Each time a cycling sequence resets to the start with `<<sequenceadvance>>`, a counter is incremented to track how many times through the sequence you have progressed. You can access this with `$sequencename.count` (e.g. `$season.count`). The same happens in reverse with `<<sequencerewind>>`.

You can also update the value of a sequence directly with `$sequence.value += 1` or other similar arithmetic.

---
## Extending

You can easily extend MQBN to add new types of condition. For example in **A Mouse Speaks to Death** I had a system of *Qualities*, so I added a `{ type: "quality", quality: "brave" }` condition.

To add new conditions, add a static function to the MQBN class whose name is the condition type plus "Requirement" (e.g. for the quality check above, add `static qualityRequirement()`). This function is passed the condition as the first argument and the store name as the second, and should return a boolean.

e.g.
```js
static qualityRequirement(r,store) {
    return variables().qualities.includes(r.quality);
}
```

The method is passed two arguments, the requirement (`r` in the example above) and the name of the store (`store` in the exmaple above) that the storylet is drawn from.

Many requirements use common terms. `r.op` is often the comparison operator, and `r.value` is the value you are checking for. For example, to create a requirement based on Chapel's `<<cycle>>` system, you could add:
```js
static phaseRequirement(r,store) {
  return this.operators[r.op ?? "eq"](Cycle.get(r.cycle).current(),r.phase);
}
```
Which you could call as: `{type: "phase", cycle: "day", value: "morning"}` to check whether the current value of the `day` cycle was "morning". The function `this.operators()` converts a basic operator (e.g. `eq` or `gt`) into a comparison.
