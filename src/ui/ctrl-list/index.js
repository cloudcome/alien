/*!
 * 控制列表
 * @author ydr.me
 * @create 2015-05-25 09:53
 */


define(function (require, exports, module) {
    /**
     * @module ui/ctrl-list/
     * @requires ui/
     * @requires ui/popup/
     * @requires libs/template
     * @requires core/event/hotkey
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires utils/typeis
     * @requires utils/dato
     */

    'use strict';

    var ui = require('../');
    var Popup = require('../popup/');
    var Template = require('../../libs/template.js');
    var style = require('./style.css', 'css');
    var template = require('./template.html', 'html');
    var tpl = new Template(template);
    var event = require('../../core/event/hotkey.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var typeis = require('../../utils/typeis.js');
    var dato = require('../../utils/dato.js');
    var doc = document;
    var alienClass = 'alien-ui-ctrllist';
    var alienIndex = 0;
    var defaults = {
        offset: {
            left: 0,
            top: 0
        },
        maxHeight: 300
    };

    var CtrlList = ui.create({
        constructor: function (list, options) {
            var the = this;

            the._list = list || [];
            the._options = dato.extend(true, {}, defaults, options);
            the.destroyed = false;
            the._initNode();
            the.update(the._list);
            the._initEvent();
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

            if (!the._length) {
                return the.close();
            }

            the._index = 0;

            the._text = the._list[0].text;
            the._value = the._list[0].value;

            the._popup.setContent(tpl.render({
                list: the._list,
                id: alienIndex++
            }));
            the._$items = selector.query('.' + alienClass + '-item', the._$popup);

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

            if (the.visible || !the._length) {
                return the;
            }

            if (position && 'pageX' in position) {
                position.width = 1;
                position.height = 1;
                position.left = position.pageX;
                position.top = position.pageY;
            }

            the.emit('open');
            the.visible = true;
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

            if (!the.visible) {
                return the;
            }

            the.visible = false;
            the._popup.close(callback);
            the.emit('close');

            return the;
        },



        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;

            the._popup = new Popup(window, {
                arrowSize: 0,
                priority: 'side',
                offset: options.offset,
                addClass: alienClass
            });
            the._$popup = the._popup.getNode();
            attribute.css(the._$popup, 'maxHeight', options.maxHeight);
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var activeClass = alienClass + '-item-active';
            var activeIndex = function (isKeyboard) {
                var $item = the._$items[the._index];
                the._value = attribute.data($item, 'value');
                the._text = $item.innerText;
                attribute.removeClass(the._$items, activeClass);
                attribute.addClass($item, activeClass);

                if (isKeyboard) {
                    var itemsHeight = attribute.outerHeight($item) * (the._index + 2);
                    var containerHeight = attribute.outerHeight(the._$popup);

                    if (itemsHeight > containerHeight) {
                        attribute.scrollTop(the._$popup, itemsHeight - containerHeight);
                    }else{
                        attribute.scrollTop(the._$popup, 0);
                    }
                }
            };

            the._onsure = function () {
                if (!the.visible) {
                    return;
                }

                the.close();
                the.emit('sure', {
                    text: the._text,
                    value: the._value,
                    index: the._index
                });
                return false;
            };

            the._onclose = function () {
                if (!the.visible) {
                    return;
                }

                the.close();
            };

            // 悬浮高亮
            event.on(the._$popup, 'mouseover', '.' + alienClass + '-item', the._onhover = function () {
                the._index = attribute.data(this, 'index') * 1;
                activeIndex();
            });

            // 单击
            event.on(the._$popup, 'click', '.' + alienClass + '-item', the._onsure);

            // 上移
            event.on(doc, 'up', the._onup = function () {
                if (!the.visible || the._index === 0) {
                    return;
                }

                the._index--;
                activeIndex(true);
            });

            // 下移
            event.on(doc, 'down', the._ondown = function () {
                if (!the.visible || the._index === the._length - 1) {
                    return;
                }

                the._index++;
                activeIndex(true);
            });

            // esc
            event.on(doc, 'esc', the._onclose);

            // return
            event.on(doc, 'return', the._onsure);

            // 单击其他地方
            event.on(doc, 'click', the._onclose);
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            if (the.destroyed) {
                return;
            }

            the.destroyed = true;
            event.un(doc, 'up', the._onup);
            event.un(doc, 'down', the._ondown);
            event.un(doc, 'esc', the._onclose);
            event.un(doc, 'return', the._onsure);
            event.un(the._$popup, 'click mouseover');
            the._popup.destroy();
        }
    });

    ui.importStyle(style);
    CtrlList.defaults = defaults;
    module.exports = CtrlList;
});