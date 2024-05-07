Macro.add("splice", {
    tags: [ "passage", "text", "var" ],
    handler: function() {
        let spliced = '';
        for (const part of this.payload) {
            if (part.name == "passage") {
                if (part.args[0]) {
                    const passage = Story.get(part.args[0]);
                    if (passage) { spliced += passage.processText(); }
                }
            } else if (part.name == "var") {
            	spliced += State.getVar(part.args[0]);
            }
            spliced += part.contents.replace(/\\$\s+/gm,'');
        }
        $(this.output).wiki(spliced);
    }
});