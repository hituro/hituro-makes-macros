## The `<<splice>>` macro ##

The `<<splice>>` macro is a variation on SugarCube's built-in `<<include>>` which allows you to splice multiple passages together, even if they contain martial or incomplete macros. e.g. half of an `<<if>>` in one passage and half in another. This is particularly useful for including one section of `<<ctp>>` content in multiple places.

### Installation ###

Add the contents of [splice.js](splice.js) to your story Javascript.

### Syntax ###

```html
<<splice>>
    Default content.
    <<passage "passage name">>
    More content.
    <<passage "passage name">>
    More content.
    <<text>>
    More content.
    <<var "$variablename">>
<</splice>>
```

The `<<splice>>` macro combines blocks of text together and then processes them for macros and the like. Unlike `<<include>>` it can splice together a single macro from multiple passages or bits of text. It can even construct a macro call dynamically if you want to.

`<<splice>>` has three child macros: `<<text>>`, `<<var>>`, and `<<passage>>`.

#### `<<text>>`
The `<<text>>` macro just adds whatever follows it to the spliced output. If that text contains macros they will run when the text has been spliced together.

#### `<<var "<i>$varname</i>">>`
The `<<var>>` macro adds the value of the named macro to the spliced output at the point where the `<<var>>` appears. e.g. `<<var "$name">>` adds the value of the story variable `$name` to the spliced output. Note that this is done *before* the whole output is processed — for a possible use see the dynamic macro call example below.

#### `<<passage "<i>passage name</i>">>`
The `<<passage>>` macro adds the contents of the named passage (if it exists) to the spliced output at the point where the `<<passage>>` appears. Note that this is done *before* the whole output is processed, so parts of a macro could be in multiple different passages, or split between passages and plain text, so long as the final output is legal macro code.

#### `\`
Whitespace in the `<<splice>>` is preserved, so if you have a line break between two parts of the contents you get a line break in the output. If you want to suppress this, put a `\` at the end of the line to remove all white space between the `\` and the next non-whitespace character.

> [!WARNING]
> You can easily construct invalid macros using `<<splice>>`. If you do, you'll get an error when the spliced text is processed. Use with care.

---
### Examples ###
#### Combining Passages Example ####
```html
:: Passage 1
<<splice>>
    <<set _test to true>>
    <<passage "Passage 2">>
    <<passage "Passage 3>>
<</splice>>

:: Passage 2
<<if _test>>TRUE

:: Passage 3
<<else>>FALSE<</if>>
```
The spliced output of this is `<<set _test to true>><<if _test>>TRUE<<else>>FALSE<</if>>` so it will print "TRUE".

#### Dynamic Macro Generation Example ####
```html
<<set _macro = "set">>
<<splice>>
    <<\
    <<var "_macro">>
    _foo = "bar">>
    _foo
<</splice>>
```
The spliced output of this is `<<set _foo = "bar">> _foo` so it will print "bar", i.e. the name of the macro to call is dynamic.

#### CTP Reuse Example ###
```html
:: Hostile Arrival
<<splice>>
<<ctp>>
    You are thrown through the door, sprawling painfully on the floor. 
    <<ctpNext>>
        It takes you an agonising moment before you can pick yourself up and look around.
    <<passage "room description">>
<</ctp>>
<</splice>>

:: Friendly Arrival
<<splice>>
<<ctp>>
    The concierge holds open the door.
    
    "Please sir, if you'd go inside?"
    <<ctpNext>>
        You step through the door, only for it to be closed instantly behind you. You rattle the handle, but it is locked fast. 

        Cautiously, you turn to examine the room you've ended up in.
    <<passage "room description">>
<</ctp>>
<</splice>>

:: room description
<<ctpNext>>
    To your surprise, you see the room is dominated by a large orange dresser shaped exactly like an apple. 
<<ctpNext>>
    You approach the dresser and tentatively run a finger down the side, it //feels// exactly like an apple too.
<<ctpNext>>
    etc.
```
Here two different `<<ctp>>` instances can share a section of text using `<<splice>>`.
