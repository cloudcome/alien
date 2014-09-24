/*!
 * event.js
 * @author ydr.me
 * 2014-09-21 15:04
 */


define(function (require, exports, module) {
    /**
     * @module parent/child.js
     */
    'use strict';

    var data = require('../../util/data.js');
    var domSelector = require('../dom/selector.js');
    var regSpace = /\s+/g;

    module.exports = {
        /**
         * 事件创建
         * @param {String} eventType 事件类型
         * @param {Object} [properties] 事件属性
         * @param {Object} [details] 事件信息
         * @returns {Event}
         */
        create: function create(eventType, properties, details) {
            var et = new Event(eventType, properties);

            data.each(details, function (key, val) {
                et[key] = val;
            });

            return et;
        },

        /**
         * 触发事件
         * @param {HTMLElement|Node} element 元素
         * @param {Event|String} eventTypeOrEvent 事件类型或事件名称
         */
        dispatch: function dispatch(element, eventTypeOrEvent) {
            var et;

            if (data.type(eventTypeOrEvent) === 'string') {
                et = this.create(eventTypeOrEvent, {
                    // 是否冒泡
                    bubbles: true,
                    // 是否可以被取消
                    cancelable: true
                });
            } else {
                et = eventTypeOrEvent;
            }

            element.dispatchEvent(et);
        },

        /**
         * 事件监听
         * @param {Object|HTMLElement|Node} element 元素
         * @param {String} eventType 事件类型，多个事件使用空格分开
         * @param {String} [selector] 事件委托时的选择器，默认空
         * @param {Function} listener 事件回调
         * @param {Boolean} [isCapture] 是否事件捕获，默认false
         */
        on: function on(element, eventType, selector, listener, isCapture) {
            var callback;
            var events = eventType.trim().split(regSpace);

            // on self
            // .on(body, 'click', fn);
            if (data.type(arguments[2]) === 'function') {
                isCapture = arguments[3];
                callback = selector;
            }
            // delegate
            // .on(body, 'click', 'p', fn)
            else {
                callback = function (eve) {
                    // 符合当前事件 && 最近的DOM符合选择器 && 触发dom在当前监听dom里
                    var closestElement = domSelector.closest(eve.target, selector);

                    if (events.indexOf(event.type) > -1 && closestElement.length && element.contains(closestElement[0])) {
                        listener.call(closestElement, eve);
                    }
                }
            }

            data.each(events, function (index, eventType) {
                element.addEventListener(eventType, callback, isCapture);
            });
        },

        /**
         * 移除事件监听
         * @param {window|HTMLElement|Node} element 元素
         * @param {String} eventType 事件类型
         * @param {Function} listener 回调
         */
        un: function un(element, eventType, listener) {
            element.removeEventListener(eventType, listener);
        }
    };
});