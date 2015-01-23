define(function (require) {
    'use strict';

    var hashbang = require('/src/util/hashbang.js');

    hashbang.on('path', function (eve, neo, old) {
        console.log('====== path ======');
        console.log(neo);
        console.log(old);
    });

    hashbang.on('query', function (eve, neo, old) {
        console.log('====== query ======');
        console.log(neo);
        console.log(old);
    });

    window.hashbang = hashbang;
});