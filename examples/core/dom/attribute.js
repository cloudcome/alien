define(function (require) {
    'use strict';

    var script = document.getElementById('script');
    var div1 = document.getElementById('div1');
    var div2 = document.getElementById('div2');
    var attribute = require('../../../src/core/dom/attribute.js');

    window.attribute = attribute;
});