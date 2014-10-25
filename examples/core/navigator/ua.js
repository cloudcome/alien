define(function (require) {
    'use strict';

    var ua = require('/src/core/navigator/ua.js');
    var ret = document.getElementById('ret');

    ret.innerHTML = JSON.stringify(ua.parse());
    console.log(ua.parse());
});