define(function (require) {
    var Dangke = require('../../src/libs/Dangke.js');

    document.body.innerHTML = Dangke.isDangke;


    function dfn(obj){
        return Object.defineProperties(obj, {
            name: {
                get: function () {
                    console.log('get');
                    return this.name2;
                },
                set: function (val) {
                    console.log('set', val);
                    this.name2 = val;
                }
            }
        });
    }

    var o = dfn({});

    o.name = 'xx';
});
