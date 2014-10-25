define(function (require) {
    'use strict';

    var event = require('/src/core/event/base.js');
    var div1 = document.getElementById('div1');
    var btn1 = document.getElementById('btn1');
    var btn2 = document.getElementById('btn2');
    var btn3 = document.getElementById('btn3');
    var fn3 = function(eve){
        console.log('btn3 click');
        console.log(this);
        console.log(eve);

        event.un(btn3, 'click', fn3);
    };

    event.on(div1, 'click', 'button', function (eve) {
        console.log(this);
        console.log(eve);

        if(this.className === 'btn2'){
            return !1;
        }
    });

    event.on(btn1, 'click', function(eve){
        console.log(this);
        console.log(eve);
    });

    event.on(btn2, 'click', function(eve){
        console.log(this);
        console.log(eve);

        return !1;
    });

    event.on(btn3, 'click', fn3);

    event.on(document, 'click', function (eve) {
        console.log('document click');
        console.log(this);
        console.log(eve.target);
    });
});