Macro.add(['id','style','class','attr'], {
    skipArgs: false,
    tags: null,
    handler : function() {
        if (this.args[0]) {
            let parsedContent = $("<div>").wiki(this.payload[0].contents.trim()).children();
            if (this.name == "class") {
                parsedContent.first().addClass(this.args[0]);
            } else if (this.name == "attr") {
                if (this.args[1]) {
                    parsedContent.first().attr(this.args[0],this.args[1]);
                } else {
                    return this.error('You must specify the content for the attribute you wish to add');
                }
            } else {
                parsedContent.first().attr(this.name,this.args[0]);
            }
            jQuery(this.output).append(parsedContent);
        } else {
            return this.error('You must specify the content for the attribute you wish to add');
        }
    }
  });
