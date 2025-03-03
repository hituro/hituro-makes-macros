## The `{set link:}` insert ##

The `{set link:}` insert allows you to set variables when a link is clicked, which can allow different link choices leading to the same passage to set different variables.

> [!NOTE]
> This is a Chapbook insert.

### Installation ###

**v2**: Add the contents of [set-link.js](set-link.js) to your story Javascript.
**v1**: Add the contents of [set-link-v1.js](set-link-v1.js) to your story Javascript.

### Syntax ###

<code>{set link: "passage name", label: "link text", set: "variable instruction"}</code>

The `{set link:}` insert creates a link which, when clicked on, sets one or more variables, as if you had set them in the variables section of a passage.

e.g.

`{set link: 'Another passage', label: 'A link', set: 'foo: 2'}`

To set multiple variables in one link, you must separate them with `;` marks, e.g.

`{set link: 'Another passage', label: 'A link', set: "foo: 2;bar 'text value'"}`
