define(function (require, exports, module) {
    'use strict';

    exports.enter = function (spa, params, query) {
        //console.log('enter page2');
        //console.log('params ' + JSON.stringify(params));
        //console.log('query ' + JSON.stringify(query));

        spa.$view.innerHTML = 'enter page2 ' + Date.now();
    };

    exports.update = function (spa, params, query) {
        //console.log('update page2');
        //console.log('params ' + JSON.stringify(params));
        //console.log('query ' + JSON.stringify(query));

        if (query.a % 2) {
            return spa.redirect('/page2?b=hehe', false);
        }

        spa.$view.innerHTML = 'update page2 ' + Date.now();
    };

    exports.leave = function (spa, to) {
        console.log('leave page2');
        console.log('to ' + to);
    };
});