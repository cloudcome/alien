/*!
 * base.js
 * @author ydr.me
 * 2014-09-21 15:04
 */


define(function (require, exports, module) {
    /**
     * @module core/event/base
     */
    'use strict';

    var data = require('../../util/data.js');
    var domSelector = require('../dom/selector.js');
    var regSpace = /\s+/g;
    // 原始事件：用户传入的事件
    // {
    //     1: {
    //         "click": [],
    //         "mouseover": [],
    //         ...
    //     }
    // }
    var unCaptureOriginalListeners = {};
    var isCaptureOriginalListeners = {};
    // 实际事件：运算后的事件
    var unCaptureActualListeners = {};
    var isCaptureActualListeners = {};
    // 真实事件：真正处于监听的事件
    var unCaptureRealListeners = {};
    var isCaptureRealListeners = {};
    var domId = 0;
    var key = 'alienElement_' + Date.now();


    /**
     * static
     * @type {{create: create, dispatch: dispatch, on: on, un: un}}
     */
    module.exports = {
        /**
         * 事件创建
         * @param {String} eventType 事件类型
         * @param {Object} [properties] 事件属性
         * @param {Object} [details] 事件信息
         * @static
         * @returns {Event}
         */
        create: function (eventType, properties, details) {
            var et = new Event(eventType, properties);

            data.each(details, function (key, val) {
                et[key] = val;
            });

            return et;
        },

        /**
         * 触发事件
         * @param {HTMLElement|Node|EventTarget} element 元素
         * @param {Event|String} eventTypeOrEvent 事件类型或事件名称
         * @returns {Object} this
         * @static
         * @chainable
         */
        dispatch: function (element, eventTypeOrEvent) {
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

            return this;
        },

        /**
         * 事件监听
         * @param {Object|HTMLElement|Node} element 元素
         * @param {String} eventType 事件类型，多个事件使用空格分开
         * @param {String} [selector] 事件委托时的选择器，默认空
         * @param {Function} listener 事件回调
         * @param {Boolean} [isCapture] 是否事件捕获，默认false
         * @returns {Object} this
         * @static
         * @chainable
         */
        on: function (element, eventType, selector, listener, isCapture) {
            if (!element.addEventListener) {
                return this;
            }

            var callback;
            var eventTypes = eventType.trim().split(regSpace);
            var isCapture = arguments[arguments.length - 1];

            if (data.type(isCapture) !== 'boolean') {
                isCapture = !1;
            }

            // on self
            // .on(body, 'click', fn);
            if (data.type(arguments[2]) === 'function') {
                callback = arguments[2];
                listener = arguments[2];
            }
            // delegate
            // .on(body, 'click', 'p', fn)
            else if (data.type(listener) === 'function') {
                callback = function (eve) {
                    // 符合当前事件 && 最近的DOM符合选择器 && 触发dom在当前监听dom里
                    var closestElement = domSelector.closest(eve.target, selector);

                    if (eventTypes.indexOf(event.type) > -1 && closestElement.length && element.contains(closestElement[0])) {
                        return listener.call(closestElement[0], eve);
                    }
                }
            }

            if (callback) {
                data.each(eventTypes, function (index, eventType) {
                    _on(element, eventType, callback, listener, isCapture);
                });
            }

            return this;
        },

        /**
         * 移除事件监听
         * @param {window|HTMLElement|Node} element 元素
         * @param {String} eventType 事件类型
         * @param {Function} listener 回调
         * @param {Boolean} [isCapture] 是否事件捕获，默认false
         * @returns {Object} this
         * @static
         * @chainable
         */
        un: function (element, eventType, listener, isCapture) {
            if (!element.addEventListener) {
                return this;
            }

            var eventTypes = eventType.trim().split(regSpace);

            data.each(eventTypes, function (index, eventType) {
                _un(element, eventType, listener, isCapture);
            });

            return this;
        }
    };


    /**
     * 添加事件监听队列
     * @param {HTMLElement|Object} element 元素
     * @param {String} eventType 单个事件类型
     * @param {Function} actualListener 实际事件
     * @param {Function} originalListener 原始事件
     * @param {Boolean} isCapture 是否事件捕获
     * @private
     */
    function _on(element, eventType, actualListener, originalListener, isCapture) {
        // 写入 DOMId，以便后续认识它
        if (!element[key]) {
            element[key] = ++domId;
        }

        var id = element[key];

        unCaptureOriginalListeners[id] = unCaptureOriginalListeners[id] || {};
        isCaptureOriginalListeners[id] = isCaptureOriginalListeners[id] || {};
        unCaptureActualListeners[id] = unCaptureActualListeners[id] || {};
        isCaptureActualListeners[id] = isCaptureActualListeners[id] || {};
        unCaptureRealListeners[id] = unCaptureRealListeners[id] || {};
        isCaptureRealListeners[id] = isCaptureRealListeners[id] || {};
        unCaptureOriginalListeners[id][eventType] = unCaptureOriginalListeners[id][eventType] || [];
        isCaptureOriginalListeners[id][eventType] = isCaptureOriginalListeners[id][eventType] || [];
        unCaptureActualListeners[id][eventType] = unCaptureActualListeners[id][eventType] || [];
        isCaptureActualListeners[id][eventType] = isCaptureActualListeners[id][eventType] || [];

        if (isCapture) {
            isCaptureOriginalListeners[id][eventType].push(originalListener);
            isCaptureActualListeners[id][eventType].push(actualListener);

            if (!isCaptureRealListeners[id][eventType]) {
                isCaptureRealListeners[id][eventType] = !0;

                element.addEventListener(eventType, function (eve) {
                    var the = this;
                    var domId = the[key];
                    var eventType = eve.type;

                    data.each(isCaptureActualListeners[domId][eventType], function (index, listener) {
                        if (listener.call(the, eve) === !1) {
                            try {
                                eve.preventDefault();
                                eve.stopPropagation();
                                eve.stopImmediatePropagation();
                            } catch (err) {
                                // ignore
                            }
                        }
                    });
                }, !0);
            }
        } else {
            unCaptureOriginalListeners[id][eventType].push(originalListener);
            unCaptureActualListeners[id][eventType].push(actualListener);

            if (!unCaptureRealListeners[id][eventType]) {
                unCaptureRealListeners[id][eventType] = !0;

                element.addEventListener(eventType, function (eve) {
                    var the = this;
                    var domId = the[key];
                    var eventType = eve.type;

                    data.each(unCaptureActualListeners[domId][eventType], function (index, listener) {
                        if (listener.call(the, eve) === !1) {
                            try {
                                eve.preventDefault();
                                eve.stopPropagation();
                                eve.stopImmediatePropagation();
                            } catch (err) {
                                // ignore
                            }
                        }
                    });
                }, !1);
            }
        }
    }


    /**
     * 移除事件队列
     * @param {HTMLElement|Object} element 元素
     * @param {String} eventType 单个事件类型
     * @param {Function} originalListener 原始事件
     * @param {Boolean} isCapture 是否事件捕获
     * @private
     */
    function _un(element, eventType, originalEvent, isCapture) {
        var domId = element[key];
        var findIndex;

        if (domId) {
            if (isCapture) {
                findIndex = isCaptureOriginalListeners[domId][eventType].indexOf(originalEvent);

                if (findIndex > -1) {
                    isCaptureOriginalListeners[domId][eventType].splice(findIndex, 1);
                    isCaptureActualListeners[domId][eventType].splice(findIndex, 1);
                }
            } else {
                findIndex = unCaptureOriginalListeners[domId][eventType].indexOf(originalEvent);

                if (findIndex > -1) {
                    unCaptureOriginalListeners[domId][eventType].splice(findIndex, 1);
                    unCaptureActualListeners[domId][eventType].splice(findIndex, 1);
                }
            }
        } else {
            element.removeEventListener(eventType, originalEvent, isCapture);
        }
    }
});
