define(function (require, exports, module) {
    'use strict';

    exports.enter = function (matches) {
        console.log('404');
        console.log(matches);
    };
});