define(function (require, exports, module) {
    'use strict';

    exports.enter = function (spa, params, query) {
        //console.log('enter page3');
        //console.log('params ' + JSON.stringify(params));
        //console.log('query ' + JSON.stringify(query));

        spa.$view.innerHTML = 'enter page3 ' + Date.now();
    };

    exports.update = function (spa, params, query) {
        //console.log('update page3');
        //console.log('params ' + JSON.stringify(params));
        //console.log('query ' + JSON.stringify(query));

        if (query.b % 2) {
            return spa.redirect('/page1?b=hehe');
        }

        spa.$view.innerHTML = 'update page3 ' + Date.now();
    };

    exports.leave = function (spa, to) {
        //console.log('leave page3');
        //console.log('to ' + to);
    };
});