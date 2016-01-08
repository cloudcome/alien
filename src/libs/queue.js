/**
 * 队列控制
 * @author ydr.me
 * @create 2015-04-21 13:54
 */


define(function (require, exports, module) {
    /**
     * @module libs/queue
     * @requires utils/typeis
     * @requires utils/class
     * @requires libs/emitter
     * @module libs/queue
     */
    'use strict';

    var noop = function () {
        //
    };
    var typeis = require('../utils/typeis.js');
    var klass = require('../utils/class.js');
    var dato = require('../utils/dato.js');
    var Emitter = require('./emitter.js');
    var STATES = {
        ready: 1,
        start: 2,
        pause: 3,
        stop: 4
    };
    var index = 0;
    var defaults = {
        // 自动开始
        auto: false
    };
    var Queue = klass.extends(Emitter).create({
        constructor: function (options) {
            var the = this;

            the.id = index++;
            the._index = 0;
            the._options = dato.extend({}, defaults, options);
            the._queueList = [];
            the.state = STATES.ready;
            the.className = 'queue';
            the._initEvent();
        },
        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;

            the.on('push shift step done', function () {
                /**
                 * @event size
                 * @param size {Number} 队列长度
                 */
                the.emit('size', the.size());
            });
        },


        /**
         * 任务入队列
         * @param task {Function}
         * @param [callback] {Function}
         * @returns {Queue}
         *
         * @example
         * queue.push(function(next){
         *     // 标记完成，或者 this.stop() / this.pause()
         *     next();
         * });
         */
        push: function (task, callback) {
            var the = this;

            callback = typeis.function(callback) ? callback : noop;
            the._queueList.push({
                index: the._index++,
                t: task,
                c: callback
            });

            /**
             * @event push
             */
            the.emit('pushed');

            if (the._options.auto) {
                the.start();
            }

            return the;
        },


        /**
         * 任务出队列
         * @returns {Queue}
         */
        shift: function () {
            var the = this;

            var item = the._queueList.shift();

            if (item) {
                /**
                 * 任务虽然没有完成，但还是要执行回调
                 */
                item.c();
            }

            /**
             * @event shift
             */
            the.emit('shifted');

            return the;
        },


        /**
         * 开始执行队列
         * @returns {Queue}
         */
        start: function () {
            var the = this;

            if (the.state > STATES.ready) {
                return the;
            }

            the.state = STATES.start;

            if (the.size() === 0) {
                the.state = STATES.ready;
                /**
                 * @event done
                 */
                the.emit('done');
                return the;
            }

            var next = function () {
                if (the.state === STATES.pause) {
                    /**
                     * @event pause
                     */
                    the.emit('paused');
                    return the;
                }

                if (the.state === STATES.stop) {
                    /**
                     * @event stop
                     */
                    the.emit('stoped');
                    the.state = STATES.ready;

                    /**
                     * @event done
                     */
                    the.emit('done');
                    return the;
                }

                var item = the._queueList.shift();

                if (!item) {
                    the.state = STATES.ready;
                    /**
                     * @event done
                     */
                    the.emit('done');
                    return the;
                }

                item.t.call(the, function () {
                    /**
                     * @event step
                     */
                    the.emit('steped');
                    item.c();
                    next();
                });
            };

            next();

            return the;
        },


        /**
         * 暂停队列
         * @returns {Queue}
         */
        pause: function () {
            var the = this;


            if (the.state !== STATES.start) {
                return the;
            }

            the.state = STATES.pause;

            return the;
        },


        /**
         * 恢复队列
         * @returns {Queue}
         */
        resume: function () {
            var the = this;

            if (the.state !== STATES.pause) {
                return the;
            }

            the.state = STATES.ready;

            return the.start();
        },


        /**
         * 停止队列
         * @returns {Queue}
         */
        stop: function () {
            var the = this;

            /**
             * 停止任务之前，需要依次执行之前注册的回调
             */
            the._queueList.forEach(function (item) {
                item.c();
            });

            the._queueList = [];

            if (the.state === STATES.pause) {
                /**
                 * @event done
                 */
                the.emit('done');
            }

            the.state = STATES.stop;
            return the;
        },


        /**
         * 队列长度
         * @returns {Number}
         */
        size: function () {
            return this._queueList.length;
        },


        /**
         * 清除队列
         */
        clear: function () {
            var the = this;

            the._queueList = [];
            /**
             * @event clear
             */
            the.emit('cleared');

            return the;
        }
    });


    Queue.STATES = STATES;
    module.exports = Queue;
});