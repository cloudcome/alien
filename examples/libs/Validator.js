define(function (require) {
    'use strict';

    var Validator = require('/src/libs/Validator.js');
    var selector = require('/src/core/dom/selector.js');
    var modification = require('/src/core/dom/modification.js');
    var v1 = new Validator();

    v1.pushRule({
        name: 'username',
        type: 'string',
        alias: '用户名',
        required: true,
        minLength: 4,
        maxLength: 12,
        regexp: /^[a-z]\w{3,11}$/
    });



    var data = {
        username: 'ccc'
    };

    v1.validateAll(data, function (errs) {
        console.log(errs);
    });
});