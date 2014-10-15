/*!
 * Emitter.js
 * @author ydr.me
 * 2014-09-19 11:20
 */


define(function (require, exports, module) {
    /**
     * @module libs/Emitter
     * @require util/data
     */
    'use strict';

    var data = require('../util/data.js');
    var klass = require('../util/class.js');
    var regSpace = /\s+/g;
    var Emitter = klass.create({
        constructor: function () {
            this.eventsPool = {};
            this.maxLength = 999;
        },


        /**
         * 添加事件回调
         * @method on
         * @param {String} eventType 事件类型，多个事件类型使用空格分开
         * @param {Function} listener 事件回调
         * @returns {Emitter}
         * @chainable
         *
         * @example
         * var emitter = new Emitter();
         * emitter.on('hi', fn);
         */
        on: function (eventType, listener) {
            var the = this;

            _middleware(eventType, function (et) {
                if (!the.eventsPool[et]) {
                    the.eventsPool[et] = [];
                }

                if (the.eventsPool[et].length === the.maxLength) {
                    throw new Error('event `' + et + '` pool is full as 999');
                }

                if (data.type(listener) === 'function') {
                    the.eventsPool[et].push(listener);
                }
            });

            return the;
        },


        /**
         * 移除事件回调
         * @method un
         * @param {String} eventType 事件类型，多个事件类型使用空格分开
         * @param {Function} [listener] 事件回调，缺省时将移除该事件类型上的所有事件回调
         * @returns {Emitter}
         * @chainable
         *
         * @example
         * var emitter = new Emitter();
         * emitter.un('hi', fn);
         * emitter.un('hi');
         */
        un: function (eventType, listener) {
            var the = this;

            _middleware(eventType, function (et) {
                if (the.eventsPool[et] && listener) {
                    data.each(this.eventsPool, function (index, _listener) {
                        if (listener === _listener) {
                            the.eventsPool.splice(index, 1);
                            return !1;
                        }
                    });
                } else {
                    the.eventsPool = [];
                }
            });

            return the;
        },


        /**
         * 事件触发
         * @method emit
         * @param {String} eventType 事件类型，多个事件类型使用空格分开
         * @param {...*} arg 事件传参，多个参数依次即可
         * @returns {Emitter}
         * @chainable
         *
         * @example
         * var emitter = new Emitter();
         * emitter.emit('hi', 1, 2, 3);
         * emitter.emit('hi', 1, 2);
         * emitter.emit('hi', 1);
         * emitter.emit('hi');
         */
        emit: function (eventType) {
            var the = this;
            var args = Array.prototype.slice.call(arguments, 1);

            if(!the.eventsPool){
                throw new Error('can not found emitter eventsPool');
            }

            _middleware(eventType, function (et) {
                if (the.eventsPool[et]) {
                    data.each(the.eventsPool[et], function (index, listener) {
                        listener.apply(the, args);
                    });
                }
            });

            return the;
        }
    });


    /**
     * 中间件，处理事件分发
     * @param {String} eventTypes 事件类型
     * @param {Function} callback 回调处理
     * @private
     */
    function _middleware(eventTypes, callback) {
        data.each(eventTypes.trim().split(regSpace), function (index, eventType) {
            callback(eventType);
        });
    }

    /**
     * @constructor
     */
    module.exports = Emitter;
});