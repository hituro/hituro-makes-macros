(function() {

    State.variables.chatsystem = {};
    setup["@CHATSYSTEM/Options"] = { 
        tails: true,
        styled: false
    };

    window.CHATSYSTEM = class CHATSYSTEM {
    
        static version  = "1.0.0";
        static interval = 86400000;
        
        static initChat(name) {
            if (!Object.hasOwn(State.variables.chatsystem, name)) {
                State.variables.chatsystem[name] = [];
            }
        }
        
        static conversationId(a,b) {
            return [a,b].flat().sort().join('_').toLowerCase();
        }
        
        static addMsg(name,msg) {
            const p   = State.variables.chatsystem;
            p[name].push(msg);
            if (msg.date) {
                p[name].sort((a,b) => a.date - b.date);
            }

            const tags = [ name ];
            triggerEvent(':redo', document, { detail : { tags } });
        }
        
        static currentId(id) { 
            const p   = State.variables.chatsystem;
            if (Array.isArray(p[id]) && p[id].length) {
                return p[id][p[id].length - 1].id;
            }
            return 0;
        }
        
        static addTyping(name) {
            $(`#${name}`).append("<div class='chat_msg chat_msg_to typing'></div>");
        }
        
        static date(now,date) {
            const diff = (now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000);
            let datestring = '';
            if (diff < 2) {
                datestring = (now.getDay() == date.getDay()) ? 'Today' : 'Yesterday';
            } else if (diff < 7) {
                datestring = new Intl.DateTimeFormat("en-US", { weekday: "long"}).format(date);
            } else {
                datestring = new Intl.DateTimeFormat("en-US", { weekday: "short", day: "numeric", year: "numeric"}).format(date);
            }
            const timestring = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "numeric"}).format(date)
            return `<div class="date">${datestring} ${timestring}</div>`;
        }
        
        static deleteMsg(name,id) {
            const p   = State.variables.chatsystem;
            p[name].deleteWith((msg) => msg.id === id);
        }
        
        static deleteChat(name) {
            const p   = State.variables.chatsystem;
            delete p[name];
        }
    }

    window.macroPairedArgsParser = function(args,start=0,singletons=[]) {
        // v2
        const parsed  = {};
        let   lastKey = '';
        
        for (let i = start; i < args.length; i += 1) {
            let key = args[i].replace(/[^a-zA-Z0-9_]/g,'');
            if (singletons.includes(key)) {
                parsed[key] = true;
            } else {
                if (key == 'and') {
                    // append to previous item
                    if (Array.isArray(parsed[lastKey])) {
                        parsed[lastKey].push(args[i+1]);
                    } else {
                        parsed[lastKey] = [parsed[lastKey],args[i+1]];
                    }
                } else {
                    parsed[key] = args[i+1];
                    lastKey = key;
                }
                i++;
            }
        }
        return parsed;
    };

    Macro.add("msg",{
        tags: null,
        handler: function() {
            const p   = State.variables.chatsystem;
            const msg = (typeof this.args[0] === "object") 
                ? this.args[0]
                : macroPairedArgsParser(this.args);
            
            if (!msg.from) { this.error("You must specify a from."); }
            if (!msg.to)   { this.error("You must specify a to.");   }
            if (!Array.isArray(msg.to)) { msg.to = [msg.to]; }
            
            const name = CHATSYSTEM.conversationId(msg.from,msg.to);
            
            CHATSYSTEM.initChat(name);
            
            if (!msg.id)   { msg.id = p[name].length; }
            if (!msg.text) { msg.text = this.payload[0].contents.trim(); }
            if (msg.date && !(msg.date instanceof Date))  { msg.date = new Date(msg.date);  }
            
            // wikify the text
            msg.text = $("<span>").wiki(msg.text).html();
            
            if (msg.delay && this.contextFind((ctx) => ctx.name == "chat")) {
                CHATSYSTEM.addTyping(name);
                setTimeout(() => CHATSYSTEM.addMsg(name,msg),Util.fromCssTime(msg.delay));
            } else {
                CHATSYSTEM.addMsg(name,msg);
            }
            
        }
    });

    Macro.add("msg-delete",{
        handler: function() {
            const p   = State.variables.chatsystem;
            const msg = (typeof this.args[0] === "object") 
                ? this.args[0]
                : macroPairedArgsParser(this.args);
            
            if (!msg.from) { this.error("You must specify a from."); }
            if (!msg.to)   { this.error("You must specify a to.");   }
            if (!msg.id)   { this.error("You must specify a msg id to delete.");   }
            if (!Array.isArray(msg.to)) { msg.to = [msg.to]; }
            
            const name = CHATSYSTEM.conversationId(msg.from,msg.to);
            CHATSYSTEM.deleteMsg(name,msg.id);
        }
    });

    Macro.add("history",{
        handler: function() {
            const p    = State.variables.chatsystem;
            const chat = this.contextFind((ctx) => ctx.name == "chat");
            const conf = chat?.self?.conf ?? ((typeof this.args[0] === "object") 
                ? this.args[0]
                : macroPairedArgsParser(this.args,1));
            
            if (!conf.from) { conf.from = this.args[0]; }
            if (!Array.isArray(conf.with)) { conf.with = [conf.with]; }
            if (conf.at && !(conf.at instanceof Date)) { conf.at = new Date(conf.at); }
            
            const name = CHATSYSTEM.conversationId(conf.from,conf.with);
            if (!name) { this.error("You must specify who the chat is between"); }
            
            const app   = $(`<div class="chat_sequence" id="${name}">`);
            const tails = setup["@CHATSYSTEM/Options"]?.tails ? "tails" : "";
            let   last  = { date: 0, from: '' };
            
            for (const [i,msg] of p[name].entries()) {
            let from_to = msg.from == conf.from ? 'from' : 'to';
            if (conf.at && msg.date) {
                if ((msg.date.getTime() - last.date) > CHATSYSTEM.interval) {
                    app.append(CHATSYSTEM.date(conf.at,msg.date));
                }
                last.date = msg.date.getTime();
            }
            if (msg.title) {
                app.append(`<div class='date'>${msg.title}</div>`);
            }
            if (conf.with.length > 1 && msg.from != last.from) {
                if (msg.from != conf.from) {
                    app.append(`<div class='chat_from chat_msg_${from_to} chat_name_${msg.from.replace(' ','_').toLowerCase()}'>${msg.from}</div>`);
                }
                last.from = msg.from;
            }
            app.append($(`
                <div class="chat_msg ${tails}
                            chat_msg_${msg.from.replace(' ','_').toLowerCase()} 
                            chat_msg_${from_to}">
                    <p>${msg.text}</p>
                </div>
            `));
            }
            
            State.temporary.curr = CHATSYSTEM.currentId(name);
            $(this.output).append(app);
        }
    });

    Macro.add("chat",{
        tags: null,
        conf: {},
        handler: function() {
            this.self.conf = (typeof this.args[0] === "object") 
                ? this.args[0]
                : macroPairedArgsParser(this.args,1);
            const conf = this.self.conf;
            
            if (!conf.from) { conf.from = this.args[0]; }
            if (!Array.isArray(conf.with)) { conf.with = [conf.with]; }
            
            const name   = CHATSYSTEM.conversationId(conf.from,conf.with);
            const styled = setup["@CHATSYSTEM/Options"].styled ? 'styled' : '';
            CHATSYSTEM.initChat(name);
            
            $(this.output).wiki(`<<nobr>>
                <div class='chat_container'>
                    <<do tag "${name}" element "div">>
                        <<history>>
                        <div class='chat_response ${styled}'>
                            ${this.payload[0].contents}
                        </div>
                    <</do>>
                </div><</nobr>>`); 
        }
    });

    Macro.add("chat-delete",{
        handler: function() {
            const conf = (typeof this.args[0] === "object") 
                ? this.args[0]
                : macroPairedArgsParser(this.args,1);
            
            if (!conf.from) { conf.from = this.args[0]; }
            if (!Array.isArray(conf.with)) { conf.with = [conf.with]; }
            
            const name = CHATSYSTEM.conversationId(conf.from,conf.with);
            CHATSYSTEM.deleteChat(name);
        }
    });

})();