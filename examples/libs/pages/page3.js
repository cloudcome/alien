define(function (require, exports, module) {
    'use strict';

    exports.enter = function (params, query) {
        console.log('enter page3');
        console.log('params ' + params);
        console.log('query ' + query);
    };

    exports.update = function (params, query) {
        console.log('update page3');
        console.log('params ' + params);
        console.log('query ' + query);
    };

    exports.leave = function (to) {
        console.log('leave page3');
        console.log('to ' + to);
    };
});