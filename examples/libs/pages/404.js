define(function (require, exports, module) {
    'use strict';

    exports.enter = function (matches) {
        console.log('enter 404');
        console.log(matches);
    };

    exports.leave = function (to) {
        console.log('leave 404');
        console.log('to ' + to);
    };
});