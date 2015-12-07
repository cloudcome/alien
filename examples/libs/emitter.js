define(function (require) {
    'use strict';

    var Emitter = require('../../src/libs/emitter.js');
    var emitter = new Emitter();

    var klass = require('../../src/utils/class.js');

    var Father = klass.extends(Emitter).create(function () {

    });

    var Child = klass.extends(Father).create(function () {

    });

    var child = new Child();
    var father = new Father();

    //emitter.on('hi', function (data) {
    //    alert('hi ' + (data || 'who??'));
    //    return !1;
    //});
    //
    //setTimeout(function () {
    //    console.log(emitter.emit('hi'));
    //}, 1000);
    //
    //setTimeout(function () {
    //    console.log(emitter.emit('hi', '云淡然'));
    //}, 2000);
});