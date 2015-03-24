define(function(require){
    'use strict';

    var Scrollspy = require('../../src/ui/Scrollspy/');
    var attribute  = require('../../src/core/dom/attribute.js');
    var spy = new Scrollspy(document);

    spy.on('enterviewport', function ($img) {
        console.log(this);
        $img.src = attribute.data($img, 'original');
        attribute.removeData($img, 'original');
    });
});