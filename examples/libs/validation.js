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
        console.log('alienEmitter =>', this.alienEmitter.type, path ? (path.message ? path.message : path) : '', ruleName ? ruleName : '');
    };

    v.before('validate', callback);
    v.after('validate', callback);
    v.on('validate invalid valid success error', callback);

    // 姓名
    v.setAlias('name', '姓名');
    v.addRule('name', /^\w{3,12}$/, '${path}不对哦');
    v.addRule('name', function (value) {
        return value.length > 3;
    }, '${path}长度不对');
    v.addRule('name', function (value, done) {
        setTimeout(function () {
            //done(Date.now() % 2 ? '该${path}不能在此注册' : null);
            //done('该${path}已经重复了，换一个试试吧');
            done(null);
        }, random.number(500, 2000));
    });

    // 年龄
    v.setAlias('age', '年龄');
    v.addRule('age', 'timeout');
    v.addRule('age', 'number');
    v.addRule('age', 'numerical');
    v.addRule('age', 'timeout');

    // 验证
    v.validateAll({
        name: 'yundanran',
        age: 12
    });

    // 验证
    //v.validateOne({
    //    name: 'yundanran'
    //});

    //console.log(v.getRules('name'));
});