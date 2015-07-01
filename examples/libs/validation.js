define(function (require) {
    'use strict';

    var Validation = require('../../src/libs/validation.js');
    var random = require('../../src/utils/random.js');

    Validation.addRule('number', /^\d+$/, '${path}不是数字');
    Validation.addRule('numerical', function (value) {
        return /\d/.test(value);
    }, '${path}不是数值');
    Validation.addRule('timeout', function (value, done) {
        setTimeout(function () {
            //done(Date.now() % 2 ? '该${path}不能在此注册' : null);
            //done('该${path}不能在此注册');
            done(null);
        }, random.number(500, 2000));
    });

    var v = new Validation();

    var callback = function (path, ruleName) {
        console.log(this.alienEmitter.type, path, ruleName);
    };

    v.before('validate', callback);
    v.on('validate error success', callback);
    v.after('validate', callback);

    // 姓名
    v.setAlias('name', '姓名');
    v.addRule('name', 'hehe');

    // 年龄
    v.setAlias('age', '年龄');
    v.addRule('age', 'timeout');
    v.addRule('age', 'number');
    v.addRule('age', 'numerical');
    v.addRule('age', 'timeout');

    // 验证
    v.validate({
        name: 'yundanran',
        age: 12
    });
});