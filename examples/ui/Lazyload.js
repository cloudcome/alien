define(function(require){
    'use strict';

    var Lazyload = require('../../src/ui/Lazyload/');

    new Lazyload(document, {
        data: 'original'
    });
});