define(function (require) {
    'use strict';

    var shell = require('/src/core/navigator/shell.js');
    var ret = document.getElementById('ret');
    var arr = [];

    _push('是否为IE浏览器：', shell.isIE, '，IE版本号：', shell.ieVersion);
    _push('是否为Chrome：', shell.isChrome);
    _push('是否为360极速浏览器：', shell.is360ee);
    _push('是否为360安全浏览器：', shell.is360se);
    _push('是否为搜狗高速浏览器：', shell.isSogou);
    _push('是否为猎豹安全浏览器：', shell.isLiebao);
    _push('是否为QQ浏览器：', shell.isQQ);


    ret.innerHTML = arr.join('');

    function _push() {
        var str = '';

        for (var i = 0, j = arguments.length; i < j; i++) {
            if (typeof  arguments[i] === 'boolean') {
                str += arguments[i] ? '是' : '否';
            } else {
                str += String(arguments[i]);
            }
        }

        return arr.push('<li>' + str + '</li>');
    }
});