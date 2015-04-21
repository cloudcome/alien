/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-04-21 13:54
 */


define(function (require, exports, module) {
    /**
     * @requires utils/class
     * @requires libs/Emitter
     * @module libs/Queue
     */
    'use strict';

    var klass = require('../utils/class.js');
    var Emitter = require('./Emitter.js');
    var STATES = {
        ready: 1,
        begin: 2,
        pause: 3,
        stop: 4
    };
    var Queue = klass.create(function () {
        var the = this;

        the._queueList = [];
        the.state = STATES.ready;
        the._initEvent();
    }, Emitter);

    Queue.STATES = STATES;


    Queue.implement({
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
         * @param did {Function}
         * @returns {Queue}
         *
         * @example
         * queue.push(function(next){
         *     // 标记完成，或者 this.stop() / this.pause()
         *     next();
         * });
         */
        push: function (did) {
            var the = this;

            the._queueList.push(did);
            /**
             * @event push
             */
            the.emit('push');

            return the;
        },


        /**
         * 任务出队列
         * @returns {Queue}
         */
        shift: function () {
            var the = this;

            the._queueList.shift();
            /**
             * @event shift
             */
            the.emit('shift');

            return the;
        },


        /**
         * 开始执行队列
         * @returns {Queue}
         */
        begin: function () {
            var the = this;

            if (the.state > STATES.ready) {
                return the;
            }

            the.state = STATES.begin;

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
                    the.emit('pause');
                    return the;
                }

                if (the.state === STATES.stop) {
                    /**
                     * @event stop
                     */
                    the.emit('stop');
                    the.state = STATES.ready;

                    /**
                     * @event done
                     */
                    the.emit('done');
                    return the;
                }

                var task = the._queueList.shift();

                if (!task) {
                    the.state = STATES.ready;
                    /**
                     * @event done
                     */
                    the.emit('done');
                    return the;
                }

                task.call(the, function () {
                    /**
                     * @event step
                     */
                    the.emit('step');
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


            if (the.state !== STATES.begin) {
                return the;
            }

            the.state = STATES.pause;

            return the;
        },


        /**
         * 接续队列
         * @returns {Queue}
         */
        continue: function () {
            var the = this;

            if (the.state !== STATES.pause) {
                return the;
            }

            the.state = STATES.ready;

            return the.begin();
        },


        /**
         * 停止队列
         * @returns {Queue}
         */
        stop: function () {
            var the = this;

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
            the.emit('clear');

            return the;
        }
    });


    module.exports = Queue;
});