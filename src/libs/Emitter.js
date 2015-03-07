/*!
 * Emitter.js
 * @author ydr.me
 * 2014-09-19 11:20
 */


define(function (require, exports, module) {
    /**
     * @module libs/Emitter
     * @requires utils/dato
     * @requires utils/typeis
     * @requires utils/class
     */
    'use strict';

    var dato = require('../utils/dato.js');
    var typeis = require('../utils/typeis.js');
    var klass = require('../utils/class.js');
    var regSpace = /\s+/g;
    var alienId = 0;
    var Emitter = klass.create(function () {
        this._eventsPool = {};
        this._eventsLimit = 999;
    });


    /**
     * 添加事件回调
     * @method on
     * @param {String} eventType 事件类型，多个事件类型使用空格分开
     * @param {Function} listener 事件回调
     *
     * @example
     * var emitter = new Emitter();
     * emitter.on('hi', fn);
     */
    Emitter.fn.on = function (eventType, listener) {
        var the = this;

        _middleware(eventType, function (et) {
            if (!the._eventsPool[et]) {
                the._eventsPool[et] = [];
            }

            if (the._eventsPool[et].length === the._eventsLimit) {
                throw new Error('instance event `' + et + '` pool is full as ' + this._eventsLimit);
            }

            if (typeis(listener) === 'function') {
                the._eventsPool[et].push(listener);
            }
        });

        return the;
    };


    /**
     * 移除事件回调
     * @method un
     * @param {String} eventType 事件类型，多个事件类型使用空格分开
     * @param {Function} [listener] 事件回调，缺省时将移除该事件类型上的所有事件回调
     *
     * @example
     * var emitter = new Emitter();
     * emitter.un('hi', fn);
     * emitter.un('hi');
     */
    Emitter.fn.un = function (eventType, listener) {
        var the = this;

        _middleware(eventType, function (et) {
            if (the._eventsPool[et] && listener) {
                dato.each(this._eventsPool, function (index, _listener) {
                    if (listener === _listener) {
                        the._eventsPool.splice(index, 1);
                        return !1;
                    }
                });
            } else {
                the._eventsPool = [];
            }
        });

        return the;
    };


    /**
     * 事件触发，只要有一个事件返回false，那么就返回false，非链式调用
     * @method emit
     * @param {Object} context 指定上下文，默认为 Emitter 实例对象
     * @param {String|Object} [eventType] 事件类型，多个事件类型使用空格分开
     * @param {...*} arg 事件传参，多个参数依次即可
     * @returns {*} 函数执行结果
     *
     * @example
     * var emitter = new Emitter();
     * emitter.emit('hi', 1, 2, 3);
     * emitter.emit('hi', 1, 2);
     * emitter.emit('hi', 1);
     * emitter.emit('hi');
     * emitter.emit(window, 'hi');
     * emitter.emit(window, 'hi', 1);
     * emitter.emit(window, 'hi', 1, 2);
     * emitter.emit(window, 'hi', 1, 2, 3);
     */
    Emitter.fn.emit = function (context, eventType/*arguments*/) {
        var the = this;
        var args = arguments;
        var arg0 = args[0];
        var arg0IsObject = typeis(arg0) !== 'string';
        var arg1 = args[1];
        var emitArgs = Array.prototype.slice.call(arguments, arg0IsObject ? 2 : 1);
        var ret = true;

        context = arg0IsObject ? arg0 : the;
        eventType = arg0IsObject ? arg1 : arg0;

        if (!the._eventsPool) {
            throw new Error('can not found emitter eventsPool');
        }

        _middleware(eventType, function (et) {
            if (the._eventsPool[et]) {
                var time = Date.now();
                dato.each(the._eventsPool[et], function (index, listener) {
                    context.alienEvent = {
                        type: et,
                        timestamp: time,
                        id: alienId++
                    };

                    if (listener.apply(context, emitArgs) === false) {
                        ret = false;
                    }
                });
            }
        });

        return ret;
    };

    /**
     * 中间件，处理事件分发
     * @param {String} eventTypes 事件类型
     * @param {Function} callback 回调处理
     * @private
     */
    function _middleware(eventTypes, callback) {
        dato.each(eventTypes.trim().split(regSpace), function (index, eventType) {
            callback(eventType);
        });
    }

    /**
     * @constructor
     */
    module.exports = Emitter;
});