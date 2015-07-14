/*!
 * alert
 * @author ydr.me
 * @create 2014-12-14 16:34
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
        title: '提示',
        buttons: ['好'],
        addClass: 'alien-widgets-alert',
        sureIndex: 0
    };
    var Confirm = ui.create(function (content, options) {
        options = dato.extend(true, {}, defaults, options, {
            content: content && content.message ? content.message : String(content)
        });

        var the = this;

        the.alert = new Msg(options).on('close', function (index) {
            the.emit('close', index);
            the.emit(index === -1 ? 'cancel' : 'sure');
        });
    });

    module.exports = function (content, options) {
        return new Confirm(content, options);
    };
});