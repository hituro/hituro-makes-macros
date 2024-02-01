## The `<<include-part>>` macro ##

The `<<include-part>>` macro is a simple extension of SugarCube's built-in `<<include>>` which includes part of another passage instead of the whole thing.

> [!WARNING]
> Version 1 of this macro incorrectly ran SugarCube code present in the parts of the passage you were *not* including. Version 2 does not do this. If you are using version 1, you should upgrade.

### Installation ###

Add the contents of [include-part.js](include-part.js) to your story Javascript.

### Syntax ###

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
In this example, only the span with the id `target` gets included in Passage1
