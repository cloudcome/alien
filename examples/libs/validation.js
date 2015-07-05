define(function (require) {
    'use strict';

    var Validation = require('../../src/libs/validation.js');
    var rules = require('../../src/libs/validation-rules.js');
    var random = require('../../src/utils/random.js');

    rules(Validation);

    var v = new Validation();

    var callback = function (path, ruleName) {
        console.log('alienEmitter =>', this.alienEmitter.type, path ? (path.message ? path.message : path) : '', ruleName ? ruleName : '');
    };

    v.before('validate', callback);
    v.after('validate', callback);
    v.on('validate invalid valid success error', callback);

    // 姓名
    v.setAlias('name', '姓名');
    v.addRule('name', function (val, done) {
        done(/^\w{3,12}$/.test(val) ? null : '${path}不对哦');
    });
    v.addRule('name', function (val, done) {
        setTimeout(function () {
            //done(Date.now() % 2 ? '该${path}不能在此注册' : null);
            //done('该${path}已经重复了，换一个试试吧');
            done(null);
        }, random.number(500, 2000));
    });

    // 年龄
    v.setAlias('age', '年龄');
    //v.addRule('age', 'timeout');
    v.addRule('age', 'number');
    v.addRule('age', function (val, done) {
        setTimeout(function () {
            //done(Date.now() % 2 ? '该${path}不能在此注册' : null);
            //done('该${path}已经重复了，换一个试试吧');
            done(null);
        }, random.number(500, 2000));
    });

    // 验证
    v.validateAll({
        name: 'yundanran',
        age: 12
    });

    ////验证
    //v.validateOne({
    //    name: 'yundanran'
    //});

    //console.log(v.getRules());
});