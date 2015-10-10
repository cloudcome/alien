define(function (require, exports, module) {
    'use strict';

    exports.enter = function (spa, matches) {
        console.log('enter page3');
        console.log(matches);
    };

    exports.leave = function (spa, to) {
        console.log('leave page3');
        console.log('to ' + to);
    };
});