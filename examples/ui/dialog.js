define(function (require) {
    'use strict';

    var Dialog = require('/src/ui/dialog/');
    var d1 = new Dialog('#demo1');
    var d2 = new Dialog('#demo2', {
        width: 350,
        height: 500,
        top: 0,
        title: null,
        wrap: false,
        canDrag: false,
        isModal: false
    });
    var d3 = new Dialog(null, {
        remote: 'http://wap.baidu.com/'
    });
    var d4 = new Dialog({
        template: '<h1>template</h1>'
    });

    document.getElementById('open1').onclick = function () {
        d1.open();
    };

    document.getElementById('close1').onclick = function () {
        d1.close();
    };

    document.getElementById('open2').onclick = function () {
        d2.open();
    };

    document.getElementById('close2').onclick = function () {
        d2.close();
    };

    document.getElementById('open3').onclick = function () {
        d3.open();
    };

    document.getElementById('open4').onclick = function () {
        d4.open();
    };
});