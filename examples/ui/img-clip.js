define(function (require) {
    var Imgclip = require('/src/ui/img-clip/index.js');
    var $ret = document.getElementById('ret');
    var imgclip = new Imgclip('#img', {
        minWidth: 100,
        minHeight: 100,
        ratio: 1.5
    }).on('clipend', function (selection) {
        $ret.innerHTML = JSON.stringify(selection);
    }).on('error', function (err) {
            alert(err.message);
        });
});