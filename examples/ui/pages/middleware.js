/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-10-13 10:13
 */


define(function (require, exports, module) {
    'use strict';

    exports.enter = function (spa, params, query) {
        console.log('middleware enter');
    };

    exports.update = function (spa, params, query) {
        console.log('middleware update');
    };

    exports.leave = function (spa, params, query) {
        console.log('middleware leave');
    };
});