define(function (require) {
    'use strict';

    var klass = require('../../src/utils/class.js');

    // ============= Father =============
    var Father = klass.create(function () {
        this.name = 'Father';
    });
    Father.type1 = 'Father';
    Father.prototype.hehe = 'hehe';


    // ============= Child =============
    var Child = klass.extends(Father, true).create({
        constructor: function () {
            this.name = 'Child';
        },
        heihei: 'heihei'
    });
    Child.type2 = 'Child';

    window.Father = Father;
    window.father = new Father();
    window.Child = Child;
    window.child = new Child();
    window.klass = klass;
});