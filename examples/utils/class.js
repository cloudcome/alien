define(function (require) {
    'use strict';

    var klass = require('/src/utils/class.js');

    var Father = klass.create2(function (name) {
        this.name = name;
    });

    Father.extend({
        sayName2: function () {
            console.log(this.name);
        }
    });

    var pro = Father.prototype;

    pro.sayName = function () {
        console.log(this.name);
    };

    var Child = klass.create2(function(name, age){
        this.age = age;
    }, Father);

    Child.fn.speak = function(){
        console.log('My name is ' + this.name + ', I\'m ' + this.age + ' years old.');
    };

    var f1 = new Father('Fimme');
    var c1 = new Child('Cmoo', 20);

    debugger;
});