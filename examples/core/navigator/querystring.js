define(function (require) {
    'use strict';

    var qs = require('/src/core/navigator/querystring.js');
    var str;

    window.querystring = qs;

    console.log(str = qs.stringify({
        a: 1,
        b: 2,
        c: [0, 1, 2],
        d: {
            a: 1,
            b: 2,
            c: 3
        }
    }));

    console.log(qs.parse(str));

    document.getElementById('set1').onclick = function () {
        qs.set('a', '1');
    };

    document.getElementById('set2').onclick = function () {
        qs.set({
            a: 'new',
            b: 2,
            c: [1, 2, 3],
            d: 4,
            e: 5,
            f: 6
        });
    };

    document.getElementById('remove1').onclick = function () {
        qs.remove('a');
    };

    document.getElementById('remove2').onclick = function () {
        qs.remove(['b', 'c']);
    };

    document.getElementById('remove3').onclick = function () {
        qs.remove();
    };

});