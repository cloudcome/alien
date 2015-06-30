define(function (require) {
    var Resize = require('../../src/ui/resize/index.js');
    var $inner = document.getElementById('inner');

    var resize = new Resize('#resize',{
        minWidth: 100,
        minHeight: 100,
        maxWidth: 500,
        maxHeight: 500,
        ratio: 0
    });

    resize.on('resize', function (size) {
        $inner.innerHTML = 'width: ' + size.width + '; height: ' + size.height;
    });
});