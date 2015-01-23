define(function (require) {
    'use strict';

    var event = require('/src/core/event/base.js');
    var div1 = document.getElementById('div1');
    var btn1 = document.getElementById('btn1');
    var btn2 = document.getElementById('btn2');
    var btn3 = document.getElementById('btn3');
    var fn3 = function(eve){
        console.log('click btn3');
        console.log(this);
        console.log(eve);

        event.un(btn3, 'click', fn3);
    };

    event.on(div1, 'click', 'button', function (eve) {
        console.log('click div1');
        console.log(this);
        console.log(eve);

        if(this.className === 'btn2'){
            return !1;
        }
    });

    event.once(btn1, 'click', function(eve){
        console.log('click btn1');
        console.log(this);
        console.log(eve);
    });

    event.on(btn2, 'click', function(eve){
        console.log('click btn2');
        console.log(this);
        console.log(eve);

        return !1;
    });

    event.on(btn3, 'click', fn3);

    event.on(document, 'click', function (eve) {
        console.log('click document');
        console.log(this);
        console.log(eve.target);
    });
});