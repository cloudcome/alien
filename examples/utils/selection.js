define(function (require) {
    'use strict';

    var selection = require('../../src/utils/selection.js');
    var $textarea = document.getElementById('textarea');
    var $iframe = document.getElementById('iframe');
    var $start = document.getElementById('start');
    var $end = document.getElementById('end');
    var $setPos = document.getElementById('set-pos');
    var $getOffset = document.getElementById('get-offset');
    var iframeDoc = $iframe.contentDocument;

    iframeDoc.write('<!doctype html>' +
    '<meta charset="UTF-8">' +
    '<style>#div{width:80%;min-height:100px;border:4px solid #d6e9c6;padding:4px;outline:0;}</style>' +
    '<div contenteditable="true" id="div"><strong>陈校长</strong>回忆，小学从当年借用彭家祠堂几间破旧平房办学，到<em>李克强</em>同志选址重新建校，再到如今拥有漂亮的教学楼，整洁的校园，先后培养了<b>6175</b>名学生。在希望工程的资助下，金寨县走出了“大眼睛”苏明娟，全国希望工程第一位博士生张宗友，第一位考入科大少年班的邓磊，受到江泽民、胡锦涛等党和国家领导人接见的南兰、占洋、郭玉立三位同学等等。</div>');
    iframeDoc.close();

    $setPos.onclick = function () {
        selection.setPos($textarea, [$start.value, $end.value]);
    };

    $getOffset.onclick = function () {
        var ofs = selection.getOffset($textarea);

        window.alert(ofs);
    };

    window.selection = selection;
});