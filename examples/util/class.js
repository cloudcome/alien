define(function (require) {
    'use strict';

    var klass = require('/src/util/class.js');

    var Father = klass.create({
        constructor: function (name) {
            this.name = name;
        },
        say: function () {
            console.log('hi, i am ' + this.name);
        },
        STATIC: {
            a: 1,
            b: 2
        }
    });

    var Child = klass.create({
        constructor: function (name, age) {
            Father.apply(this, arguments);
            this.age = age;
        },
        speak: function () {
            console.log(this.name + ' is ' + this.age);
        },
        STATIC:{
            c: 3,
            d: 4
        }
    }, Father, true);

    var f1 = new Father('Fimme');
    var c1 = new Child('Cmoo', 20);

    debugger;
});