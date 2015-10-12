define(function (require, exports, module) {
    'use strict';

    exports.enter = function (spa, params, query) {
        console.log('enter page3');
        console.log('params ' + JSON.stringify(params));
        console.log('query ' + JSON.stringify(query));
    };

    exports.update = function (spa, params, query) {
        console.log('update page3');
        console.log('params ' + JSON.stringify(params));
        console.log('query ' + JSON.stringify(query));
    };

    exports.leave = function (spa, to) {
        console.log('leave page3');
        console.log('to ' + to);
    };
});