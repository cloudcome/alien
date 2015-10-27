define(function (require, exports, module) {
    var klass = require('../../src/utils/class.js');
    var Father = require('./class-father.js');

    module.exports = klass.extends(Father, true).create({
        constructor: function () {
            debugger;
            this.age += 9;
        },
        say: function () {
            console.log('cccccccc', this.name, this.age, 'cccccccccc')
        }
    });
});