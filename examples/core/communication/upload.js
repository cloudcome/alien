define(function (require) {
    'use strict';

    var upload = require('/src/core/communication/upload.js');

    document.getElementById('file').onchange = function(){
        if(this.files && this.files.length){
            upload({
                url: './data.json',
                file: this
            }).done(function (json) {
                console.log(json);
            }).fail(function (err) {
                console.log(err);
            }).progress(function (eve) {
                console.log(eve.alienDetail.complete);
            });
        }
    };
});