define(function(require){
    'use strict';

    var Scrollspy = require('../../src/ui/Scrollspy/');
    var attribute  = require('../../src/core/dom/attribute.js');
    var spy = new Scrollspy(document);

    spy.on('enterviewport', function ($img) {
        if($img._done){
            return;
        }

        $img.src = attribute.data($img, 'original');
        $img._done = true;
        attribute.removeData($img, 'original');
    });
});