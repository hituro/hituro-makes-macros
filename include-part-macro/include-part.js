Macro.add("include-part", {
    skipArgs: false,
    handler : function() {
        const passage = $("<div>").wiki(Story.get(this.args[0]).text);
      jQuery(this.output).append(passage.find(this.args[1]));
    }
  });