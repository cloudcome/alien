define(function (require) {
    'use strict';

    var Child = require('./class-child.js');


    window.Child = Child;
    window.child = new Child('cccccccc', 333333);
});