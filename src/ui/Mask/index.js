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
     * @requires ui/base
     */
    'use strict';

    var dato = require('../../util/dato.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var ui = require('../base.js');
    var alienIndex = 0;
    var alienClass = 'alien-ui-mask';
    var defaults = {
        addClass: '',
        zIndex: null
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
            var pos = the._getSize();

            pos.display = 'block';
            pos.zIndex = the._options.zIndex || ui.getZindex();
            attribute.css(the._$mask, pos);
            the.visible = true;
        },


        /**
         * 关闭 mask
         */
        close: function () {
            attribute.css(this._$mask, 'display', 'none');
            this.visible = false;
        }
    });


    /**
     * 构造一个 mask
     * @param $cover {Object} 欲覆盖的节点
     * @param [options] {Object} 配置
     * @param [options.zIndex] {Number} 层级，默认为null，即自动分配
     * @param [options.addClass] {String} 添加的 className，默认为空
     */
    module.exports = Mask;
});