/**
 * editor card
 * @author ydr.me
 * @create 2015-12-24 19:50
 */


define(function (require, exports, module) {
    'use strict';

    var ui = require('../index.js');
    var Mask = require('../mask/index.js');
    var Popup = require('../popup/index.js');
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var modification = require('../../core/dom/modification.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/base.js');

    var defaults = {
        style: {
            width: 400,
            height: 'auto',
            background: '#fff',
            minWidth: 'none',
            maxWidth: 'none'
        },
        template: '',
        autoClose: 500,
        animation: {
            duration: 123
        },
        mask: false,
        arrowPriority: 'center'
    };
    var Card = ui.create({
        constructor: function (options) {
            var the = this;

            the._options = dato.extend(true, {}, defaults, options);
            the._initNode();
            the._initEvent();
        },

        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;

            if (options.mask) {
                the._mask = new Mask(window);
            }

            the._popup = new Popup(window, {
                priority: options.arrowPriority,
                style: options.style
            });
            the._popup.html(options.template);
            the._eCard = the._popup.getNode();
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var timeid = 0;
            var options = the._options;
            var node = the._eCard;

            event.on(node, 'mouseover', the._onmouseover = function () {
                clearTimeout(timeid);
            });

            event.on(node, 'mouseout', the._onmouseout = function () {
                if (options.autoClose > -1) {
                    timeid = setTimeout(function () {
                        the.close();
                    }, options.autoClose);
                }
            });
        },


        /**
         * 获取节点
         * @returns {Node|*}
         */
        getNode: function () {
            return this._popup.getNode();
        },


        /**
         * 打开卡片
         * @param target {*} 参考目标
         * @param [callback] {Function} 回调
         * @returns {Card}
         */
        open: function (target, callback) {
            var the = this;

            the.emit('beforeopen');
            if (the._mask) {
                the._mask.open();
            }

            the._popup.open(target, function () {
                if (typeis.Function(callback)) {
                    callback.call(the);
                }

                the.emit('open');
            });

            return the;
        },


        /**
         * 关闭卡片
         * @param [callback] {Function} 回调
         * @returns {Card}
         */
        close: function (callback) {
            var the = this;

            the.emit('beforeclose');
            the._popup.close(function () {
                if (the._mask) {
                    the._mask.close();
                }

                if (typeis.Function(callback)) {
                    callback.call(the);
                }

                the.emit('close');
            });
            return the;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;
            var node = the._eCard;

            event.un(node, 'mouseover', the._onmouseover);
            event.un(node, 'mouseout', the._onmouseout);
            the._popup.destroy();
        }
    });

    Card.defaults = defaults;
    module.exports = Card;
});