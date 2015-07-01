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
                var err = random.number(1, 10) > 8 ? new Error(name + ' do error') : null;

                args.unshift(err);
                console.log(err ? '×' : '√', 'task', name);
                callback.apply(window, args);
            }, random.number(100, 900));
        };
    };


    //howdo
    //    .task(task('1', 1))
    //    .task(task('2', 2))
    //    .task(task('3', 3))
    //    .follow()
    //    .try(function () {
    //        console.log('try', [].slice.call(arguments));
    //    })
    //    .catch(function () {
    //        console.log('catch', arguments);
    //    });

    //howdo
    //    .task(task('1', 1))
    //    .task(task('2', 2))
    //    .task(task('3', 3))
    //    .together()
    //    .try(function () {
    //        console.log('try', [].slice.call(arguments));
    //    })
    //    .catch(function (err) {
    //        console.log('catch', err);
    //    });

    //howdo
    //    .task(task(0, 0))
    //    .each([1, 2, 3], function (index, value, next) {
    //        task(value, value)(next);
    //    })
    //    .task(task(4, 4))
    //    .follow()
    //    .try(function () {
    //        console.log('try', [].slice.call(arguments));
    //    })
    //    .catch(function () {
    //        console.log('catch', arguments);
    //    });

    howdo
        .task(task(0, 0))
        .each([1, 2, 3], function (index, value, done) {
            task(value, value)(done);
        })
        .task(task(4, 4))
        .together()
        .try(function () {
            console.log('try', [].slice.call(arguments));
        })
        .catch(function () {
            console.log('catch', arguments);
        });
});