setup.functions_macro ??= { prefix: 'tw' };

Macro.add('function', {
	tags : null,

	handler() {
		if (this.args.length === 0) {
			return this.error('no function name specified');
		}

		const functionName = this.args[0];
        const MacroContext = this;
        const prefix       = setup?.functions_macro?.prefix ?? "tw";
        if (prefix && typeof window[prefix] == "undefined") { window[prefix] = { } }
        const target       = prefix ? window[prefix] : window;

		if (target[functionName]) {
			return this.error(`cannot clobber existing function "${functionName}"`);
		}

		try {
			target[functionName] = (function (functionCode) {
				return function() {
					const shadowStore = {};

					// Cache the existing value of the `_args` variable, if necessary.
					if (State.temporary.hasOwnProperty('args')) {
						shadowStore._args = State.temporary.args;
					}

					// Cache the existing value of the `_return` variable, if necessary.
					if (State.temporary.hasOwnProperty('return')) {
						shadowStore._return = State.temporary.return;
					}

					// Set up the function `_args` variable and add a shadow.
					State.temporary.args = [...arguments];
					MacroContext.addShadow('_args');
					MacroContext.addShadow('_return');

					try {
						// Set up the error trapping variables.
						const resFrag = document.createDocumentFragment();
						const errList = [];

						// Wikify the function's code.
						new Wikifier(resFrag, functionCode);

						// Carry over the output, unless there were errors.
						Array.from(resFrag.querySelectorAll('.error')).forEach(errEl => {
							errList.push(errEl.textContent);
						});

						if (errList.length === 0) {
							return State.temporary.return;
						}
						else {
							return MacroContext.error(`error${errList.length > 1 ? 's' : ''} within function code (${errList.join('; ')})`);
						}
					}
					catch (ex) {
						return MacroContext.error(`cannot execute function: ${ex.message}`);
					}
					finally {
						// Revert the `_args` variable shadowing.
						if (shadowStore.hasOwnProperty('_args')) {
							State.temporary.args = shadowStore._args;
						}
						else {
							delete State.temporary.args;
						}
						// Revert the `_return` variable shadowing.
						if (shadowStore.hasOwnProperty('_return')) {
							State.temporary.return = shadowStore._return;
						}
						else {
							delete State.temporary.return;
						}
					}
				}
			})(this.payload[0].contents);
		}
		catch (ex) {
			return this.error(`cannot create function "${functionName}": ${ex.message}`);
		}
	}
});

Story.lookup("tags", "functions").forEach(p => {
    $.wiki(p.text);
});