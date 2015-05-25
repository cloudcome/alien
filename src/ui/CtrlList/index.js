/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-25 09:53
 */


define(function (require, exports, module) {
    /**
     * @module ui/CtrlList/
     */

    'use strict';

    var ui = require('../');
    var Popup = require('../Popup/');
    var Template = require('../../libs/Template.js');
    var style = require('./style.css', 'css');
    var template = require('./template.html', 'html');
    var tpl = new Template(template);
    var event = require('../../core/event/hotkey.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var typeis = require('../../utils/typeis.js');
    var dato = require('../../utils/dato.js');
    var alienClass = 'alien-ui-ctrllist';
    var alienIndex = 0;
    var defaults = {
        offset: {
            left: 0,
            top: 0
        }
    };

    var CtrlList = ui.create({
        constructor: function (list, options) {
            var the = this;

            the._list = list || [];
            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },


        /**
         * 更新 list
         * @param list {Array} 列表
         * @returns {CtrlList}
         */
        update: function (list) {
            var the = this;

            list = list || [];
            the._list = list.map(function (item) {
                if (typeis.string(item)) {
                    return {
                        text: item,
                        value: item
                    };
                }

                return item;
            });

            the._length = the._list.length;
            the._index = 0;
            the._popup.setContent(tpl.render({
                list: the._list,
                id: alienIndex++
            }));

            return the;
        },


        /**
         * 打开控制列表
         * @param [position] {Object} 指定位置
         * @param [position.width] {Number} 指定位置
         * @param [position.height] {Number} 指定位置
         * @param [position.pageX] {Number} 指定位置
         * @param [position.left] {Number} 指定位置
         * @param [position.top] {Number} 指定位置
         * @param [position.pageY] {Number} 指定位置
         * @param [callback] {Function} 回调
         * @returns {CtrlList}
         */
        open: function (position, callback) {
            var the = this;

            if (position && 'pageX' in position) {
                position.width = 1;
                position.height = 1;
                position.left = position.pageX;
                position.top = position.pageY;
            }

            the._popup.open(position, callback);

            return the;
        },


        /**
         * 关闭控制列表
         * @param callback
         * @returns {CtrlList}
         */
        close: function (callback) {
            var the = this;

            the._popup.close(callback);

            return the;
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;

            the._initNode();
            the.update(the._list);
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;

            the._popup = new Popup(window, {
                arrowSize: 0,
                priority: 'side',
                offset: the._options.offset,
                addClass: alienClass
            });
            the._$popup = the._popup.getNode();
        },

        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;

            event.on();
        }
    });

    modification.importStyle(style);
    CtrlList.defaults = defaults;
    module.exports = CtrlList;
});