/*!
 * Deferred.js
 * @author ydr.me
 * @create 2014-10-09 15:31
 */


define(function (require, exports, module) {
    /**
     * @module util/Deferred
     * @requires util/class
     * @requires util/data
     */
    'use strict';

    var klass = require('./class.js');
    var data = require('./data.js');
    var noop = function () {
        // ignore
    };
    var Deferred = klass.create({
        constructor: function () {
            // 0       ->    1     ->         2
            // pending -> progress -> resolved/rejected
            var the = this;
            the.state = 'pending';
            the.code = 0;
            the.callbacks = {
                progress: [],
                resolved: [],
                rejected: [],
                always: []
            };
        },
        /**
         * 设置进度
         * @param {*} value 进度对象
         * @param {*} [context] 上下文
         * @returns {Deferred}
         * @chainable
         */
        notify: function (value, context) {
            var the = this;

            the._progress = value;

            data.each(the.callbacks.progress, function (index, cb) {
                cb.call(context, value);
            });

            return this;
        },
        /**
         * 成功回调
         * @param {Function} callback 回调函数
         * @returns {Deferred}
         * @chainable
         */
        done: function (callback) {
            this.callbacks.resolved.push(data.type(callback) === 'function' ? callback : noop);

            return this;
        },
        /**
         * 失败回调
         * @param {Function} callback 回调函数
         * @returns {Deferred}
         * @chainable
         */
        fail: function (callback) {
            this.callbacks.rejected.push(data.type(callback) === 'function' ? callback : noop);

            return this;
        },
        /**
         * 总是回调
         * @param {Function} doneCallback 成功回调
         * @param {Function} failCallback 失败回调
         * @returns {Deferred}
         */
        always: function (doneCallback, failCallback) {
            this.callbacks.rejected.push([
                    data.type(doneCallback) === 'function' ? doneCallback : noop,
                    data.type(failCallback) === 'function' ? failCallback : noop
            ]);

            return this;
        },
        /**
         * 进度回调
         * @param {Function} callback 回调函数
         * @returns {Deferred}
         */
        progress: function (callback) {
            this.callbacks.progress.push(data.type(callback) === 'function' ? callback : noop);

            return this;
        },
        /**
         * 改变当前结果为成功
         * @param {*} result 成功结果
         * @param {Object} [context] 失败上下文，默认为当前Deferred实例
         * @returns {Deferred}
         * @chainable
         */
        resolve: function (result, context) {
            var the = this;

            if (this.code > 1) {
                throw new Error('do not resolve after ' + the.status);
            }

            if (arguments.length === 0) {
                throw new Error('resolve require a result');
            }

            the.state = 'resolved';
            the.code = 2;

            data.each(the.callbacks.always, function (index, cbs) {
                cbs[0].call(context ? context : the, result);
                cbs[1].call(context ? context : the);
            });

            data.each(the.callbacks.resolved, function (index, cb) {
                cb.call(context ? context : the, result);
            });

            return the;
        },
        /**
         * 改变当前结果为失败
         * @param {*} reason 失败原因
         * @param {Object} [context] 失败上下文，默认为当前Deferred实例
         * @returns {Deferred}
         * @chainable
         */
        reject: function (reason, context) {
            var the = this;

            if (the.code > 1) {
                throw new Error('do not reject after ' + the.status);
            }

            if (arguments.length === 0) {
                throw new Error('reject require a reason');
            }

            the.state = 'rejected';
            the.code = 2;

            data.each(the.callbacks.always, function (index, cbs) {
                cbs[0].call(context ? context : the);
                cbs[1].call(context ? context : the, reason);
            });

            data.each(the.callbacks.rejected, function (index, cb) {
                cb.call(context ? context : the, reason);
            });

            return the;
        }
    });

    module.exports = Deferred;
});

