## The tabs macro ##

The `<<tabs>>` macro creates a simple tabbed area, where content is shown and hidden by clicking on the tabs. This is *Version 2*, which is identical to version 1 except that the `<<tab>>` macro is a container.

<img width="664" alt="Screenshot 2023-02-09 at 18 05 27" src="https://user-images.githubusercontent.com/4206142/217899873-601fe0a8-33e3-4c95-9c7d-d9feee4d86c4.png">

> [!NOTE]
> The `<<tabs>>` macro was upgraded to v2.1 on 1st Feb 2024. v2.1 will render non-tab content inside the macro.

### Installation ###

Add the contents of [tabs.js](tabs.js) to your story Javascript, and the contents of [tabs.css](tabs.css) to your story Stylesheet.

### Syntax ###

```html
<<tabs>>
    <<tab "Potions">>
        POTIONS!
    <</tab>>
    <<tab "Items">>
        ITEMS!
    <</tab>>
    <<tab "Keys">>
        KEYS!
    <</tab>>
<</tabs>>
```

### `<<tabs>>` ###
Syntax: `<<tabs [id] [top|left|right|stacked|responsive-left|responsive-right|responsive-stacked] [breakpoint]>>` 

The `<<tabs>>` macro must contain one or more `<<tab>>` macros, defining both the tabs to be displayed and the content of the tabs. The content has leading and trailing whitespace trimmed but is otherwise treated as normal passage content.

You can choose which side of the tabs block the tabs appear on by passing a *direction*, which must be one of `top`, `left`, `right`, `wrapped` or `stacked` (the default is `top`). Left and Right will put the tabs on that side, with vertical tabs. Wrapped will allow the top tabs to collapse and wrap, except for the selected tab, which is full-width and below the rest. Stacked will stack the tabs at the top, which can fit very narrow spaces. (See [Layouts](#layouts) below)

e.g. `<<tabs "right">>`

You can also set the direction to `responsive-left`, `responsive-right`, `responsive-wrapped` or `responsive-stacked`, and supply a width in pixels. Above this width, the tabs display at the top, below this size they display on your chosen side.

e.g. `<<tabs "responsive-right" 600>>`

You can optionally also supply an id (any string that isn't one of the directions), which will set the id of the tabs element.

e.g. `<<tabs "myid">>`

### `<<tab>>` ###
Syntax: `<<tab name [icon] [selected]>><</tab>>`

The `<<tab>>` macro has a mandatory first argument, which is the name displayed on the tab. The name is also used to generate the id of the content area corresponding to the tab (which is of the form `tabs-content-NAME` where `NAME` is the tab name, converted to lowercase, spaces turned into `-`, and non-alphanumeric characters removed.)

The optional second argument is the path to an image to use instead of the name, e.g. `<<tab "Potions" "/images/potion.png">><</tab>>`.

If the optional final argument evaluates to true, the tab will be selected when the tab-group is displayed. If no tab is pre-selected, then the first tab is displayed.

Note: if the optional id argument is passed to `<<tabs>>` the same id will be prepended to the id of any tabs it contains: e.g. `id-tabs-content-NAME`.

### Layouts ###

<table>
<tr>
<td><b>top</b>
<img width="664" alt="top" src="https://user-images.githubusercontent.com/4206142/217899873-601fe0a8-33e3-4c95-9c7d-d9feee4d86c4.png">
</td>
<td><b>left</b>
<img width="275" alt="left" src="https://user-images.githubusercontent.com/4206142/224777524-89c32c6b-e4a1-47ef-8fad-e4e1d34cdf16.png">
</td>
<td><b>right</b>
<img width="323" alt="right" src="https://user-images.githubusercontent.com/4206142/224777536-0559fa19-2bea-4347-b959-08b99ed684d7.png">
</td>
</tr><tr>
<td><b>stacked</b>
<img width="774" alt="stacked" src="https://user-images.githubusercontent.com/4206142/224777498-d4f5e28c-a7bc-49e5-8c2d-53bfaba20e00.png">
</td>
<td><b>wrapped</b>
<img width="303" alt="wrapped" src="https://user-images.githubusercontent.com/4206142/224789027-987027c0-9b65-48b8-a43e-20c7227b320a.png">
</td></tr></table>

### Examples ###

A tab set with the second tab selected by default
```html
<<tabs>>
    <<tab "Potions">>
        POTIONS!
    <</tab>>
    <<tab "Items" true>>
        ITEMS!
    <</tab>>
    <<tab "Keys">>
        KEYS!
    <</tab>>
<</tabs>>
```

A tab set with a custom id
```html
<<tabs "inventory">>
    <<tab "Potions">>
        POTIONS!
    <</tab>>
    <<tab "Items">>
        ITEMS!
    <</tab>>
    <<tab "Keys">>
        KEYS!
    <</tab>>
<</tabs>>
```

A tab set with the tabs down the left hand side, and a custom id
```html
<<tabs "inventory" "left">>
    <<tab "Potions">>
        POTIONS!
    <</tab>>
    <<tab "Items">>
        ITEMS!
    <</tab>>
    <<tab "Keys">>
        KEYS!
    <</tab>>
<</tabs>>
```

A tab set with the tabs at the top, but down the left hand side if the width of the tabset is less than 800 px
```html
<<tabs "responsive-left" 800>>
    <<tab "Potions">>
        POTIONS!
    <</tab>>
    <<tab "Items">>
        ITEMS!
    <</tab>>
    <<tab "Keys">>
        KEYS!
    <</tab>>
<</tabs>>
```

### Generated HTML and CSS ###

The example above would generate the following HTML.

```html
<div class="tabs-tabset" style="--cols:3">
	<div class="tabs-tabs">
		<button id="tabs-contents-potions-control" type="button" role="button" tabindex="0" class="selected"><span>Potions</span></button>
		<button id="tabs-contents-items-control" type="button" role="button" tabindex="0"><span>Items</span></button>
		<button id="tabs-contents-keys-control" type="button" role="button" tabindex="0"><span>Keys</span></button>
	</div>
	<div class="tabs-contents">
		<div class="tabs-content" id="tabs-contents-potions">POTIONS!</div>
		<div class="tabs-content hidden" id="tabs-contents-items">ITEMS!</div>
		<div class="tabs-content hidden" id="tabs-contents-keys">KEYS!</div>
	</div>
</div>
```

Some of the basic styling of the tab group can be controlled with CSS variables, as follows:

```css
  --button-rounding: 10px; /* the radius of the top-corners of the buttons */
  --tab-color: #343434;    /* the background color of a tab */
  --tab-selected: #565656; /* the background color of the selected tab */
```
