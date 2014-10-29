define(function (require) {
    var Resize = require('/src/ui/Resize/index.js');

    var resize = new Resize('#resize',{
        minWidth: 100,
        minHeight: 100,
        maxWidth: 500,
        maxHeight: 500,
        ratio: 1
    });

    resize.on('resize', function (size) {
        console.log(size);
    });

    window.resize = resize;
});