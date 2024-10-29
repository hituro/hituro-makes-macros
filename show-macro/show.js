Macro.add(['show','hide'], {
    handler: function() {
        let selector = this.args[0];
        const inClass  = this.args[1] ?? 'shown';
        const scroll   = this.args.includes('scroll',1);
        if (!['.','#'].includes(selector[0])) {
            selector =  '#' + selector;
        }
        if (this.name == 'show') {
            $(selector).fadeIn({ 
                start: function() { if (scroll) { $(this)[0].scrollIntoView(); }},
                complete: function() { $(this).addClass(inClass) }
            });
        } else {
            $(selector).removeClass(inClass).hide();
        }
    }
});

$(document).on(":passagerender", function(ev) {
    $(ev.content).find(".hidden").hide();
});
  