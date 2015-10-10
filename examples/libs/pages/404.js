define(function (require, exports, module) {
    'use strict';

    exports.enter = function (spa, matches) {
        console.log('enter 404');
        console.log(matches);
    };

    exports.leave = function (spa, to) {
        console.log('leave 404');
        console.log('to ' + to);
    };
});