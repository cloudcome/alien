define(function (require) {
    'use strict';

    var url = require('/src/utils/url.js');

    var ret = url.parse('http://a.b.c.com:8283/a/b/c/?a=1&b=2&c=3#!/a/b/c/?a=1&b=2&c=3');

    console.log(ret);
    console.log(url.stringify(ret));
});