define(function (require) {
    'use strict';

    var allocation = require('../../src/utils/allocation.js');
    var hehe = function () {
        return allocation.getset({
            get: function (key) {
                return 'get ' + key;
            },
            set: function (key, val) {
                console.log('set ' + key + ' = ' + val);
            }
        }, arguments, 2);
    };

    debugger;
});