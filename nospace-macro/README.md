## The nospace macro ##

The `<<nospace>>` macro is a drop in for Sugarcube's `<<nobr>` that removes the leading and trailing whitespace and whitespace after macros, that `<<nobr>>` can leave.

### Installation ###

Add the contents of [nospace.js](nospace.js) to your story Javascript.

### Syntax ###

```html
<<nospace>>
Here's a [[sentence]] with a
<<if true>>
.
<</if>>
<</nospace>>
```
