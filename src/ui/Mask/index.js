/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-01-11 13:06
 */


define(function (require, exports, module) {
    /**
     * @module ui/Mask/
     * @requires util/dato
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/dom/animation
     * @requires ui/base
     */
    'use strict';

    var dato = require('../../util/dato.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var animation = require('../../core/dom/animation.js');
    var ui = require('../base.js');
    var alienIndex = 0;
    var alienClass = 'alien-ui-mask';
    var defaults = {
        addClass: '',
        zIndex: null,
        duration: 234,
        easing: 'ease-in-out-circ'
    };
    var Mask = ui.create({
        constructor: function ($cover, options) {
            var the = this;

            the._$cover = selector.query($cover)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the.visible = false;
            the._init();
        },

        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;
            var options = the._options;
            var style = {
                display: 'none'
            };

            the._$mask = modification.create('div', {
                id: alienClass + '-' + alienIndex++,
                style: style,
                'class': alienClass
            });
            attribute.addClass(the._$mask, options.addClass);
            modification.insert(the._$mask, document.body);

            return the;
        },


        /**
         * 获得需要覆盖的尺寸
         * @returns {*}
         * @private
         */
        _getSize: function () {
            var the = this;
            var $cover = the._$cover;

            // 其他节点
            if ($cover) {
                return {
                    position: 'absolute',
                    width: attribute.width($cover),
                    height: attribute.height($cover),
                    top: attribute.top($cover),
                    left: attribute.left($cover)
                };
            }

            return {
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            };
        },


        /**
         * 打开 mask
         */
        open: function () {
            var the = this;

            if (the.visible) {
                return the;
            }

            var pos = the._getSize();

            pos.display = 'block';
            pos.zIndex = the._options.zIndex || ui.getZindex();
            attribute.css(the._$mask, pos);
            the.visible = true;
            the.emit('open');

            return the;
        },


        /**
         * 重置尺寸
         * @param pos
         */
        resize: function (pos) {
            var the = this;

            if (!the.visible) {
                return the;
            }

            var options = the._options;

            pos = dato.extend({}, the._getSize(), pos);
            animation.animate(the._$mask, pos, {
                duation: options.duration,
                easing: options.easing
            }, function () {
                the.emit('resize');
            });

            return the;
        },


        /**
         * 关闭 mask
         */
        close: function () {
            var the = this;

            if (!the.visible) {
                return the;
            }

            attribute.css(the._$mask, 'display', 'none');
            the.visible = false;

            return the;
        },


        /**
         * 获取当前 mask 节点
         * @returns {HTMLElementNode}
         */
        getNode: function () {
            return this._$mask;
        }
    });


    /**
     * 构造一个 mask
     * @param $cover {Object} 欲覆盖的节点
     * @param [options] {Object} 配置
     * @param [options.zIndex=null] {Number} 层级，默认为null，即自动分配
     * @param [options.addClass=""] {String} 添加的 className，默认为空
     * @param [options.duration=234] {Number} resize 时的动画时间
     * @param [options.easing="ease-in-out-circ"] {Number} resize 时的动画缓冲
     */
    module.exports = Mask;
});