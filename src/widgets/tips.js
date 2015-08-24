/*!
 * tips
 * @author ydr.me
 * @create 2015-07-07 16:08
 */


define(function (require, exports, module) {
    /**
     * @module widgets/tips
     * @requires ui/
     * @requires ui/msg/
     * @requires utils/dato
     * @requires utils/controller
     * @requires core/event/base
     * @requires core/dom/attribute
     */

    'use strict';

    var ui = require('../ui/index.js');
    var Msg = require('../ui/msg/index.js');
    var dato = require('../utils/dato.js');
    var controller = require('../utils/controller.js');
    var event = require('../core/event/base.js');
    var attribute = require('../core/dom/attribute.js');
    var namespace = 'alien-widgets-tips';
    var defaults = {
        width: 'auto',
        minWidth: 100,
        title: null,
        buttons: [],
        addClass: '',
        sureIndex: 0,
        isModal: false,
        timeout: 3456,
        autoFocus: false
    };
    var lastMsg = null;

    module.exports = function (content, options) {
        options = dato.extend({}, defaults, options, {
            content: content && content.message ? content.message : String(content)
        });

        options.addClass += ' ' + namespace;

        if (lastMsg) {
            lastMsg.destroy();
        }

        lastMsg = new Msg(options).on('close', function () {
            lastMsg = null;
        });

        return lastMsg;
    };

    ui.importStyle(require('./tips.css', 'css'));
});