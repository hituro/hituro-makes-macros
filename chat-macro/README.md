## CHATSYSTEM Macros

The Chatsystem macros are intended to provide an emulation of chat message interfaces like text messages, chat apps, and phones. It is *not* a phone simulation, it's up to the game author where they want to embed the chat interface.

**Basic Example**
```html
<<msg from "Tom" to "Alice">>         
    Hi! Are you still coming to dinner?
<</msg>>
<<chat "Tom" with "Alice">><</chat>>  
```

<img src="images/example_1.jpg">

### Installation

Add the contents of chat.js to your story Javascript.

Add the contents of chat.css to your story Stylesheet.

## Basic Concepts

The basic building block of the Chatsystem is the `<<msg>>` macro. Each one defines a **message** between one or more people, identified by names. One or more messages makes up a **conversation**, which can be displayed by the `<<chat>>` or `<<history>>` macros. You can define messages in advance and then display them as a complete conversation, or you can define them live in a simulation of live chat.

Individual messages have an author (the `from`) and one or more targets (the `to`). As soon as you create a message it makes a matching conversation. For example, the following message: `<<msg from "Tom" to "Alice">>` creates the conversation `alice_tom`. The message `<<msg from "Tom" to "Alice" and "Bob">>` creates the conversation `alice_bob_tom`. (Conversation IDs are always the names of the people involved, converted to lower case, in alphabetical order, and connected by underscores). The order of the names doesn't matter, `<<msg from "Tom" to "Alice" and "Bob">>` goes in the same conversation as `<<msg from "Tom" to "Bob" and "Alice">>`.

You can display that conversation from the point of view of one of the people using `<<chat>>`. `<<chat "Tom" with "Alice">><</chat>>` shows the `alice_tom` conversation from Tom's point of view. `<<chat "Alice" with "Tom">><</chat>>` shows the same conversation from Alice's.