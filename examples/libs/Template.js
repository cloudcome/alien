define(function (require) {
    'use strict';

    var Template = require('/src/libs/Template.js');
    var $textarea = document.getElementById('template');
    var $render = document.getElementById('render');
    var $btn = document.getElementById('btn');
    var dd = {
        name: 'Jane Yim',
        love: '<b>FED</b>',
        books: [{
            type: '科技',
            list: ['JavaScript']
        },{
            type: '文学',
            list: ['百年孤独', '飘']
        }]
    };
    var t = new Template($textarea.value);

    $render.innerHTML = t.render(dd);

    $btn.onclick = function () {
        var t = new Template($textarea.value);
        $render.innerHTML = t.render(dd);
    };
});