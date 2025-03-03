engine.extend('2.0.0', () => {
    engine.template.inserts.add({
        match: /^reveal\s+at\s+link/i,
        render(label, props) {

          window.addEventListener('click', e => {
            let el     = e.target;
            let source = el.dataset.cbRevealatText;
            let target = el.dataset.cbRevealatTarget;
            
            if (el.dataset.cbRevealatPassage) {
                source = passageNamed(el.dataset.cbRevealatPassage).source;
            }
            
            if (source && target) {
              const output = document.createElement('div');

              output.innerHTML = engine.template.render(source).trim();
              const toInsert = output.children.length;
              const targetEl = document.querySelector(target);

              if (toInsert > 0 && targetEl) {

                const firstInsert = document.createElement('span');

                firstInsert.innerHTML = output.firstChild.innerHTML;
                targetEl.parentNode.insertBefore(firstInsert, targetEl);
                output.removeChild(output.firstChild);

                if (toInsert > 1) {

                  const lastInsert = output.lastChild;

                  while (output.lastChild) {
                    targetEl.parentNode.insertBefore(
                      output.lastChild,
                      targetEl.nextSibling
                    );
                  }
                  
                  while (el.nextSibling) {
                    lastInsert.insertBefore(el.nextSibling, null);
                  }
                } 
              }

              el.parentNode.removeChild(el);
            } 
          });
          
          if (props.text) {
            return `<passage-link class="link"
                       data-cb-revealat-text="${props.text}"
                       data-cb-revealat-target="${props.target}">${label}</passage-link>`;
          }
          
          if (props.passage) {
            return `<passage-link class="link"
                       data-cb-revealat-passage="${props.passage}"
                       data-cb-revealat-target="${props.target}">${label}</passage-link>`;
          }
        }
    });
});