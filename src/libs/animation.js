/*!
 * 动画
 * @author ydr.me
 * @create 2015-02-04 11:36
 */


define(function (require, exports, module) {
    /**
     * @module libs/animation
     * @requires utils/allocation
     * @requires utils/class
     * @requires utils/howdo
     * @requires utils/typeis
     * @requires utils/dato
     * @requires utils/number
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/animation
     */
    'use strict';

    var Emitter = require('./emitter.js');
    var allocation = require('../utils/allocation.js');
    var klass = require('../utils/class.js');
    var howdo = require('../utils/howdo.js');
    var typeis = require('../utils/typeis.js');
    var dato = require('../utils/dato.js');
    var number = require('../utils/number.js');
    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var animation = require('../core/dom/animation.js');
    var noop = function () {
        // ignore
    };
    module.exports = klass.extends(Emitter).create({
        constructor: function () {
            var the = this;

            /**
             * 队列列表
             * @type {Array}
             * @private
             */
            the._queueList = [];

            /**
             * 当前队列索引
             * @type {number}
             * @private
             */
            the._queueIndex = 0;
        },
        /**
         * 追加动画
         * @param $ele
         * @param to
         * @param options
         */
        push: function ($ele, to, options) {
            this._queueList.push({
                $eles: selector.query($ele),
                to: to,
                options: options
            });
        },


        //index: function (index) {
        //
        //};


        /**
         * 执行动画
         * @param [repeatTimes=1] {Number} 重复次数
         * @param [callback] {Function} 执行完毕回调
         */
        start: function (repeatTimes, callback) {
            var the = this;
            var args = allocation.args(arguments);

            if (typeis.function(args[0])) {
                repeatTimes = 1;
                callback = args[0];
            }


            callback = typeis.function(callback) ? callback : noop;

            var times = 0;
            // 单次动画
            var onstep = function (callback) {
                times++;
                howdo
                    .each(the._queueList, function (j, queue, next) {
                        var toType = typeis(queue.to);

                        if (toType === 'string') {
                            howdo.each(queue.$eles, function (k, $ele, done) {
                                animation.keyframes($ele, queue.to, queue.options, done);
                            }).together(function () {
                                /**
                                 * 动画发生变化时
                                 * @event change
                                 * @prarm index {Number} 动画索引
                                 * @prarm times {Number} 动画重复次数
                                 */
                                the.emit('change', j, times + 1);
                                next();
                            });
                        } else {
                            howdo.each(queue.$eles, function (k, $ele, done) {
                                animation.transition($ele, queue.to, queue.options, done);
                            }).together(function () {
                                /**
                                 * 动画发生变化时
                                 * @event change
                                 * @prarm index {Number} 动画索引
                                 * @prarm times {Number} 动画重复次数
                                 */
                                the.emit('change', j, times + 1);
                                next();
                            });
                        }
                    })
                    .follow(callback);
            };

            /**
             * 动画开始时
             * @event start
             */
            the.emit('start');

            if (repeatTimes === -1) {
                (function stepInStep() {
                    onstep(stepInStep);
                })();
            } else {
                var repeatQueue = [];

                repeatQueue.length = number.parseInt(repeatTimes, 1);
                howdo
                    .each(repeatQueue, function (i, u, next) {
                        onstep(next);
                    })
                    .follow(function () {
                        /**
                         * 动画结束时
                         * @event end
                         */
                        the.emit('end');
                        callback.call(the);
                    });
            }
        }
    });


    ///**
    // * 创建一系列动画
    // * @example
    // * var an = new Animation();
    // * an.push(function(){
    // *
    // * });
    // * an.start();
    // */
    //module.exports = Animation;
});