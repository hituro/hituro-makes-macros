Macro.add('tabs', {
    skipArgs: false,
    tags    : ['tab','/tab'],
    handler : function() {
      const $wrapper  = $("<div class='tabs-tabset'>");
      const $tabs     = $("<div class='tabs-tabs'>");
      const $contents = $("<div class='tabs-contents'>");
      
      const tabs      = [];
      const contents  = [];
      let   tabCount  = 0;
      let   selected  = 0;
      let   prefix    = '';
      
      if (this.args[0]) {
        prefix = this.args[0] + '-';
        $wrapper.attr("id",this.args[0]);
      }
      
      for (var i = 0, len = this.payload.length; i < len; ++i) {
        if (this.payload[i].name == 'tab') {
          let tabname = this.payload[i].args[0];
          let tabid   = 'tabs-contents-' + tabname.trim().toLowerCase().replace(/[^a-z0-9]/g,'').replace(/\s+/g, '-');
          let $tab = $(`<button id="${tabid}-control">${tabname}</button>`).ariaClick(function() {
            $($wrapper).find(".tabs-tabs button").removeClass("selected");
            $($wrapper).find(".tabs-content").addClass("hidden");
            $($wrapper).find(`#${prefix}${tabid}`).removeClass("hidden");
            $(this).addClass("selected");
          });
          tabs.push($tab);
          contents.push($(`<div class="tabs-content hidden" id="${prefix}${tabid}">`).wiki(this.payload[i].contents.trim()));
          if (this.payload[i].args[1]) { selected = tabCount; }
          tabCount ++;
        }
      }
      tabs[selected].addClass("selected");
      contents[selected].removeClass("hidden");
      $tabs.append(...tabs);
      $contents.append(...contents);
      $wrapper.attr("style",`--cols:${tabCount}`).append($tabs, $contents);
      $(this.output).append($wrapper);
    }
  });
  