define(function (require, exports, module) {
    var klass = require('../../src/utils/class.js');
    var People = require('./class-people.js');

    module.exports =klass.extends(People).create({
        constructor: function (name, age) {
            debugger;
            this.name = name;
            this.age = age;
        },
        say: function () {
            console.log('fffffffffff', this.name, this.age, 'ffffffffffff')
        }
    });
});