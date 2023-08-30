## The `<<function>>` Macro

The `<<function>>` macro provides an easy mechanism for making functions with standard SugarCube macros, in the same way that `<<widget>>` allows you to make macros using TwineScript. Each `<<function>>` macro makes a function that returns whatever is in the `_return` temporary variable, in the same way that `<<widget>>` puts its output into the passage.

### Installation ###

Add the contents of [function.js](function.js) to your story Javascript.

### Basic Usage

The `<<function>>` macro defines a javascript function. `<<function>>` allows you to create functions by using the standard macros and markup that you use normally within your story.

```html
<<function "functionName">>
    ... function body
    <<set _return to "whatever you are returning">>
<</function>>

<<set _var to tw.functionName()>>
```

### Function Name

The first argument to `<<function>>` is used as the function name. It must not contain spaces, and must begin with a letter, `$` or `_`. My default, all functions created by `<<function>>` get a prefix added, `tw`, to make sure they don't overwrite any pre-existing function. So if you call `<<function "what">>` the function created is `tw.what()`.

You can change the prefix by setting `setup.function_macro.prefix`, e.g. `setup.function_macro = { prefix: "myprefix" }`. If you set the prefix to a falsy value, the functions are created directly on the window object, and won't have any prefix.

> [!WARNING]
> Be sure to set your prefix *before* calling `<<function>>`. In practice do it before any of the functions.js code

### Special variables, `_args` & `_return`

Arguments passed to your function appear in the `_args` temporary variable as as zero-based indices; i.e., `_args[0]` is the first parsed argument, `_args[1]` is the second, etc. e.g.
```html
<<function "hello">>
    <<set _return to "Hello " . _args[0]>>
<</function>>

<<print tw.hello("Hituro")>>
```

Your function can return information by setting the `_return` temporary variable.

### `function` tagged passages

Functions should be defined only in a `function`-tagged passage. *Do not* add a widget tag to any of the [specially named passages](https://www.motoslave.net/sugarcube/2/docs/#special-passages) and attempt to define your functions there. 
