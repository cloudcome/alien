/*!
 * Howdo
 * 适应了 global 与 window
 * @author ydr.me
 * 2014年7月26日19:28:27
 * 2014年8月26日13:09:31
 * 2014年10月24日00:24:32
 * 2015年02月04日11:42:57
 * 2015年07月01日17:35:20
 */


define(function (require, exports, module) {
    'use strict';

    var _global = typeof window !== 'undefined' ? window : global;
    var slice = Array.prototype.slice;
    var noop = function () {
        // ignore
    };
    /**
     * 判断是否为函数
     * @param obj
     * @returns {boolean}
     */
    var isFunction = function (obj) {
        return typeof obj === 'function';
    };


    /**
     * 遍历
     * @param object
     * @param callback
     */
    var each = function (object, callback) {
        var i;
        var j;

        if (object && object.constructor === Array) {
            for (i = 0, j = object.length; i < j; i++) {
                callback(i, object[i]);
            }
        } else if (typeof object === "object") {
            for (i in object) {
                if (object.hasOwnProperty && object.hasOwnProperty(i)) {
                    callback(i, object[i]);
                } else {
                    callback(i, object[i]);
                }
            }
        }
    };

    /**
     * 下一次
     * @param callback
     */
    var nextTick = function (callback) {
        setTimeout(callback, 0);
    };

    module.exports = {
        task: function () {
            if (this.constructor === Howdo) {
                return this;
            }

            var args = slice.call(arguments);
            var howdo = new Howdo();

            return howdo.task.apply(howdo, args);
        },
        each: function () {
            if (this.constructor === Howdo) {
                return this;
            }

            var args = slice.call(arguments);
            var howdo = new Howdo();

            return howdo.each.apply(howdo, args);
        }
    };


//////////////////////////////////////////////////////////////////////
/////////////////////////[ constructor ]//////////////////////////////
//////////////////////////////////////////////////////////////////////

// 构造函数
    function Howdo() {
        var the = this;

        // 任务队列
        the.tasks = [];
        // 是否已经开始执行任务了
        the.hasStart = false;
        // 标识任务序号
        the.index = 0;
        the._tryCallbacks = [];
        the._catchCallbacks = [];
        the._allCallback = null;
    }

    Howdo.prototype = {
        /**
         * 单次分配任务
         * @param {Function} fn 任务函数
         * @return Howdo
         * @chainable
         * @example
         * // next约定为串行执行汇报，后面接follow
         * // 建议next只返回一个结果
         * // err对象必须是Error的实例
         * howdo.task(function(next){
         *     next(new Error('错误'), 1);
         * });
         *
         * // done约定为并行执行汇报，后面接together
         * // 建议done只返回一个结果
         * // err对象必须是Error的实例
         * howdo.task(function(){
         *     done(new Error('错误'), 1);
         * });
         */
        task: function (fn) {
            var the = this;

            if (!isFunction(fn)) {
                throw new Error('howdo `task` must be a function');
            }

            fn.index = the.index++;
            the.tasks.push(fn);

            return the;
        },


        /**
         * 循环分配任务
         * @param  {Object}   object   对象或者数组
         * @param  {Function} callback 回调
         * @return Howdo
         * @example
         * // follow
         * // err对象必须是Error的实例
         * howdo.each([1, 2, 3], function(key, val, next, lastData){
         *     // lastData 第1次为 undefined
         *     // lastData 第2次为 1
         *     // lastData 第3次为 2
         *     next(null, val);
         * }).follow(function(err, data){
         *     // err = null
         *     // data = 3
         * });
         *
         * // together
         * // err对象必须是Error的实例
         * howdo.each([1, 2, 3], function(key, val, done){
         *     done(null, val);
         * }).together(function(err, data1, data2, dat3){
         *     // err = null
         *     // data1 = 1
         *     // data2 = 2
         *     // data3 = 3
         * });
         */
        each: function (object, callback) {
            var howdo = this;

            each(object, task);

            function task(key, val) {
                howdo = howdo.task(function () {
                    var args = [key, val];
                    args = args.concat(slice.call(arguments));
                    callback.apply(val, args);
                });
            }

            return howdo;
        },


        /**
         * 跟着做，任务串行执行
         * 链式结束
         * @param [callback] {Function} 回调
         * @example
         * howdo
         * .task(function(next){
         *     next(null, 1);
         * })
         * .task(function(next, data){
         *     // data = 1
         *     next(null, 2, 3);
         * })
         * .task(function(next, data1, data2){
         *     // data1 = 2
         *     // data2 = 3
         *     next(null, 4, 5, 6);
         * })
         * .follow(function(err, data1, data2, data3){
         *     // err = null
         *     // data1 = 1
         *     // data2 = 2
         *     // data3 = 3
         * });
         */
        follow: function (callback) {
            var the = this;

            if (the.hasStart) {
                return the;
            }

            if (!isFunction(callback)) {
                callback = noop;
            }

            the._allCallback = callback;
            the.hasStart = true;

            var current = 0;
            var tasks = the.tasks;
            var count = tasks.length;
            var args = [];

            nextTick(function () {
                if (!count) {
                    the._fixCallback();
                    return the;
                }

                (function _follow() {
                    var fn = function () {
                        args = slice.call(arguments);

                        if (args[0]) {
                            return the._fixCallback(args[0]);
                        }

                        current++;

                        if (current === count) {
                            the._fixCallback.apply(the, args);
                        } else if (current < count) {
                            args.shift();
                            _follow();
                        }
                    };

                    args.unshift(fn);
                    tasks[current].apply(_global, args);
                })();
            });

            return the;
        },


        /**
         * 一起做，任务并行执行
         * 链式结束
         * @param [callback] {Function} 回调
         * @example
         * howdo
         * .task(function(done){
         *     done(null, 1);
         * })
         * .task(function(done){
         *     done(null, 2, 3);
         * })
         * .task(function(done){
         *     done(null, 4, 5, 6);
         * })
         * .together(function(err, data1, data2, data3, data4, data5, data6){
         *     // err = null
         *     // data1 = 1
         *     // data2 = 2
         *     // data3 = 3
         *     // data4 = 4
         *     // data5 = 5
         *     // data6 = 6
         * });
         */
        together: function (callback) {
            var the = this;

            if (the.hasStart) {
                return;
            }

            if (!isFunction(callback)) {
                callback = noop;
            }

            the._allCallback = callback;
            the.hasStart = true;

            var done = 0;
            var tasks = the.tasks;
            var count = tasks.length;
            var taskData = [];
            var hasCallback = false;
            var i = 0;

            nextTick(function () {
                if (!count) {
                    the._fixCallback();
                    return the;
                }

                for (; i < count; i++) {
                    _doTask(i, tasks[i]);
                }

                function _doTask(index, task) {
                    var fn = function () {
                        if (hasCallback) {
                            return;
                        }

                        var args = slice.call(arguments);
                        var ret = [];
                        var i = 0;

                        if (args[0]) {
                            hasCallback = true;
                            return the._fixCallback(args[0]);
                        }

                        taskData[index] = args.slice(1);
                        done++;

                        if (done === count) {
                            for (; i < taskData.length; i++) {
                                ret = ret.concat(taskData[i]);
                            }

                            ret.unshift(null);
                            the._fixCallback.apply(the, ret);
                        }
                    };

                    task(fn);
                }
            });

            return the;
        },
        /**
         * 正常回调
         * @param callback
         */
        try: function (callback) {
            var the = this;

            if (isFunction(callback)) {
                the._tryCallbacks.push(callback);
            }

            return the;
        },
        /**
         * 异常回调
         * @param callback
         */
        catch: function (callback) {
            var the = this;

            if (isFunction(callback)) {
                the._catchCallbacks.push(callback);
            }

            return the;
        },
        /**
         * 修正回调
         * @param err
         * @private
         */
        _fixCallback: function (err/*arguments*/) {
            var the = this;
            var args = slice.call(arguments, 1);

            the._allCallback.apply(_global, arguments);

            if (err) {
                return each(the._catchCallbacks, function (i, callback) {
                    callback.call(_global, err);
                });
            }

            each(the._tryCallbacks, function (i, callback) {
                callback.apply(_global, args);
            });
        }
    };
});