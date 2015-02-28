/*!
 * Howdo
 * 适应了 global 与 window
 * @author ydr.me
 * 2014年7月26日19:28:27
 * 2014年8月26日13:09:31
 * 2014年10月24日00:24:32
 * 2015年02月04日11:42:57
 */


define(function (require, exports, module) {
    'use strict';

    var _global = window;
    var slice = Array.prototype.slice;
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
        // 任务队列
        this.tasks = [];
        // 是否已经开始执行任务了
        this.hasStart = !1;
        // 标识任务序号
        this.index = 0;
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

            if (typeof fn !== "function") {
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
            var i;
            var j;

            if (object && object.constructor === Array) {
                for (i = 0, j = object.length; i < j; i++) {
                    task(i, object[i]);
                }
            } else if (typeof object === "object") {
                for (i in object) {
                    if (object.hasOwnProperty && object.hasOwnProperty(i)) {
                        task(i, object[i]);
                    } else {
                        task(i, object[i]);
                    }
                }
            } else {
                throw new Error('can not call each on' + object);
            }

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
            if (this.hasStart) {
                return;
            }

            if (typeof callback !== "function") {
                throw new Error('howdo `follow` arguments[0] must be a function');
            }


            this.hasStart = !0;

            var current = 0;
            var tasks = this.tasks;
            var count = tasks.length;
            var args = [];
            //var doneTask = {};

            if (!count) {
                return callback();
            }

            (function _follow() {
                var fn = function () {
                    args = slice.call(arguments);

                    if (args[0]) {
                        return callback.call(_global, args[0]);
                    }

                    current++;

                    if (current === count) {
                        callback.apply(_global, args);
                    } else if (current < count) {
                        args.shift();
                        _follow();
                    }
                };

                args.unshift(fn);
                tasks[current].apply(_global, args);
            })();
        },


        /**
         * 一起做，任务并行执行
         * 链式结束
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
            if (this.hasStart) {
                return;
            }

            if (typeof callback !== "function") {
                throw new Error('howdo `together` arguments[0] must be a function');
            }

            this.hasStart = !0;

            var done = 0;
            var tasks = this.tasks;
            var count = tasks.length;
            var taskData = [];
            var hasCallback = !1;
            var i = 0;

            if (!count) {
                return callback();
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
                        hasCallback = !0;
                        return callback.call(_global, args[0]);
                    }

                    taskData[index] = args.slice(1);
                    done++;

                    if (done === count) {
                        for (; i < taskData.length; i++) {
                            ret = ret.concat(taskData[i]);
                        }

                        ret.unshift(null);
                        callback.apply(_global, ret);
                    }
                };

                task(fn);
            }
        }
    };
});