define(function (require, exports, module) {
    'use strict';

    exports.enter = function (params, query) {
        console.log('enter page1');
        console.log('params ' + JSON.stringify(params));
        console.log('query ' + JSON.stringify(query));
    };

    exports.update = function (params, query) {
        console.log('update page1');
        console.log('params ' + JSON.stringify(params));
        console.log('query ' + JSON.stringify(query));
    };

    exports.leave = function (to) {
        console.log('leave page1');
        console.log('to ' + to);
    };
});