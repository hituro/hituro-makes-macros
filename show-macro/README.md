## The `<<hide>>` and `<<show>>` macros ##

The `<<hide>>` and `<<show>>` macros are simple DOM Manipulation macros similar to `<<replace>>` and `<<addclass>>`, they show and hide existing elements based on a selector, optionally adding any classes of your choice to the element, and scrolling them into view if needed.

### Installation ###

Add the contents of [show.js](show.js) to your story Javascript.

### Syntax ###

<code><<show "selector" <i>[class to add|string]</i> <i>[scroll]</i>>></code>
<code><<hide "selector" <i>[class to remove|string]</i>>></code>

The `<<hide>>` macro visually hides an element. It does not remove it from the passage the way `<<replace>>` does.

The `<<show>>` macro reveals a hidden element. It does not rerun the contents the way `<<do>>` and `<<redo>>` do.

You can repeatedly `<<hide>>` and `<<show>>` an element without other side-effects.

In both cases you can add a class to an element when it is shown, and remove it when it is hidden (e.g. `<<show "#stats" "revealed">>`). If you add "scroll" to `<<show>>` the element will be scrolled into view if it is currently off screen.

### Starting elements hidden ###

You may want some elements to start hidden. If so, give them the class `hidden`, e.g. `<div id="surprise" class="hidden">`.

> [!NOTE] If you want to hide an element when the passage loads, without using the `hidden` class, you will need to use `<<done>>`, e.g. `<<done>><<hide "#whatever">><</done>>`

---
### Examples ###
#### Basic Example ####

```html
<div id="some-element">with content in it</div>
<<link "hide">><<hide "#some-element">><</link>>
```

#### Element stats hidden Exmaple ####
```html
<div id="some-element" class="hidden">with content in it</div>
<<link "show">><<show "#some-element" scroll>><</link>>
```