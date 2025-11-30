(function () {
	"use strict";

	setup["@CTP/Options"] ??= {};

	$(document).on(":passageinit", () => {
		CTP.Logs.forEach((_, id) => {
			if (!CTP.Repository.get(id)?.persist) CTP.Logs.delete(id);
		});
		CTP.Repository.forEach(({ persist }, id) => {
			if (!persist) CTP.Repository.delete(id);
		});
	});

	window.CTP = class CTP {
		constructor(id, persist = false) {
			this.stack = [];
			this.clears = [];
			this.options = {};
			if (!id?.trim()) throw new Error(`No ID specified!`);
			this.id = State.temporary.ctp = id;
			this.persist = persist;
			CTP.Repository.set(id, this);
		}

		static get Options() {
			return ['clear','id','next','t8n','persist','transition','wait','advance','back','redo','append'];
		}

		static get Repository() {
			if (!setup["@CTP/Repository"]) setup["@CTP/Repository"] = new Map();
			return setup["@CTP/Repository"];
		}

		static get Logs() {
			if (!variables()["@CTP/Logs"]) variables()["@CTP/Logs"] = new Map();
			return variables()["@CTP/Logs"];
		}

		get log() {
			if (!CTP.Logs.get(this.id)) CTP.Logs.set(this.id, { lastClear: -1, index: -1, seen: [] });
			return CTP.Logs.get(this.id);
		}

		static getCTP(id) {
			return CTP.Repository.get(id);
		}

		static nextArgs(args) {
			const parsed = {};
			const single = ['clear','t8n','transition','wait','redo','append'];
			for (let i = 0; i < args.length; i += 1) {
				if (single.includes(args[i])) {
					parsed[args[i]] = true;
				} else {
					parsed[args[i].replace(/[^a-zA-Z0-9_]/g,'')] = args[i+1];
					i++;
				}
			}
			if (parsed.t8n) { parsed.transition = true; }
            if (parsed.append) { parsed.clear = false; }
			return parsed;
		}

		add(content, options = {}) {
			options = {
				...this.options,
				...options
			};
			if (options.clear) this.clears.push(this.stack.length);
			this.stack.push({
				options, content,
				index: this.stack.length,
				element: $()
			});
			return this;
		}

		print(index) {
			const { content, options: iOpts } = this.stack[index];
			const options = {
				...this.options,
				...iOpts
			};
			const element = $(document.createElement(options.element || "span"))
				.addClass("--macro-ctp-hidden")
				.attr({
					"data-macro-ctp-id": this.id,
					"data-macro-ctp-next-id": options.id,
					"data-macro-ctp-index": index,
				})
				.on("update-internal.macro-ctp", (event, firstTime) => {
					if ($(event.target).is(element)) {
						if (index === this.log.index) {
							if (firstTime || options.redo) {
							    if (options.redo) element.empty();
								if (typeof content === "string") element.wiki(content);
								else element.append(content);
								element.addClass(options.transition ? "--macro-ctp-t8n" : "");
							}
							if (options.back && !options.wait && index > 0) {
								element.append($(`<button>${options.back}</button>`)
									.addClass("ctp-auto-button")
									.ariaClick((ev) => {
										this.back();
                                        ev.stopPropagation();
									}));
							}
							if (options.advance && !options.wait && index !== (this.stack.length -1)) {
								element.append($(`<button>${options.advance}</button>`)
									.addClass("ctp-auto-button")
									.ariaClick((ev) => {
										this.advance();
                                        ev.stopPropagation();
									}));
							}
							element.removeClass("--macro-ctp-hidden");
						} else {
							if (this.log.seen.includes(index)) element.removeClass("--macro-ctp-t8n");
							element.toggleClass("--macro-ctp-hidden", index > this.log.index || index < this.log.lastClear);
							element.toggleClass("--macro-ctp-older", index < this.log.index);
						}
					}
				});
			this.stack[index].element = element;
			return element;
		}

		output() {
			const wrapper = document.createDocumentFragment();
			for (let i = 0; i < this.stack.length; i++) {
				this.print(i).appendTo(wrapper);
			}
			return wrapper;
		}

		advance() {
        	if (this.stack[this.log.index] && this.stack[this.log.index].options.next) {
            	return this.goto(this.stack[this.log.index].options.next);
            }
			if (this.log.index < this.stack.length - 1) {
				this.log.index++;
				const firstTime =  !this.log.seen.includes(this.log.index);
				this.log.seen.pushUnique(this.log.index); // = Math.max(this.log.seen, this.log.index);
				this.log.lastClear = this.clears.slice().reverse().find(el => el <= this.log.index) ?? -1;
				$(document).trigger("update.macro-ctp", ["advance", this.id, this.log.index]);
				this.stack.forEach(({ element }) => element.trigger("update-internal.macro-ctp", [firstTime, "advance", this.id, this.log.index]));
			}
			return this;
		}
        
        goto(id) {
        	const index = this.stack.findIndex((item) => item.options.id == id);
            if (index) {
				console.log("going to index",index);
            	this.log.index = index;
				const firstTime =  !this.log.seen.includes(this.log.index);
				this.log.seen.pushUnique(this.log.index); // = Math.max(this.log.seen, this.log.index);
				this.log.lastClear = this.clears.slice().reverse().find(el => el <= this.log.index) ?? -1;
				$(document).trigger("update.macro-ctp", ["goto", this.id, this.log.index]);
				this.stack.forEach(({ element }) => element.trigger("update-internal.macro-ctp", [firstTime, "goto", this.id, this.log.index]));
            }
            return this;
        }

		back() {
			if (this.log.index > 0) {
				this.log.index--;
				this.log.lastClear = this.clears.slice().reverse().find(el => el <= this.log.index) ?? -1;
				const firstTime =  !this.log.seen.includes(this.log.index);
				this.log.seen.pushUnique(this.log.index); // = Math.max(this.log.seen, this.log.index);
				$(document).trigger("update.macro-ctp", ["back", this.id, this.log.index]);
				this.stack.forEach(({ element }) => element.trigger("update-internal.macro-ctp", [firstTime, "back", this.id, this.log.index]));
			}
			return this;
		}
	}

	Macro.add("ctp", {
		tags: ["ctpNext"],
		handler() {
            if (!setup["@CTP/Options"]) setup["@CTP/Options"] = {};
			const id = CTP.Options.includes(this.args[0]) ? "main" : (this.args[0] ?? "main");
			const persist = this.args.slice(1).includes("persist");
			const ctp = new CTP(id, persist);
			const _passage = passage();
			this.payload.forEach(({ args, name, contents }) => {
				const options = CTP.nextArgs(args);
				if (name === "ctp") ctp.options = { ...setup["@CTP/Options"], ...options };
				if (contents.trim().length) ctp.add(contents, options);
			});
            console.log(ctp);
			$(this.output).append(ctp.output());
			$(document).one(":passagedisplay", () => {
				if (_passage === passage()) {
					const i = Math.max(ctp.log.index, 0);
					ctp.log.index = -1;
					ctp.log.seen = [];
					while (ctp.log.index < i) ctp.advance();
				}
			});
		}
	});

	Macro.add("ctpAdvance", {
		handler() {
			const id = this.args.length == 1 ? this.args[0] : "main";
			if (id) {
				const ctp = CTP.getCTP(id);
				if (ctp) ctp.advance();
				else throw new Error(`No CTP with ID '${id}' found!`);
			} else throw new Error(`No ID specified!`);
		}
	});

	Macro.add("ctpGoto", {
		handler() {
			const id = this.args.length == 2 ? this.args[1] : "main";
			if (id) {
				const ctp = CTP.getCTP(id);
				if (ctp) ctp.goto(this.args[0]);
				else throw new Error(`No CTP with ID '${id}' found!`);
			} else throw new Error(`No ID specified!`);
		}
	});

	Macro.add("ctpLink", {
		handler() {
            const text    = this.args[0];
            const target = this.args[1];
			const id        = this.args.length == 3 ? this.args[2] : "main";
            const $link   = $("<a class='ctp-internal-link'>");
            $link.ariaClick({
            	one  : false
            }, this.createShadowWrapper(
            	() => {
                  if (id) {
                      const ctp = CTP.getCTP(id);
                      if (ctp) ctp.goto(target);
                      else throw new Error(`No CTP with ID '${id}' found!`);
                  } else throw new Error(`No ID specified!`);
                }
            )).html(text);
            $link.appendTo(this.output);
		}
	});

	Macro.add("ctpBack", {
		handler() {
			const id = this.args.length == 1 ? this.args[0] : "main";
			if (id) {
				const ctp = CTP.getCTP(id);
				if (ctp) ctp.back();
				else throw new Error(`No CTP with ID '${id}' found!`);
			} else throw new Error(`No ID specified!`);
		}
	});
	
	Macro.add("ctpSetNext", {
		handler() {
			const id = this.args.length == 2 ? this.args[0] : "main";
			if (id) {
				const ctp = CTP.getCTP(id);
				if (ctp) {
				    ctp.stack[ctp.log.index].options.next = this.args[this.args.length - 1];
				} else { throw new Error(`No CTP with ID '${id}' found!`); }
			} else throw new Error(`No ID specified!`);
		}
	});
})();
