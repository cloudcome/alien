define(function (require) {
    'use strict';

    var klass = require('/src/utils/class.js');

    var Father = klass.create(function (name) {
        this.name = name;
    });

    var pro = Father.prototype;

    pro.sayName = function () {
        console.log(this.name);
    };

    var Child = klass.create(function(name, age){
        this.age = age;
    }, Father);

    Child.prototype.speak = function () {
        console.log('My name is ' + this.name + ', I\'m ' + this.age + ' years old.');
    };

    var f1 = new Father('Fimme');
    var c1 = new Child('Cmoo', 20);

    Father.extend({
        sayName2: function () {
            console.log(this);
        }
    });

    f1.extend({
        sayName3: function () {
            console.log(this.name);
        }
    });

    window.klass = klass;
});