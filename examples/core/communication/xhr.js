define(function (require) {
    'use strict';

    var xhr = require('/src/core/communication/xhr.js');

    xhr.ajax({
        url: './data.json',
        type: 'text'
    }).done(function (json) {
        console.log(json);
    }).fail(function (err) {
        console.log(err);
    }).progress(function (eve) {
        console.log(eve.alienDetail.percent);
    });
});