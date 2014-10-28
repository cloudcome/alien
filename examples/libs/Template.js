define(function (require) {
    'use strict';

    var Template = require('/src/libs/Template.js');
    var textarea = document.getElementById('template');
    var render = document.getElementById('render');
    var data = document.getElementById('data');
    var btn = document.getElementById('btn');
    var dd = {
        name: 'Jane Yim',
        love: '<b>FED</b>',
        books: ['JavaScript 语言精粹', '百年孤独']
    };
    var t = new Template(textarea.value);
    Template.addFilter('test1', function (val) {
        return '【test1过滤' + val +'】'
    });
    Template.addFilter('test2', function (val, bef, end) {
        return '《test2过滤' + (bef ? bef : '默认before') + val+(end ? end : '默认end') +'》'
    });
    data.innerHTML = JSON.stringify(dd);
    render.innerHTML = t.render(dd).replace(/</g, '&lt;').replace(/>/g, '&gt;');

    btn.onclick = function () {
        var t = new Template(textarea.value);
        render.innerHTML = t.render(dd).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
});