define(function (require) {
    'use strict';

    var Tab = require('/src/ui/tab/index.js');
    var $index = document.getElementById('index');
    var tab = new Tab('#tab');

    tab.on('change', function(index, $tab, $content){
        $index.innerHTML = index + '==' + Date.now();
        console.log($tab);
        console.log($content);
    });

    document.getElementById('btn').onclick = function () {
        tab.change(1);
    };
});