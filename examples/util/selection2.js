define(function (require) {
    'use strict';

    var selection = require('/src/util/selection.js');
    var $textarea = document.getElementById('textarea');
    var $start = document.getElementById('start');
    var $end = document.getElementById('end');
    var $setPos = document.getElementById('set-pos');

    $setPos.onclick = function () {
        selection.setPos($textarea, $start.value, $end.value);
    };

    window.seletion = selection;
});