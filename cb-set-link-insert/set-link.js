engine.extend('2.0.0', () => {
  
    window.addEventListener('click', ({target}) => {  
		let vars     = target.dataset.cbSetVars;
		if (vars) {
		  let result = engine.template.render(vars.replace(';',"\n")+"\n--");
		}
      
        const goable = target.closest('[data-cb-go]');

        if (goable) {
          window.go(goable.dataset.cbGo);
        }
    });

	engine.template.inserts.add({
		match: /^set\s+link/i,
		render(passage, props) {
		  if (passage) {
			return `<passage-link class="link"
					   data-cb-go="${passage}"
					   data-cb-set-vars="${props.set}">${props.label}</passage-link>`;
		  }
		}
	});
});