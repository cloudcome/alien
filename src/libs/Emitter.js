/*!
 * Emitter.js
 * @author ydr.me
 * 2014-09-19 11:20
 */


define(function (require, exports, module) {
    /**
     * @module libs/Emitter
     * @requires utils/allocation
     * @requires utils/dato
     * @requires utils/typeis
     * @requires utils/class
     */
    'use strict';

    var allocation = require('../utils/allocation.js');
    var dato = require('../utils/dato.js');
    var typeis = require('../utils/typeis.js');
    var klass = require('../utils/class.js');
    var regSpace = /\s+/g;
    var alienId = 0;
    var Emitter = klass.create(function () {
        var the = this;

        // 监听的事件 map
        the._emitterListener = {};
        // 监听的事件长度
        the._emitterLimit = 999;
        // 事件传输目标
        the._emitterTargetList = [];
    });


    Emitter.implement({
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
        on: function (eventType, listener) {
            var the = this;

            _middleware(eventType, function (et) {
                if (!the._emitterListener[et]) {
                    the._emitterListener[et] = [];
                }

                if (the._emitterListener[et].length === the._emitterLimit) {
                    throw new Error('instance event `' + et + '` pool is full as ' + this._emitterLimit);
                }

                if (typeis.function(listener)) {
                    the._emitterListener[et].push(listener);
                }
            });

            return the;
        },


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
        un: function (eventType, listener) {
            var the = this;

            _middleware(eventType, function (et) {
                if (the._emitterListener[et] && listener) {
                    dato.each(the._emitterListener, function (index, _listener) {
                        if (listener === _listener) {
                            the._emitterListener.splice(index, 1);
                            return false;
                        }
                    });
                } else {
                    the._emitterListener = [];
                }
            });

            return the;
        },


        /**
         * 事件触发，只要有一个事件返回false，那么就返回false，非链式调用
         * @method emit
         * @param {Object} context 指定上下文，默认为 Emitter 实例对象
         * @param {String|Object} [eventType] 事件类型，多个事件类型使用空格分开
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
        emit: function (context, eventType/*arguments*/) {
            var the = this;
            var args = allocation.args(arguments);
            var arg0 = args[0];
            var arg0IsObject = typeis(arg0) !== 'string';
            var arg1 = args[1];
            var emitArgs = [].slice.call(arguments, arg0IsObject ? 2 : 1);
            var ret = true;

            context = arg0IsObject ? arg0 : the;
            eventType = arg0IsObject ? arg1 : arg0;

            if (!the._emitterListener) {
                throw new Error('can not found emitterListener varible');
            }

            _middleware(eventType, function (et) {
                the._pipe(et, emitArgs);

                if (the._emitterListener[et]) {
                    var time = Date.now();

                    dato.each(the._emitterListener[et], function (index, listener) {
                        context.alienEmitter = {
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
        },


        /**
         * 将所有的事件派发到目标
         * @param target {Object}
         */
        pipe: function (target) {
            var the = this;

            the._emitterTargetList.push(target);

            return the;
        },


        /**
         * 派发事件
         * @param eventType
         * @param args
         * @private
         */
        _pipe: function (eventType, args) {
            dato.each(this._emitterTargetList, function (index, target) {
                target.alienEmitter = {
                    type: eventType,
                    timestamp: Date.now(),
                    id: alienId++
                };
                args.unshift(eventType);
                target.emit.apply(target, args);
            });
        }
    });


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