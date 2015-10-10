define(function (require, exports, module) {
    'use strict';

    exports.enter = function (matches) {
        console.log('enter page1');
        console.log(matches);
    };

    exports.leave = function (to) {
        console.log('leave page1');
        console.log('to ' + to);
    };
});