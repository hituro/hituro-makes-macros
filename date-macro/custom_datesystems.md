You may create multiple date systems in the same game with multiple calls to `<<datesetup>>` provided that you give a unique `systemname` in the options for each system. e.g.

```html
<<set _datesetup = {
    base_time: "now",
    systemname: "solar"
}>>
<<datesetup _datesetup>>
```