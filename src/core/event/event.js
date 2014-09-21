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
        create: function create(eventType, properties, details) {
            var et = new Event(eventType, properties);

            data.each(details, function (key, val) {
                et[key] = val;
            });

            return et;
        },
        dispatch: function dispatch(element, eventTypeOrEvent){
            var et;

            if(data.type(eventTypeOrEvent) === 'string'){
                et = this.create(eventTypeOrEvent,{
                    // 是否冒泡
                    bubbles: true,
                    // 是否可以被取消
                    cancelable: true
                });
            }else{
                et = eventTypeOrEvent;
            }

            element.dispatchEvent(et);
        },
        on: function on(element, eventType, selector, listener, isCapture) {
            var callback;
            var events = eventType.trim().split(regSpace);

            // on self
            // .on(body, 'click', fn);
            if(data.type(selector) === 'function'){
                isCapture = listener;
                callback = selector;
            }
            // delegate
            // .on(body, 'click', 'p', fn)
            else{
                callback = function (eve) {
                    // 符合当前事件 && 最近的DOM符合选择器 && 触发dom在当前监听dom里
                    var closestElement = domSelector.closest(eve.target, selector);

                    if(events.indexOf(event.type) > -1 && closestElement.length && element.contains(closestElement[0])){
                        listener.call(closestElement, eve);
                    }
                }
            }

            data.each(events, function (index, eventType) {
                element.addEventListener(eventType, callback, isCapture);
            });
        }
    };
});