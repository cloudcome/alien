/*!
 * Lex
 * @author ydr.me
 * @create 2014-11-21 14:25
 */


define(function (require) {
    'use strict';

    var $text = document.getElementById('text');
    var $container = document.getElementById('container');
    var $btn = document.getElementById('btn');
    var Lex = require('/src/libs/Lex.js');

    $btn.onclick = function () {
        var text = $text.value;

        $container.innerHTML = text;

        var lex = new Lex($container);

        console.log(lex);
    };
});