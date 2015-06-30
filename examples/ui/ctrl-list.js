/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-25 11:33
 */


define(function (require, exports, module) {
    'use strict';

    var CtrlList = require('../../src/ui/ctrl-list/');
    var event = require('../../src/core/event/base.js');
    var random = require('../../src/utils/random.js');
    var dato = require('../../src/utils/dato.js');
    var cl = new CtrlList();

    cl.on('sure', function (choose) {
        console.log(choose);
    });

    event.on(document, 'contextmenu', function (eve) {
        var list = [];

        dato.repeat(random.number(1, 30), function () {
            var str = random.string(random.number(2, 10), 'aA');

            list.push({
                value: str,
                text: str
            });
        });

        if (cl.visible) {
            cl.close(function () {
                cl.update(list).open(eve);
            });
        } else {
            cl.update(list).open(eve);
        }

        return false;
    });
});