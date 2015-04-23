define(function (require) {
    'use strict';

    var DDB = require('/src/libs/DDB.js');
    var random = require('/src/utils/random.js');
    var data = {
        a: 'demo',
        b: 400,
        c: 300,
        d: {
            e: {
                f: {
                    g: 200
                }
            }
        },
        users: [{
            id: 1,
            nickname: 'abc',
            tags: ['唱歌', '游泳'],
            love: {
                children: [{
                    nickname: 'abc-1',
                    tags: ['唱歌', '跳舞']
                }, {
                    nickname: 'abc-2',
                    tags: ['相声', '小品']
                }]
            }
        }, {
            id: 2,
            nickname: 'def',
            tags: [],
            love: {
                children: [{
                    nickname: 'def-1',
                    tags: ['编程', '科技']
                }]
            }
        }]
    };
    var ddb = new DDB('#demo', data, {
        debug: true
    });

    setInterval(function () {
        ddb.data.a = random.string(6, 'aA0');
        //ddb.data.b = random.number(400, 800);
        //ddb.data.c = random.number(300, 600);
        //ddb.data.d = random.number(1, 100) > 50;
        //ddb.data.users.push({
        //    id: random.number(1, 400),
        //    nickname: random.string(6, 'aA0')
        //});
    }, 2000);
});