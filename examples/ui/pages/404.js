define(function (require, exports, module) {
    'use strict';

    exports.enter = function (spa, params, query) {
        //console.log('enter 404');
        //console.log('params ' + JSON.stringify(params));
        //console.log('query ' + JSON.stringify(query));

        spa.$view.innerHTML = 'enter 404 ' + Date.now();
    };

    exports.update = function (spa, params, query) {
        //console.log('update 404');
        //console.log('params ' + JSON.stringify(params));
        //console.log('query ' + JSON.stringify(query));

        spa.$view.innerHTML = 'update 404 ' + Date.now();
    };
    //
    //exports.leave = function (spa, to) {
    //    console.log('leave 404');
    //    console.log('to ' + to);
    //};
});