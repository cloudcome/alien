define(function (require) {
    'use strict';

    var xhr = require('/src/core/communication/xhr.js');

    xhr.ajax({
        url: 'http://s.ydr.me/p/t/test.txt',
        type: 'text'
    }).on('success', function (json) {
        console.log(json);
    }).on('error', function (err) {
        console.log(err);
    }).on('complete', function () {
        console.log('complete');
    }).on('finish', function () {
        console.log('finish');
    });
});