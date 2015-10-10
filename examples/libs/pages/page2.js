define(function (require, exports, module) {
    'use strict';

    exports.enter = function (matches) {
        console.log('page2');
        console.log(matches);
    };
});