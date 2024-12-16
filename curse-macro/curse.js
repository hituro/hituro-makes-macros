Macro.add('curse',{
    tags: null,
    handler: function() {
        const above = ['&#768;','&#769;','&#770;','&#771;','&#772;','&#773;','&#774;','&#775;','&#776;','&#777;','&#778;','&#779;','&#780;','&#781;','&#782;','&#783;','&#784;','&#785;','&#786;','&#787;','&#788;','&#789;','&#794;','&#795;','&#829;','&#830;','&#831;','&#832;','&#833;','&#834;','&#835;','&#836;','&#838;','&#842;','&#843;','&#844;','&#848;','&#849;','&#850;','&#855;','&#856;','&#859;','&#861;','&#862;','&#864;','&#865;'];

        const below = ['&#790;','&#791;','&#792;','&#793;','&#796;','&#797;','&#798;','&#799;','&#800;','&#801;','&#802;','&#803;','&#804;','&#805;','&#806;','&#807;','&#808;','&#809;','&#810;','&#811;','&#812;','&#813;','&#814;','&#815;','&#816;','&#817;','&#818;','&#819;','&#825;','&#826;','&#827;','&#828;','&#837;','&#839;','&#840;','&#841;','&#845;','&#846;','&#851;','&#852;','&#853;','&#854;','&#857;','&#858;','&#860;','&#863;','&#866;'];

        const over  = ['&#820;','&#821;','&#822;','&#823;','&#824;'];

        const latin = ['&#867;','&#868;','&#869;','&#870;','&#871;','&#872;','&#873;','&#874;','&#875;','&#876;','&#877;','&#878;','&#879;'];
        
        let input   = this.payload[0].contents;
        let out     = '';
        for (let i = 0; i < input.length; i++) {
            const l_above = random(0,3);
            const l_below = random(0,3);
            const l_over  = random(0,1);
            const l_latin = random(0,1);
            out += input[i];
            if (l_above) {
                out += above.randomMany(l_above).join('');
            }
            if (l_below) {
                out += below.randomMany(l_below).join('');
            }
            if (l_over) {
                out += over.randomMany(l_over).join('');
            }
            if (l_latin) {
                out += latin.randomMany(l_latin).join('');
            }
        }
        $(this.output).wiki(out);
    }
});
