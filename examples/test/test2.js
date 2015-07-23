'use strict';


/**
 * 解码 html 实体符
 * @param str {String} html 实体符
 * @returns {String}
 */
var unescapeHTML = (function (str) {
    var p = document.createElement('p');

    p.style.display = 'none';
    document.body.appendChild(p);

    return function (str) {
        // 处理掉 < 符号，防止 html 标签（如：<a>）被过滤
        p.innerHTML = str.replace(/</g, '&lt;');

        return p.textContent || p.innerText || '';
    };
}());

