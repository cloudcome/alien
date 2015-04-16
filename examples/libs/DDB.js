define(function (require) {
    'use strict';

    var DDB = require('/src/libs/DDB.js');
    var random = require('/src/utils/random.js');
    var data = {
        a: 'demo',
        b: 100,
        c: 100,
        d: false,
        users: [{
            id: 1,
            nickname: 'abc'
        }, {
            id: 2,
            nickname: 'def'
        }]
    };
    var ddb = new DDB('#demo', data);

    setInterval(function () {
        ddb.data.a = random.string(6, 'aA0');
        ddb.data.b = random.number(80, 400);
        ddb.data.c = random.number(80, 400);
        ddb.data.d = random.number(1, 100) > 50;
        ddb.data.users.push({
            id: random.number(1, 400),
            nickname: random.string(6, 'aA0')
        });
    }, 2000);
});