Macro.add('curse',{
    tags: null,
    handler: function() {
        const above = ['&#768;','&#769;','&#770;','&#771;','&#772;','&#773;','&#774;','&#775;','&#776;','&#777;','&#778;','&#779;','&#780;','&#781;','&#782;','&#783;','&#784;','&#785;','&#786;','&#787;','&#788;','&#789;','&#794;','&#795;','&#829;','&#830;','&#831;','&#832;','&#833;','&#834;','&#835;','&#836;','&#838;','&#842;','&#843;','&#844;','&#848;','&#849;','&#850;','&#855;','&#856;','&#859;','&#861;','&#862;','&#864;','&#865;'];

        const below = ['&#790;','&#791;','&#792;','&#793;','&#796;','&#797;','&#798;','&#799;','&#800;','&#801;','&#802;','&#803;','&#804;','&#805;','&#806;','&#807;','&#808;','&#809;','&#810;','&#811;','&#812;','&#813;','&#814;','&#815;','&#816;','&#817;','&#818;','&#819;','&#825;','&#826;','&#827;','&#828;','&#837;','&#839;','&#840;','&#841;','&#845;','&#846;','&#851;','&#852;','&#853;','&#854;','&#857;','&#858;','&#860;','&#863;','&#866;'];

        const over = ['&#820;','&#821;','&#822;','&#823;','&#824;'];

        const latin = ['&#867;','&#868;','&#869;','&#870;','&#871;','&#872;','&#873;','&#874;','&#875;','&#876;','&#877;','&#878;','&#879;'];
        
        let c        = this.args[0] ?? 3;
        let $input   = $("<span>").wiki(this.payload[0].contents);
        
        function curse(nodes) {
          if (nodes && nodes.length) {
          	/* copy the node array because we will modify the original */
            const nodeArr = Array.from(nodes);
            for (const node of nodeArr) {
                if (node && node.nodeType === Node.TEXT_NODE) {
                    const letters = node.data.split('');
                    let tout = '';
                    for (let i = 0; i < letters.length; i++) {
                        const l_above = Math.floor(Math.pow(Math.random(),2) * c);
                        const l_below = Math.floor(Math.pow(Math.random(),2) * c);
                        const l_over  = random(1,10);
                        const l_latin = random(1,10);
                        tout += letters[i];
                        if (l_above) {
                            tout += above.randomMany(l_above).join('');
                        }
                        if (l_below) {
                            tout += below.randomMany(l_below).join('');
                        }
                        if (l_over <= c) {
                            tout += over.randomMany(Math.ceil(c/3)).join('');
                        }
                        if (l_latin <= c) {
                            tout += latin.randomMany(Math.ceil(c/3)).join('');
                        }
                    }
                    $(node).replaceWith(tout);
                } else if (node) {
                    curse(node.childNodes,$(node));
                }
            }
          }
        }
        
        curse($input[0].childNodes);
        $(this.output).append($input.html());
    }
});