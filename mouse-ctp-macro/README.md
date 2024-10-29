## The Mousey Click To Proceed macro

Mousey CTP (MCTP) is a fork of Cyrus Firheir's excellent [Click to Proceed v2](https://github.com/cyrusfirheir/cycy-wrote-custom-macros/tree/master/click-to-proceed) macro that lets you easily implement branching conversations. 

For more details on CTP's basic usage, please consult the original documentation. For MCTP changes, read on.

### Installation

Add the contents of [mctp.js](mctp.js) to your story Javascript, and that of [mctp.css](mctp.css) to your story Stylesheet. Optionally, add the [click handler](#implementing-the-click-in-click-to-proceed) given below.

## MCTP differences

MCTP has the following main differences from CTP V2

* You can set defaults for all your CTP instances (with `setup["@CTP/Options"]`)
* You can skip setting an id for your CTP instances (it defaults to "main")
* `<<ctpAdvance>>` `<<ctpBack>>` and `<<ctpGoto>>` will all default to an id of "main" if you don't specify one
* If the first (default) block of a CTP is empty, display starts at the first `<<ctpNext>>` instead
* You can implement branching conversations (using `id`, `next`, `<<ctpGoto>>` and `<<ctpLink>>`)
* You can add a back/continue button automatically (with `advance` and `back`)
* You can disable click-to-proceed on a particular `<<ctpNext>>` (with `wait`)
* You can force a `<<ctpNext>>` to re-wiki each time it's shown (with `redo`)
* New macros `<<ctpLink>>`, `<<ctpGoto>>` and `<<ctpSetNext>>`

### Defaults

You can set global defaults for all CTP instances created with the `<<ctp>>` macro by setting values in `setup["@CTP/Options"]`. For example, to add `clear` to all CTP instances in your story:

```js
setup["@CTP/Options"].clear = true;
```

Options provided on the CTP instance itself will override these defaults.

#### Default ID
You can specify a default `id` for `<<ctp>>` instances in the same way, however, if you use `<<ctp>>` with no id at all, the id will default to "main". This is only a good idea, naturally, if you only ever have one `<<ctp>>` per page.

In the same way, using `<<ctpAdvance>>` `<<ctpBack>>` and `<<ctpGoto>>` without specifying an id will again default to an id of "main". That means the following is perfectly legal:

```html
<<ctp>>
    Start
<<ctpNext>>
    End
<</ctp>>

<<link "Advance">><<ctpAdvance>><</link>>
```

### Branching Conversations

CTP normally proceeds one section at a time, each click (or `<<ctpAdvance>>`) revealing the next `<<ctpNext>>` block. MCTP allows you to branch this flow by giving individual `<<ctpNext>>` blocks an id, and then using `<<ctpGoto>>` or `<<ctpLink>>` to jump to that branch, `wait` to wait for a user choice, and `next` to merge branches back together again.

#### New attributes

* `id "id"` Gives the current `<<ctpNext>>` an internal id
* `next "id"` Proceeding from theis `<<ctpNext>>` goes to the id given instead of the next block
* `wait` This keyword disables the click-to-proceed handler (see below), and hides the navigation buttons (from `advance` and `back`) if they exist

The following example should hopefully make this flow clear.

```html
<<ctp>>
    You sit down in the cafe
<<ctpNext wait>>
    "What would you like?" the waitress asks, "spam, or eggs?"
    <<link "Spam">><<ctpGoto "spam">><</link>>
    <<link "Eggs, please">><<ctpGoto "eggs">><</link>>
<<ctpNext id "spam">>
    "Sorry, spam's off"
<<ctpNext next "give_up">>
    "Well, what isn't off?" you ask.
<<ctpNext id "eggs">>
    "Sorry, no eggs."
<<ctpNext>>
    "So, what do you have?" you ask.
<<ctpNext id "give_up">>
    "Nothing."

    You give up.
<</ctp>>
```

In this case the normal click handler is disabled when the user-choice is requested in the second block. Clicking either choice jumps to the appropriately id'd block, and then continues in order as normal until a `next` redirects the flow. Note that you cannot `wait` on the first block (i.e. the content before the first `<<ctpNext>>`) since that section has no keywords of its own.

## Macros

### `<<ctpGoto>>`

_Syntax_: `<<ctpGoto "id" [CTP]>>`

The `<<ctpGoto>>` macro jumps directly to the named `<<ctpNext>>` block with the matching `id`. i.e. `<<ctpGoto "dog">>` jumps to `<<ctpNext id "dog">>`. `<<ctpGoto>>` is immediate, just like a normal `<<goto>>`, and should generally be used inside a link or other interactive element.

> [!NOTE]
> You can use `<<ctpGoto>>` to go backwards in the sequence, but this does not change which blocks have been "seen" for purposes of which get hidden, or have their contents processed when first shown. If you use a sequence that goes backwards, and have a block that then does not process its contents, try tagging that block with `redo`.

### `<<ctpLink>>`

_Syntax_: `<<ctpLink "text" "id" [CTP]>>`

The `<<ctpLink>>` macro is like a combination of `<<link>>` and `<<ctpGoto>>`. It creates a link that jumps to the `<<ctpNext>` block with the matching `id` when clicked. i.e. `<<ctpLink "Pet the dog" "dog">>` jumps to `<<ctpNext id "dog">>`. 

### `<<ctpSetNext>>`

_Syntax_: `<<ctpSetNext "id" [CTP]>>`

Sometimes the next CTP block to be shown ought to be dependant on some logic, rather than being hard-coded, or based on user interaction. In this case you can use `<<ctpSetNext>>` to set the current block's `next` property. eg.

```html
<<set _meal = either('spam','eggs')>>
<<ctp>>
    <<ctpNext>>
        You help yourself to the only thing on the menu, which is _meal.
        <<ctpSetNext _meal>>
    <<ctpNext id "spam">>
        You wolf down a plate of spam
    <<ctpNext id "eggs">>
        You tuck into a plate of eggs
<</ctp>>
```

## Automatic advance/back buttons

_Syntax_: `<<ctp advance "button name">>`  
_Syntax_: `<<ctp back "button name">>`  

CTP is often implemented with a link or button outside the `<<ctp>>` instance to advance to the next section (e.g. see [this example](https://github.com/cyrusfirheir/cycy-wrote-custom-macros/tree/master/click-to-proceed#example-usage)). The `advance` option causes such an advance button to appear automatically after each section presented. The `back` button similarly causes a back button to appear. The text of the buttons is the value given to the option.

The buttons (if they exist) is hidden on sections tagged `wait` (where user input is being requested).

The buttons have the `ctp-auto-button` class.

## Implementing the `click` in `click-to-proceed`

By default, CTP V2 doesn't actually include a click handler. MCTP follows this pattern. However the following default click handler implements the expected behaviour.

```js
$(document).on('click','[data-macro-ctp-id]', ev => {
  if (!$(ev.target).is("a")) {
    const ctp = CTP.getCTP("main");
    if (ctp) {
      if (!ctp.stack[ctp.log.index].options.wait) {
        ctp.advance();
      }
    }
  }
});
```

## Marking a section to `redo`

Navigating to a previously shown CTP block (with `<<ctpBack>>` or `<<ctpGoto>>`) will display the same text as before, without re-wiking it. If you wish the content to be processed again, tag the `<<ctpNext>>` with `redo`.
