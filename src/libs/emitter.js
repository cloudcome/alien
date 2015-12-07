/*!
 * Emitter.js
 * @author ydr.me
 * 2014-09-19 11:20
 */


define(function (require, exports, module) {
    /**
     * @module libs/emitter
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


    var Emitter = klass.create({
        /**
         * @constructor Emitter
         * @type {Function}
         */
        constructor: function () {
            var the = this;

            // 监听的事件 map
            the._emitterListener = {};
            // 全局事件监听列表
            the._emitterCallbacks = [];
            // 监听的事件长度
            the._emitterLimit = 999;
            the.className = 'emitter';
        },
        /**
         * 添加事件回调
         * @method on
         * @param {String} eventType 事件类型，多个事件类型使用空格分开
         * @param {Function} listener 事件回调
         * @returns {Emitter}
         *
         * @example
         * var emitter = new Emitter();
         * emitter.on('hi', fn);
         */
        on: function (eventType, listener) {
            var the = this;
            var args = allocation.args(arguments);

            if (args.length === 1) {
                listener = args[0];
                eventType = null;
            }

            if (!typeis.function(listener)) {
                return the;
            }

            if (!eventType) {
                the._emitterCallbacks.push(listener);
                return the;
            }

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
         * 添加事件触发前事件
         * @param eventType {String} 事件，只有 emit beforeSomeEvent 的事件才可以被监听
         * @param listener {Function} 事件回调
         * @returns {Emitter}
         */
        before: function (eventType, listener) {
            var eventType2 = eventType.replace(/^\w/, function (word) {
                return word.toUpperCase();
            });
            var before = 'before';
            return this.on(before + eventType + ' ' + before + eventType2, listener);
        },


        /**
         * 添加事件触发后事件
         * @param eventType {String} 事件，只有 emit afterSomeEvent 的事件才可以被监听
         * @param listener {Function} 事件回调
         * @returns {Emitter}
         */
        after: function (eventType, listener) {
            var eventType2 = eventType.replace(/^\w/, function (word) {
                return word.toUpperCase();
            });
            var after = 'after';
            return this.on(after + eventType + ' ' + after + eventType2, listener);
        },


        /**
         * 移除事件回调
         * @method un
         * @param {String} eventType 事件类型，多个事件类型使用空格分开
         * @param {Function} [listener] 事件回调，缺省时将移除该事件类型上的所有事件回调
         * @returns {Emitter}
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
         * @param {String} [eventType] 事件类型，多个事件类型使用空格分开
         * @returns {*} 函数执行结果
         *
         * @example
         * var emitter = new Emitter();
         * emitter.emit('hi', 1, 2, 3);
         * emitter.emit('hi', 1, 2);
         * emitter.emit('hi', 1);
         * emitter.emit('hi');
         *
         * // 为 before* 的事件可以被派发到 before 回调
         * // 为 after* 的开头的事件可以被派发到 after 回调
         */
        emit: function (eventType/*arguments*/) {
            var the = this;
            var emitArgs = dato.toArray(arguments).slice(1);
            var ret = true;

            _middleware(eventType, function (et) {
                var time = Date.now();

                dato.each(the._emitterCallbacks, function (index, callback) {
                    the.alienEmitter = {
                        type: et,
                        timestamp: time,
                        id: alienId++
                    };

                    callback.apply(the, emitArgs);
                });

                if (the._emitterListener[et]) {
                    dato.each(the._emitterListener[et], function (index, listener) {
                        the.alienEmitter = {
                            type: et,
                            timestamp: time,
                            id: alienId++
                        };

                        if (listener.apply(the, emitArgs) === false) {
                            ret = false;
                        }
                    });
                }
            });

            return ret;
        }
    });


    /**
     * 事件传输
     * @param source {Object} 事件来源
     * @param target {Object} 事件目标
     * @param [types] {Array} 允许和禁止的事件类型
     *
     * @example
     * name 与 ['name'] 匹配
     * name 与 ['!name'] 不匹配
     */
    Emitter.pipe = function (source, target, types) {
        source.on(function () {
            var type = this.alienEmitter.type;

            if (_matches(type, types)) {
                var args = dato.toArray(arguments);

                args.unshift(this.alienEmitter.type);
                target.emit.apply(target, args);
            }
        });
    };


    module.exports = Emitter;

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
     * 判断是否匹配
     * @param name {String} 待匹配字符串
     * @param [names] {Array} 被匹配字符串数组
     * @returns {boolean}
     * @private
     */
    function _matches(name, names) {
        names = names || [];

        if (!names.length) {
            return true;
        }

        var matched = true;

        dato.each(names, function (index, _name) {
            var flag = _name[0];

            // !name
            if (flag === '!') {
                matched = true;

                if (name === _name.slice(1)) {
                    matched = false;
                    return false;
                }
            }
            // name
            else {
                matched = false;

                if (name === _name) {
                    matched = true;
                    return false;
                }
            }
        });

        return matched;
    }
});