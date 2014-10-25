define(function (require) {
    'use strict';

    var hashbang = require('/src/core/navigator/hashbang.js');
    var data = require('/src/util/data.js');
    var ret = document.getElementById('ret');
    var routes = [
        '/index/',
        '/user/:userId/'
    ]

    document.getElementById('btn1').onclick = function () {
        hashbang.set('path', 0, ['index']);
    }

    document.getElementById('btn2').onclick = function () {
        hashbang.set('path', 0, ['user', Date.now()]);
    }

    document.getElementById('btn3').onclick = function () {
        hashbang.set('path', 0, ['admin', Date.now(), 'page', Date.now()]);
    }

    window.hashbang = hashbang;

    hashbang.on('path', 0, function (eve, newObject, oldObject) {
        console.log('path: 0');
        console.log(newObject);
        console.log(oldObject);
    });

    hashbang.on('query', ['b', 'c'], function (eve, newObject, oldObject) {
        console.log('query: [b c]');
        console.log(newObject);
        console.log(oldObject);
    });

    hashbang.on('path', function (eve, newObject, oldObject) {
        var matched;

        data.each(routes, function (index, route) {
            matched = hashbang.matches(eve.newURL, route);
            if(matched){
                return !1;
            }
        });

        ret.innerHTML = JSON.stringify(matched);
    });
});