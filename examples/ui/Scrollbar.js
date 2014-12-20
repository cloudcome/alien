define(function (require) {
    'use strict';

    var Scrollbar = require('/src/ui/Scrollbar/index.js');
    var demo = document.getElementById('demo');
    var scrollbar1 = new Scrollbar('#demo');
    //var scrollbar2 = new Scrollbar('#textarea');
    //var scrollbar3 = new Scrollbar('#table');
    //
    document.getElementById('scrollTop').onclick = function(){
        scrollbar1.scrollTop();
    };

    document.getElementById('scrollBottom').onclick = function(){
        scrollbar1.scrollBottom();
    };

    document.getElementById('scrollLeft').onclick = function(){
        scrollbar1.scrollLeft();
    };

    document.getElementById('scrollRight').onclick = function(){
        scrollbar1.scrollRight();
    };
});