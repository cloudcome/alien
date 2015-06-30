define(function (require) {
    'use strict';

    var Emitter = require('../../src/libs/emitter.js');
    var emitter = new Emitter();

    emitter.on('hi', function (data) {
        alert('hi ' + (data || 'who??'));
        return !1;
    });

    setTimeout(function () {
        console.log(emitter.emit('hi'));
    }, 1000);

    setTimeout(function () {
        console.log(emitter.emit('hi', '云淡然'));
    }, 2000);
});