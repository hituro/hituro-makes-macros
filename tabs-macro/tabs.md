## The tabs macro ##

The `<<tabs>>` macro creates a simple tabbed area, where content is shown and hidden by clicking on the tabs.

### Syntax ###

```html
<<tabs>>
	<<tab "Potions">>
    POTIONS!
    <<tab "Items">>
    ITEMS!
    <<tab "Keys">>
    KEYS!
<</tabs>>
```

#### `<<tabs>>` ####

The `<<tabs>>` macro must contain one or more `<<tab>>` macros, defining both the tabs to be displayed, and the content of the tabs. The content has leading and trailing whitespace trimmed, but is otherwise treated as normal passage content.

The tabs macro takes an optional string argument, which will generate the id of the tabs wrapper element.

#### `<<tab>>` ####

The `<<tab>>` macro has a mandatory first argument, which is the name displayed on the tab. The name is also used to generate the id of the content area corresponding to the tab (which is of the form `tabs-content-NAME` where `NAME` is the tab name, converted to lowercase, spaces turned into `-`, and non-alphanumeric characters removed.)

The tab macro takes an optional second argument. If this evaluates to true, the tab will be selected when the tab-group is displayed. If no tab is pre-selected, then the first tab is displayed.

Note: if the optional id argument is passed to `<<tabs>>` the same id will be prepended to the id of any tabs it contains: e.g. `id-tabs-content-NAME`.

### Generated HTML and CSS ###

The example above would generate the following HTML.

```html
<div class="tabs-tabset" style="--cols:3">
	<div class="tabs-tabs">
		<button id="tabs-contents-potions-control" type="button" role="button" tabindex="0" class="selected">Potions</button>
		<button id="tabs-contents-items-control" type="button" role="button" tabindex="0">Items</button>
		<button id="tabs-contents-keys-control" type="button" role="button" tabindex="0">Keys</button>
	</div>
	<div class="tabs-contents">
		<div class="tabs-content" id="tabs-contents-potions">POTIONS! Y</div>
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