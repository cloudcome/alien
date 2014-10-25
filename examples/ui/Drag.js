define(function (require) {
    var Drag = require('/src/ui/Drag.js');
    var demo = document.getElementById('demo');
    var drag1 = new Drag(demo, {
        min: {
            x: 0,
            y: 0
        },
        max: {
            x: 400,
            y: 400
        },
        handle: '#handle'
    });
});