/*!
 * 动画
 * @author ydr.me
 * @create 2015-02-04 11:36
 */


define(function (require, exports, module) {
    /**
     * @module libs/Animation
     * @requires util/class
     * @requires util/howdo
     * @requires util/typeis
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/animation
     */
    'use strict';

    var Emitter = require('./Emitter.js');
    var klass = require('../util/class.js');
    var howdo = require('../util/howdo.js');
    var typeis = require('../util/typeis.js');
    var dato = require('../util/dato.js');
    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var animation = require('../core/dom/animation.js');
    var noop = function () {
        // ignore
    };
    var Animation = klass.create({
        constructor: function () {
            var the = this;

            Emitter.call(the);

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
        }
    }, Emitter);
    var pro = Animation.prototype;
    //var arrPro = ['push', 'pop', 'unshift', 'shift', 'slice', 'splice'];
    //
    //arrPro.forEach(function (prop) {
    //    /**
    //     * 添加、删除动画
    //     * @param css
    //     * @param options
    //     */
    //    pro[prop] = function (css, options) {
    //
    //    };
    //});


    /**
     * 追加动画
     * @param $ele
     * @param to
     * @param options
     */
    pro.push = function ($ele, to, options) {
        this._queueList.push({
            $eles: selector.query($ele),
            to: to,
            options: options
        });
    };


    //pro.index = function (index) {
    //
    //};


    /**
     * 执行动画
     * @param [repeatTimes=1] {Number} 重复次数
     * @param [callback] {Function} 执行完毕回调
     */
    pro.start = function (repeatTimes, callback) {
        var the = this;
        var args = arguments;

        if (typeis.function(args[0])) {
            repeatTimes = 1;
            callback = args[0];
        }

        repeatTimes = repeatTimes || 1;
        callback = typeis.function(callback) ? callback : noop;
        var repeatQueue = [];
        repeatQueue.length = repeatTimes;

        howdo
            .each(repeatQueue, function (i, u, next) {
                howdo
                    .each(the._queueList, function (j, queue, next) {
                        var toType = typeis(queue.to);
                        var to;

                        if (toType === 'string') {
                            to = dato.extend({}, queue.options, {
                                name: queue.to
                            });
                            
                            howdo.each(queue.$eles, function (k, $ele, done) {
                                animation.keyframes($ele, to, done);
                            }).together(function () {
                                next();
                                the.emit('change', j, i + 1);
                            });
                        } else {
                            howdo.each(queue.$eles, function (k, $ele, done) {
                                animation.animate($ele, queue.to, queue.options, done);
                            }).together(function () {
                                next();
                                the.emit('change', j, i + 1);
                            });
                        }
                    })
                    .follow(next);
            })
            .follow(function () {
                the.emit('end');
                callback.call(the);
            });
    };

    //pro.pause = function () {
    //
    //};
    //
    //
    //pro.stop = function () {
    //
    //};


    /**
     * 创建一系列动画
     * @example
     * var qe = new Queue();
     * qe.push(function(){
     *
     * });
     */
    module.exports = Animation;
});