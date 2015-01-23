define(function (require) {
    'use strict';

    var Tab = require('/src/ui/Tab/index.js');
    var $index = document.getElementById('index');
    var tab = new Tab('#tab');

    tab.on('change', function(index, $tab, $content){
        $index.innerHTML = index;
        console.log($tab);
        console.log($content);
    });
});