define(function (require, exports, module) {
    'use strict';

    exports.enter = function (matches) {
        console.log('page1');
        console.log(matches);
    };
});