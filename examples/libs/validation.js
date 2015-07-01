define(function (require) {
    'use strict';

    var Validation = require('../../src/libs/validation.js');

    Validation.addRule('number', /^\d+$/);
    Validation.addRule('numerical', function (value) {
        return /\d/.test(value);
    });
    Validation.addRule('timeout', function (value, done) {
        setTimeout(function () {
            done(Date.now() % 2);
        });
    });

    var v = new Validation();

    v.before('validate', function (path, rule) {
        console.log(this.alienEmitter.type, path, rule);
    });

    v.on('validate', function (path, rule) {
        console.log(this.alienEmitter.type, path, rule);
    });

    v.after('validate', function (path, rule) {
        console.log(this.alienEmitter.type, path, rule);
    });

    v.addRule('age', 'number');
    v.addRule('age', 'numerical');
    v.addRule('age', 'timeout');
    v.validate({
        age: 12
    });
});