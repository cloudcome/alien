/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-01 19:10
 */


define(function (require, exports, module) {
    /**
     * @module parent/howdo
     */

    'use strict';

    var howdo = require('../../src/utils/howdo.js');
    var random = require('../../src/utils/random.js');
    var task = function (name) {
        var args = [].slice.call(arguments, 1);
        return function (callback) {
            setTimeout(function () {
                var err = Date.now() % 2 === 1 ? new Error(name + ' do error') : null;

                args.unshift(err);
                console.log('task', name, err);
                callback.apply(window, args);
            }, random.number(100, 500));
        };
    };


    howdo
        .task(task('1'))
        .task(task('2'))
        .task(task('3'))
        .follow()
        .try(function () {
            console.log('do success');
        })
        .catch(function () {
            console.log('do error');
        });
});