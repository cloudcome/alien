/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-07 16:08
 */


define(function (require, exports, module) {
    /**
     * @module widgets/tip
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
    var defaults = {
        width: 'auto',
        minWidth: 100,
        title: null,
        buttons: [],
        addClass: 'alien-widgets-tip',
        sureIndex: 0,
        isModal: false,
        timeout: 3456,
        autoFocus: false
    };
    var lastMsg = null;
    //var maybeMobile = 'ontouchend' in document;

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

    //if (maybeMobile) {
    //    event.on(document, 'focusin focusout', 'input,textarea,select', controller.debounce(function () {
    //        if (lastMsg) {
    //            var onposition;
    //
    //            lastMsg.before('position', onposition = function (to) {
    //                to.marginTop = attribute.scrollTop(window) / 2;
    //                lastMsg.un('beforeposition', onposition);
    //            });
    //            lastMsg.position();
    //        }
    //    }, 345, false));
    //}

    ui.importStyle(require('./tip.css', 'css'));
});