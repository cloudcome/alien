/*!
 * Msg
 * @author ydr.me
 * @create 2015-01-12 10:47
 */


define(function (require, exports, module) {
    /**
     * @module ui/Msg/
     * @module ui/Mask/
     * @module ui/Window/
     */

    'use strict';

    var Mask = require('../Mask/');
    var Window = require('../Window/');
    var ui = require('../base.js');
    var dato = require('../../util/dato.js');
    var typeis = require('../../util/typeis.js');
    var Template = require('../../libs/Template.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/drag.js');
    var template = require('html!./template.html');
    var style = require('css!./style.css');
    var tpl = new Template(template);
    var alienIndex = 0;
    var alienClass = 'alien-ui-msg';
    var defaults = {
        width: 300,
        height: 'auto',
        left: 'center',
        top: 'center',
        title: '提示',
        content: '提示',
        addClass: '',
        buttons: null,
        canDrag: true,
        isModal: true,
        timeout: -1,
        duration: 345,
        easing: 'ease-in-out-back',
        zIndex: null
    };
    var Msg = ui.create({
        constructor: function (options) {
            var the = this;

            if (typeis.string(options)) {
                options = {
                    content: options
                };
            }

            the._options = dato.extend(true, {}, defaults, options);
            the._options.buttons = the._options.buttons || [];
            the.id = alienIndex++;
            the._init();
        },


        _init: function () {
            var the = this;

            the._initNode();
            the._mask.open();
            the._window.open();

            return the;
        },


        _initNode: function () {
            var the = this;
            var options = the._options;

            the._mask = new Mask(window, {
                addClass: alienClass + '-bg',
                zIndex: options.zIndex
            });
            the._mask.__msg = the;
            the._$mask = the._mask.getNode();
            the._window = new Window(null, {
                parentNode: the._$mask,
                width: options.width,
                height: options.height,
                left: options.left,
                top: options.top,
                duration: options.duration,
                easing: options.easing,
                zIndex: options.zIndex
            });
            the._$window = the._window.getNode();

            var html = tpl.render({
                id: the.id,
                title: options.title,
                canDrag: options.canDrag,
                windowId: the._$window.id,
                body: options.content,
                buttons: options.buttons
            });
            var node = modification.parse(html)[0];
            var nodes = selector.query('.j-flag', node);

            modification.insert(node, the._$window);
            the._$msg = node;
            the._$header = nodes[0];
            the._$title = nodes[1];
            the._$close = nodes[2];
            the._$body = nodes[3];
            the._$buttons = nodes[4];
        },


        _initEvent: function () {
            var the = this;

            // 关闭 msg
            event.on(the._$close, 'click', function () {
                the.destroy();
            });

            // 点击按钮
            event.on(the._$buttons, 'click', '.j-flag', function () {
                var index = attribute.data(this, 'index');

                the.emit('close', index);
                the.destroy();
            });

            // 单击背景
            event.on(the._$mask, 'click', function (eve) {
                var $window = selector.closest(eve.target, '#' + the._$window.id)[0];

                if (!$window && the.emit('hitbg') !== false) {
                    the.shake();
                }

                return false;
            });
        },


        /**
         * 震晃窗口以示提醒
         */
        shake: function () {
            var the = this;

            the._window.shake();

            return the;
        },


        destroy: function () {
            var the = this;

            event.un(the._$close, 'click');
            event.un(the._$buttons, 'click');
        }
    });

    event.on(document, 'keyup', function (eve) {
        var mask;
        var msg;

        if (eve.which === 27 && Mask.maskWindowList.length) {
            mask = Mask.getTopMask();
            msg = mask.__msg;

            if (msg.emit('esc') !== false) {
                msg.shake();
            }
        }
    });

    module.exports = Msg;
    modification.importStyle(style);
});