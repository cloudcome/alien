define(function (require) {
    "use strict";

    var Prettify = require('/src/ui/Prettify/');
    var pf = new Prettify('pre');

    setTimeout(function () {
        new Prettify('pre');
    }, 5000);
});