Macro.add('nospace', {
    skipArgs : true,
    tags     : null,

    handler() {
        new Wikifier(this.output,
                     this.payload[0].contents
                       .replace(/^\n+|\n+$/g, '')
                       .replace(/\n+/g, '')
                       .replace(/ ([.!?;,\"\'])/g, '$1'));
    }
});