define(function (require, exports, module) {
    'use strict';

    exports.enter = function (params, query) {
        console.log('enter 404');
        console.log('params ' + params);
        console.log('query ' + query);
    };

    exports.update = function (params, query) {
        console.log('update 404');
        console.log('params ' + params);
        console.log('query ' + query);
    };

    exports.leave = function (to) {
        console.log('leave 404');
        console.log('to ' + to);
    };
});