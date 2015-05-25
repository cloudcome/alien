/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-25 11:33
 */


define(function (require, exports, module) {
    'use strict';

    var CtrlList = require('../../src/ui/CtrlList/');
    var event = require('../../src/core/event/base.js');
    var random = require('../../src/utils/random.js');
    var dato = require('../../src/utils/dato.js');
    var cl = new CtrlList();

    event.on(document, 'contextmenu', function (eve) {
        var list = [];

        dato.repeat(random.number(2, 10), function () {
            var str = random.string(random.number(2, 10), 'aA');
            list.push({
                value: str,
                text: str
            });
        });

        cl.update(list).open(eve);
        return false;
    });
});