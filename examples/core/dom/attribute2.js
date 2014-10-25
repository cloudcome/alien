define(function (require) {
    'use strict';

    var attribute = require('/src/core/dom/attribute.js');
    var ret = document.getElementById('ret');
    var demo = document.getElementById('demo');
    var div3 = document.getElementById('div3');
    var str = '';
    var key = 'width';

    window.attribute = attribute;
    window.demo = demo;

    str += key + ' = ' + attribute[key](demo);
    str += '<br>' + key + '设置为 200<br>';
    attribute[key](demo, 200);
    str += key + ' = ' + attribute[key](demo);

    console.log(attribute.width(div3));
//        console.log(attribute.state(div3));
//        console.log(attribute.state(div3, 'show'));

    ret.innerHTML = str;
});