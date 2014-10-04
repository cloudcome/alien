/*!
 * base.js
 * @author ydr.me
 * 2014-09-21 15:04
 */


define(function (require, exports, module) {
    /**
     * @module core/event/base
     * @requires util/data
     * @requires core/dom/selector
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
    var key = 'alien-core-event-base-' + Date.now();
    var defaults = {
        // 是否冒泡
        bubbles: !0,
        // 是否可以被阻止冒泡
        cancelable: !0,
        // 事情细节
        detail: {}
    };
    var udf;


    /**
     * static
     * @type {{create: create, dispatch: dispatch, on: on, un: un}}
     */
    module.exports = {
        /**
         * 事件创建
         * @param {String} eventType 事件类型
         * @param {Object} [properties] 事件属性
         * @param {Boolean} [properties.bubbles] 是否冒泡，默认 true
         * @param {Boolean} [properties.cancelable] 是否可以被取消冒泡，默认 true
         * @param {Object} [properties.detail] 事件细节，默认{}
         * @returns {Event}
         *
         * @example
         * event.create('myclick');
         * event.create('myclick', {
         *     bubbles: !0,
         *     cancelable: !0,
         *     detail: {
         *        a: 1,
         *        b: 2
         *     },
         * });
         */
        create: function (eventType, properties) {
            properties = data.extend({}, defaults, properties);

            return new Event(eventType, properties);
        },

        /**
         * 触发事件
         * @param {HTMLElement|Node|EventTarget} ele 元素
         * @param {Event|String} eventTypeOrEvent 事件类型或事件名称
         * @returns {Object} this
         *
         * @example
         * event.dispatch(ele, 'myclick');
         * event.dispatch(ele, myclikEvent);
         */
        dispatch: function (ele, eventTypeOrEvent) {
            var et = data.type(eventTypeOrEvent) === 'string' ?
                this.create(eventTypeOrEvent) :
                eventTypeOrEvent;

            ele.dispatchEvent(et);
        },

        /**
         * 事件监听
         * @param {Object|HTMLElement|Node} element 元素
         * @param {String} eventType 事件类型，多个事件使用空格分开
         * @param {String} [selector] 事件委托时的选择器，默认空
         * @param {Function} listener 事件回调
         * @param {Boolean} [isCapture] 是否事件捕获，默认false
         *
         * @example
         * // un capture
         * event.on(ele, 'click', fn, false):
         * event.on(ele, 'click', 'li', fn, false):
         *
         * // is capture
         * event.on(ele, 'click', fn, true):
         * event.on(ele, 'click', 'li', fn, true):
         */
        on: function (element, eventType, selector, listener, isCapture) {
            if (!element.addEventListener) {
                return;
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
                    if(data.type(listener) === 'function'){
                        _on(element, eventType, callback, listener, isCapture);
                    }
                });
            }
        },

        /**
         * 移除事件监听
         * @param {window|HTMLElement|Node} element 元素
         * @param {String} eventType 事件类型
         * @param {Function} [listener] 回调，回调为空表示删除所有已经在 alien 中注册的事件
         * @param {Boolean} [isCapture] 是否事件捕获，默认false
         *
         * @example
         * // remove one listener
         * event.un(ele, 'click', fn, false);
         * event.un(ele, 'click', fn, true);
         *
         * // remove all listener
         * event.un(ele, 'click', false);
         * event.un(ele, 'click');
         */
        un: function (element, eventType, listener, isCapture) {
            if (!element.addEventListener) {
                return;
            }

            var args = Array.prototype.slice.call(arguments);
            var eventTypes = eventType.trim().split(regSpace);

            data.each(eventTypes, function (index, eventType) {
                args.splice(1, 1, eventType);
                _un.apply(window, args);
            });
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
     * @param {Function} [originalListener] 原始事件，事件为空为删除所有已被 alien 注册事件
     * @param {Boolean} isCapture 是否事件捕获
     * @private
     */
    function _un(element, eventType, originalEvent, isCapture) {
        var domId = element[key];
        var findIndex;
        var args = arguments;
        var argL = args.length;

        if(argL === 3){
            // _un(ele, 'click', true);
            if(data.type(args[2]) === 'boolean'){
                isCapture = args[2];
                originalEvent = null;
            }
            // _un(ele, 'click', fn);
            else{
                isCapture = !1;
            }
        }

        if (domId) {
            if (isCapture) {
                if(data.type(originalEvent) === 'function'){
                    findIndex = isCaptureOriginalListeners[domId][eventType].indexOf(originalEvent);

                    if (findIndex > -1) {
                        isCaptureOriginalListeners[domId][eventType].splice(findIndex, 1);
                        isCaptureActualListeners[domId][eventType].splice(findIndex, 1);
                    }
                }else{
                    isCaptureOriginalListeners[domId][eventType] = [];
                    isCaptureActualListeners[domId][eventType] = [];
                }
            } else {
                if(data.type(originalEvent) === 'function') {
                    findIndex = unCaptureOriginalListeners[domId][eventType].indexOf(originalEvent);

                    if (findIndex > -1) {
                        unCaptureOriginalListeners[domId][eventType].splice(findIndex, 1);
                        unCaptureActualListeners[domId][eventType].splice(findIndex, 1);
                    }
                }else{
                    unCaptureOriginalListeners[domId][eventType] = [];
                    unCaptureActualListeners[domId][eventType] = [];
                }
            }
        } else {
            element.removeEventListener(eventType, originalEvent, isCapture);
        }
    }
});
