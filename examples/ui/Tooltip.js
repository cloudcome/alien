define(function (require) {
    'use strict';

    var Tooltip = require('../../src/ui/Tooltip/index.js');

    new Tooltip('.tooltip', {
        timeout: 1000,
        data: 'tooltip'
    });
});