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
    let   responsive = false;
    let   responseWidth = 0;
    let   responseSide  = 'left';

    for (const arg of this.args) {
      if (["left","right","top","stacked","wrapped","responsive-left","responsive-right","responsive-stacked","responsive-wrapped"].includes(arg)) {
      	console.log("arg "+arg+" is class");
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
    
    for (var i = 0, len = this.payload.length; i < len; ++i) {
      if (this.payload[i].name == 'tab') {
        let tabname = this.payload[i].args[0];
        let tabid   = 'tabs-contents-' + tabname.trim().toLowerCase().replace(/[^a-z0-9]/g,'').replace(/\s+/g, '-');
        let $tab = $(`<button id="${tabid}-control"><span>${tabname}</span></button>`).ariaClick(function() {
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
    
    if (responsive) {
      if (window.resizeObserver) {
        const resizeObserver = new ResizeObserver((entries) => {
          window.requestAnimationFrame(() => {
            let entry = entries[0];
            let width = 0;
            if (entry.contentBoxSize) {
                width = entry.contentBoxSize[0].inlineSize;
            } else {
                width = entry.contentRect.width;
            }
            if (width && width <= responseWidth) {
                $wrapper.addClass(responseSide);
            } else {
                $wrapper.removeClass(responseSide);
            }
          });
        });

        resizeObserver.observe($wrapper[0]);
      } else {
        $(window).on("resize", function() {
          let width = $wrapper.width();
          if (width && width <= responseWidth) {
              $wrapper.addClass(responseSide);
          } else {
              $wrapper.removeClass(responseSide);
          }
        });
      }
    }
  }
});