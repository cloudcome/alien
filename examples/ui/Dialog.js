define(function (require) {
    var Dialog = require('/src/ui/Dialog.js');
    var demo1 = document.getElementById('demo1');
    var demo2 = document.getElementById('demo2');
    var demo3 = document.getElementById('demo3');

    var d1 = new Dialog(demo1);
    var d2 = new Dialog(demo2,{
        width: 350,
        height: 400,
        top: 0,
        title: null,
        wrap: false,
        canDrag: false
    });
    var d3 = new Dialog(demo3, {
        remote: 'http://wap.baidu.com/'
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
//
//        document.getElementById('destroy2').onclick = function () {
//            d2.destroy();
//        };

    document.getElementById('open3').onclick = function () {
        d3.open();
    };
});