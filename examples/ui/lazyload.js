define(function(require){
    'use strict';

    var Lazyload = require('../../src/ui/lazyload/');

    new Lazyload(document, {
        data: 'original'
    });
});