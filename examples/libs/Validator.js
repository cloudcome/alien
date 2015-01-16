define(function (require) {
    'use strict';

    var Validator = require('/src/libs/Validator.js');
    var selector = require('/src/core/dom/selector.js');
    var modification = require('/src/core/dom/modification.js');
    var v1 = new Validator();

    Validator.registerRule({
        name: 'suffix',
        type: 'array'
    }, function (suffix, val, next) {
        var sf = (val.match(/\.[^.]*$/) || [''])[0];
        var boolean = suffix.indexOf(sf) > -1;
        next(boolean ? null : new Error(this.alias + '的文件后缀不正确'), val);
    });

    v1.pushRule({
        name: 'username',
        type: 'string',
        alias: '用户名',
        required: true,
        minLength: 4,
        maxLength: 12,
        suffix: ['.abc'],
        regexp: /^[a-z]\w{3,11}$/
    });


    var data = {
        username: 'cc11c'
    };

    v1.validateAll(data, function (errs) {
        console.log(errs);
    });
});