define(function (require) {
    'use strict';

    var Template = require('../../src/libs/Template.js');
    var dato = require('../../src/utils/dato.js');
    var $textarea = document.getElementById('template');
    var $render = document.getElementById('render');
    var $btn = document.getElementById('btn');
    var $data = document.getElementById('data');
    var dd = {
        name: 'Jane Yim',
        love: '<b>FED</b>',
        books: [{
            type: '科技',
            list: ['JavaScript']
        },{
            type: '文学',
            list: ['百年孤独', '飘']
        }],
        user: {
            email: null
        },
        bio: undefined
    };
    //var t = new Template($textarea.value);
    //
    //$render.innerHTML = t.render(dd);
    //$data.innerHTML = JSON.stringify(dd, null, 4);
    //
    //$btn.onclick = function () {
    //    var t = new Template($textarea.value);
    //    $render.innerHTML = t.render(dd);
    //    $data.innerHTML = JSON.stringify(dd, null, 4);
    //};

    var list = [];
    dato.repeat(1000, function () {
        list.push();
    });
    console.time('1000条数据x1000次渲染');
    var tpl = new Template('{{list list as item}}{{item}}{{/list}}');
    dato.repeat(1000, function () {
        tpl.render({
            list: list
        });
    });
    console.timeEnd('1000条数据x1000次渲染');
});