define(function (require) {
    'use strict';

    var Imgpreview = require('/src/ui/Imgpreview/index.js');
    var $file = document.getElementById('file');
    var imgpreview = new Imgpreview('#file');
    var $preview = document.getElementById('preview');

    imgpreview.on('change', function (list) {
        var imgs = [];

        list.forEach(function (item) {
            imgs.push('<img src="' + item.src + '">');
        });

        $preview.innerHTML = imgs.join('');
    });
});