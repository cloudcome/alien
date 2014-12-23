define(function (require) {
    var Imgclip = require('/src/ui/Imgclip/index.js');
    var $ret = document.getElementById('ret');
    var imgclip = new Imgclip('#img', {
        minWidth: 1000,
        minHeight: 1000,
        ratio: 1.5
    }).on('clipend', function (selection) {
        $ret.innerHTML = JSON.stringify(selection);
    }).on('error', function (err) {
            alert(err.message);
        });
});