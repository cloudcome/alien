/*!
 * confirm
 * @author ydr.me
 * @create 2014-12-14 18:12
 */


define(function (require, exports, module) {
    'use strict';

    /**
     * @module widgets/confirm
     * @requires ui/msg/
     * @requires ui/
     * @requires utils/dato
     */

    var ui = require('../ui/');
    var Msg = require('../ui/msg/');
    var dato = require('../utils/dato.js');
    var defaults = {
        title: '确认操作',
        buttons: ['确定', '取消'],
        addClass: 'alien-widgets-confirm',
        sureIndex: 0
    };
    var Confirm = ui.create(function (content, options) {
        options = dato.extend({}, defaults, options, {
            content: content
        });

        var the = this;

        the.confirm = new Msg(options).on('close', function (index) {
            the.emit(options.sureIndex === index ? 'sure' : 'cancel');
        });
    });

    module.exports = function (content, options) {
        return new Confirm(content, options);
    };
});