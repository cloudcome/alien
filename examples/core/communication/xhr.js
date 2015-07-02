define(function (require) {
    'use strict';

    var xhr = require('../../../src/core/communication/xhr.js');

    xhr.ajax({
        url: './data.json?a=1&b=2&_=abc',
        type: 'json',
        query: {
            c: 3,
            d: 4
        }
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