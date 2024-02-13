## The `<<include-part>>` macro ##

The `<<include-part>>` macro is a simple extension of SugarCube's built-in `<<include>>` which includes part of another passage instead of the whole thing.

> [!WARNING]
> Version 1 of this macro incorrectly ran SugarCube code present in the parts of the passage you were *not* including. Version 2 does not do this. If you are using version 1, you should upgrade.

### Installation ###

Add the contents of [include-part.js](include-part.js) to your story Javascript.

### Syntax ###

<code><<include-part "passage" "#target" <i>[remove-container|boolean]</i>>></code>

`<<include-part>>` is used to included part of the passage given in the first argument into the current passage. The second argument is treated as a selector to identify which element to include. If the optional third argument is `true` then only the children of the selected element are included, if it is `false` (the default) then the selected element is also included.

### Example ###
**Passage1**
```html
<<include-part "passage2" "#target">>
```

**Passage2**
```html
Some text.

Some other text.

<span id="target">Text to be included.</span>

Yet more text.
```
In this example, only the span with the id `target` gets included in Passage1. If the third argument was true (`<<include-part "passage2" "#target" true>>`) then only the text inside the span would be included in Passage1.
