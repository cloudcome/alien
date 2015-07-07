/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-07 16:08
 */


define(function (require, exports, module) {
    /**
     * @module parent/tip
     */

    'use strict';

    var ui = require('../ui/index.js');
    var Msg = require('../ui/msg/index.js');
    var dato = require('../utils/dato.js');
    var defaults = {
        width: 'auto',
        minWidth: 100,
        title: null,
        buttons: [],
        addClass: 'alien-widgets-tip',
        sureIndex: 0,
        isModal: false,
        timeout: 3456,
        top: 100,
        autoFocus: false
    };
    var lastMsg = null;

    module.exports = function (content, options) {
        options = dato.extend({}, defaults, options, {
            content: content && content.message ? content.message : String(content)
        });

        if (lastMsg) {
            lastMsg.destroy();
        }

        lastMsg = new Msg(options).on('close', function () {
            lastMsg = null;
        });

        return lastMsg;
    };

    ui.importStyle(require('./tip.css', 'css'));
});