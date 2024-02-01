Macro.add("include-part", {
  skipArgs: false,
  handler : function() {
    if (Story.has(this.args[0])) {
      // get the source and escape it
      let   source  = Story.get(this.args[0]).processText();
            source  = source.replaceAll('<<','{{%');
            source  = source.replaceAll('>>','%}}');
    
      // find the element required
      const passage = $("<div>").append(source);
      let   element = passage.find(this.args[1]);
      if (this.args[2]) { element = element.children(); }

      if (element.length) {
        // convert source back to SC
              source  = element.prop('outerHTML');
              source  = source.replaceAll('{{%','<<');
              source  = source.replaceAll('%}}','>>');

        jQuery(this.output).wiki(source);
      }
    }
  }
});