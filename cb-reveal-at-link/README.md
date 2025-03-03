## The `{reveal at:}` insert ##

The `{reveal at:}` inserts some text (or the contents of a passage) at a point on the page identified by a selector.

> [!NOTE]
> This is a Chapbook insert.

### Installation ###

**v2**: Add the contents of [reveal-at-link.js](reveal-at-link.js) to your story Javascript.

### Syntax ###

<code>{reveal at link: "link text", [text: "revealed text" or passage: "passage to include"], target: "#id"}</code>

The `{reveal at:}` insert acts similarly to a `{reveal:}` insert, creating a link which, when clicked, reveals some text. The difference is that it can reveal text elsewhere on the page, by targetting an HTML element.

For example:

```html
{reveal at link: 'something odd occurred', text: 'I saw five deer staring at me from one side of the road, all in a line', target: "#test"}

Some other text

<div id="test"></div>
```

This creates a link "something odd occurred". When clicked it puts the "I saw five deer ..." text into the div identified by #test

### Options ###
* `text` a string to show when clicked
* `passage` a passage to include at the target location when clicked
* `target` a CSS selector for the target location