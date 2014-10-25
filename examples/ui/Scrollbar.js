define(function (require) {
    var Scrollbar = require('/src/ui/Scrollbar.js');
    var demo = document.getElementById('demo');
    var sl1 = new Scrollbar(demo);

    document.getElementById('scrollTop').onclick = function(){
        sl1.scrollTop();
    };

    document.getElementById('scrollBottom').onclick = function(){
        sl1.scrollBottom();
    };

    document.getElementById('scrollLeft').onclick = function(){
        sl1.scrollLeft();
    };

    document.getElementById('scrollRight').onclick = function(){
        sl1.scrollRight();
    };
});