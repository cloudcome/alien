define(function (require) {
    'use strict';

    var jsonp = require('../../../src/core/communication/jsonp.js');

    jsonp({
        type: 'function',
        url: 'http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?',
        query: {
            tags: "mount rainier",
            tagmode: "any",
            format: "json"
        }
    }).on('success', function (data) {
        console.log(data);
    }).on('error', function (err) {
        console.log(err);
    });
});