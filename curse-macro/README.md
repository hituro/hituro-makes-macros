## The `<<curse>>` macro ##

The `<<curse>>` macro curses the text inside it, making it more and more unreadable.

### Installation ###

Add the contents of [curse.js](curse.js) to your story Javascript.

### Syntax ###

<code>&lt;&lt;curse <i>[degree|int]</i>>>text to curse&lt;&lt;/curse>></code>

The `<<curse>>` macro curses the text inside it, by using Unicode combining characters to make it more and more unreadable. 
You can pass a numerical value to change *how* cursed the text is, e.g. `<<curse 5>>`, higher numbers are more cursed; the default is 3.

### Example ###
```html
<<curse>>A bunch of Cursed text<</curse>>
```

The following shows the macro above at different levels of cursing.

![image](https://github.com/user-attachments/assets/f259db53-baea-49bf-9440-7ae9dc9bced2)
