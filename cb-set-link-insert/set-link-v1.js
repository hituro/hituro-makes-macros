engine.extend('1.0.0', () => {

    engine.event.prependListener('dom-click', el => {
        let vars    = el.dataset.cbSetVars;
        if (vars) {
          let result = engine.render(vars.replace(';',"\n")+"\n--");
        }
    });

    config.template.inserts = [{
        match: /^set\s+link/i,
        render(passage, props) {
          if (passage) {
            return `<a href='javascript:void(0)'
                       data-cb-go="${passage}"
                       data-cb-set-vars="${props.set}">${props.label}</a>`;
          }
        }
    }, ...config.template.inserts];
});