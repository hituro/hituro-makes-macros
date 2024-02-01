Macro.add('tabs', {
  skipArgs: false,
  tags: null,
  handler : function() {
    const $wrapper  = $("<div class='tabs-tabset'>");
    const $tabs     = $("<div class='tabs-tabs'>");
    const $contents = $("<div class='tabs-contents'>");
    
    let   prefix    = '';
    let   responsive = false;
    let   responseWidth = 0;
    let   responseSide  = 'left';

    for (const arg of this.args) {
      if (["left","right","top","stacked","wrapped","responsive-left","responsive-right","responsive-stacked","responsive-wrapped"].includes(arg)) {
        if (arg.substring(0,10) == "responsive") {
          responsive = true;
          responseSide = arg.substring(11);
        } else {
          $wrapper.addClass(arg);
        }
      } else if (parseInt(arg)) {
        responseWidth = parseInt(arg);
      } else {
        prefix = this.args[0] + '-';
        $wrapper.attr("id",this.args[0]);
      }
    }
    
    this.context = {
      selected: 0,
      tabs: [],
      contents: [],
      tabCount: 0,
      wrapper: $wrapper,
      prefix: prefix
    };
    
    $contents.wiki(this.payload[0].contents);
    
    this.context.tabs[this.context.selected].addClass("selected");
    this.context.contents[this.context.selected].removeClass("hidden");
    $tabs.append(...this.context.tabs);
    $wrapper.attr("style",`--cols:${this.context.tabCount}`).append($tabs, $contents);
    $(this.output).append($wrapper);
    
    if (responsive) {
      const resizeObserver = new ResizeObserver((entries) => {
        window.requestAnimationFrame(() => {
          let entry = entries[0];
          let width = 0;
          if (entry.contentBoxSize) {
              width = entry.contentBoxSize[0].inlineSize;
          } else {
              width = entry.contentRect.width;
          }
          $("#out").html("comparing "+width+" with "+responseWidth+" to set "+responseSide);
          if (width && width <= responseWidth) {
              $wrapper.addClass(responseSide);
          } else {
              $wrapper.removeClass(responseSide);
          }
        });
      });

      resizeObserver.observe($wrapper[0]);
    }
  }
});

Macro.add('tab', {
  skipArgs: false,
  tags: null,
  handler : function() {
    const parent = this.contextSelect(ctx => ctx.name === 'tabs');
    if (!parent) {
        return this.error('must only be used in conjunction with its parent macro <<tabs>>');
    }

    let tabname = this.args[0];
    let tabid   = 'tabs-contents-' + tabname.trim().toLowerCase().replace(/[^a-z0-9]/g,'').replace(/\s+/g, '-');
    let label   = `<span>${tabname}</span>`;
    if (this.args[1] && typeof this.args[1] == "string") {
      label = `<img src="${this.args[1]}">`;
    }
    
    let $contents = $(`<div class="tabs-content hidden" id="${parent.context.prefix}${tabid}">`).wiki(this.payload[0].contents.trim());
    parent.context.contents.push($contents);
    
    let $tab = $(`<button id="${tabid}-control">${label}</button>`).ariaClick(function() {
      parent.context.tabs.forEach((tab) => tab.removeClass("selected"));
      parent.context.contents.forEach((tab) => tab.addClass("hidden"));
      $contents.removeClass("hidden");
      $(this).addClass("selected");
    });
    parent.context.tabs.push($tab);
    if (this.args.length > 1 && this.args[this.args.length -1] === true) { parent.context.selected = parent.context.tabCount; }
    parent.context.tabCount ++;
    
    $(this.output).append($contents);
  }
});