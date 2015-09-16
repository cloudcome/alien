define(function (require) {
    'use strict';

    var klass = require('../../src/utils/class.js');

    // ============= People =============
    var People = klass.create({
        constructor: function () {
            this.name = 'People';
        },

        say: function () {
            alert(this.name);
        }
    });
    People.say = function () {
        alert(this.name);
    };
    People.type1 = 'People';
    People.prototype.haha = 'haha';


    // ============= Father =============
    var Father = klass.extends(People).create(function () {
        this.name = 'Father';
    });
    Father.type2 = 'Father';
    Father.prototype.hehe = 'hehe';


    // ============= Child =============
    var Child = klass.extends(Father, true).create({
        constructor: function () {
            this.name = 'Child';
        },
        heihei: 'heihei'
    });
    Child.type3 = 'Child';


    window.People = People;
    window.people = new People();
    window.Father = Father;
    window.father = new Father();
    window.Child = Child;
    window.child = new Child();
    window.klass = klass;
});