define(function (require) {
    'use strict';

    var Deferred = require('/src/libs/Deferred.js');

    var d1 = new Deferred();
    d1.done(function () {
        console.log('d1 done');
    }).fail(function () {
        console.log('d1 fail');
    });

    var d2 = new Deferred();
    d2.done(function () {
        console.log('d2 done 1');
    }).done(function () {
        console.log(this.a);
        console.log(d2.status);
    }).fail(function () {
        console.log('d2 fail');
    }).progress(function (val) {
        console.log(val);
    });

    setTimeout(function(){
        d1.reject(new Error('d1'), {
            a: 1
        });
    }, 1000);

    var i = 1;
    var t2 = setInterval(function () {
        d2.notify(++i);
    }, 600);

    setTimeout(function(){
        clearInterval(t2);
        d2.resolve('d2', {
            a: 1
        });
    }, 10000);
});