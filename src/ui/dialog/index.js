/*!
 * index.js
 * @author ydr.me
 * @create 2014-10-04 02:33
 */


define(function (require, exports, module) {
    /**
     * @module ui/dialog/index
     * @requires ui/dialog/drag
     */
    'use strict';

    var drag = require('../drag/index.js');
    var modification = require('../../core/dom/modification.js');
    var selector = require('../../core/dom/selector.js');
    var position = require('../../core/dom/position.js');
    var attribute = require('../../core/dom/attribute.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/touch.js');
    var data = require('../../util/data.js');
    var index = 0;
    var zIndex = 9999;
    var html = document.documentElement;
    var body = document.body;
    var overflowClass = 'alien-ui-dialog-overflow';
    var bodyClass = 'alien-ui-dialog-body';
    var titleClass = 'alien-ui-dialog-title';
    var closeClass = 'alien-ui-dialog-close';
    var iframeClass = 'alien-ui-dialog-iframe';
    var noop = function () {
        // ignore
    };
    var defaults = {
        width: 500,
        height: 'auto',
        left: 'center',
        top: 'center',
        title: '无标题对话框',
        duration: 345,
        easing: 'ease-in-out-back',
        // 优先级2
        remote: null,
        remoteHeight: 400,
        // 优先级1
        content: null,
        onopen: noop,
        onclose: noop
    };
    var Dialog = function (ele, options) {
        this.ele = ele;
        this.options = options;
    };

    require('./style.js');

    Dialog.prototype = {
        constructor: Dialog,
        _init: function () {
            index++;

            var the = this;
            var options = the.options;
            var bg = modification.create('div', {
                id: 'alien-ui-dialog-bg-' + index,
                'class': 'alien-ui-dialog-bg'
            });
            var dialog = modification.create('div', {
                id: 'alien-ui-dialog-' + index,
                'class': 'alien-ui-dialog',
                role: 'dialog'
            });
            var bd;


            dialog.innerHTML = '<div class="alien-ui-dialog-container">' +
                (options.title === null ? '' :
                    '<div class="alien-ui-dialog-header">' +
                    '<div class="' + titleClass + '">' + options.title + '</div>' +
                    '<div class="' + closeClass + '">&times;</div>' +
                    '</div>') +
                '<div class="' + bodyClass + '"></div>' +
                '</div>';
            bd = selector.query('.' + bodyClass, dialog)[0];

            modification.insert(bg, body, 'beforeend');
            modification.insert(dialog, bg, 'beforeend');
            modification.insert(the.ele, bd, 'beforeend');

            the.bg = bg;
            the.dialog = dialog;
            the.body = bd;
            the.hasOpen = !1;
            the.zIndex = 0;

            if (options.title !== null) {
                drag(dialog, {
                    handle: '.' + titleClass,
                    zIndex: the.zIndex
                });
            }


            event.on(dialog, 'click tap', '.' + closeClass, function () {
                the.close();
            });

            return the;
        },
        open: function () {
            var winW = position.width(window);
            var winH = position.height(window);
            var the = this;
            var bg = the.bg;
            var dialog = the.dialog;
            var to;
            var options = the.options;

            if (the.hasOpen) {
                return the;
            }

            the.hasOpen = !0;

            attribute.addClass(html, overflowClass);
            attribute.addClass(body, overflowClass);

            if (options.content || options.remote) {
                the.body.innerHTML = '';
            }

            attribute.css(bg, {
                display: 'block',
                zIndex: ++zIndex,
                opacity: 0
            });

            attribute.css(dialog, {
                display: 'block',
                visibility: 'hidden',
                width: options.width,
                height: options.height
            });

            the.zIndex = zIndex;
            to = the._position();
            to.opacity = '';

            attribute.css(dialog, {
                opacity: 0,
                visibility: 'visible',
                width: 0,
                height: 0,
                left: winW / 2,
                top: winH * 2 / 5
            });

            animation.animate(bg, {
                opacity: 1
            }, {
                duration: options.duration,
                easing: options.easing
            });

            animation.animate(dialog, to, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                options.onopen.call(dialog);
            }, function () {
                if (options.content) {
                    //
                } else if (options.remote) {
                    the._remote();
                }
            });

            return the;
        },
        close: function () {
            var the = this;
            var bg = the.bg;
            var dialog = the.dialog;
            var options = the.options;
            var theW = position.width(dialog);
            var theH = position.height(dialog);
            var theL = position.left(dialog);
            var theT = position.top(dialog);

            if (!the.hasOpen) {
                return the;
            }

            the.hasOpen = !1;

            attribute.removeClass(html, overflowClass);
            attribute.removeClass(body, overflowClass);

            animation.animate(dialog, {
                opacity: 0,
                width: 0,
                height: 0,
                left: theL + theW / 2,
                top: theT + theH / 2
            }, {
                duration: options.duration,
                easing: options.easing
            }, function () {

            });

            animation.animate(bg, {
                opacity: 0
            }, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                attribute.css(bg, 'display', 'none');
                options.onclose.call(dialog);
            });

            return the;
        },
        position: function () {
            var the = this;
            var options = the.options;
            var pos = the._position();

            animation.animate(the.dialog, pos, {
                duration: options.duration,
                easing: options.easing
            });

            return the;
        },
        _position: function () {
            var the = this;
            var options = the.options;
            var winW = position.width(window);
            var winH = position.height(window);
            var pos = {};

            animation.stop(the.dialog, !0);

            attribute.css(the.dialog, {
                width: options.width,
                height: options.height
            });

            pos.width = position.width(the.dialog);
            pos.height = position.height(the.dialog);

            if (options.left === 'center') {
                pos.left = (winW - pos.width) / 2;
                pos.left = pos.left < 0 ? 0 : pos.left;
            } else {
                pos.left = options.left;
            }

            if (options.top === 'center') {
                pos.top = (winH - pos.height) * 2 / 5;
                pos.top = pos.top < 0 ? 0 : pos.top;
            } else {
                pos.top = options.top;
            }

            return pos;
        },
        _remote: function () {
            var the = this;
            var options = the.options;
            var iframe = modification.create('iframe', {
                src: options.remote,
                'class': iframeClass,
                style: {
                    height: options.remoteHeight
                }
            });

            the.body.innerHTML = '';
            modification.insert(iframe, the.body, 'beforeend');
            the.position();
        }
    };

    module.exports = function (ele, options) {
        options = data.extend(!0, {}, defaults, options);

        return (new Dialog(ele, options))._init();
    };
});