'use strict';


/**
 * 解码 html 实体符 map
 * @type {Object}
 */
var unescapeHTMLMap = {
    '&': /&amp;/g,
    '<': /&lt;/g,
    '>': /&gt;/g,
    '"': /&quot;/g,
    '\'': /&apos;/g,
    '/': /&#x2f;/g
};
/**
 * 解码 html 实体符
 * @param str {String} html 实体符
 * @returns {String}
 */
var unescapeHTML = function (str) {
    str = str.replace(/&#(x)?([\w\d]{0,5});/ig, function (full, hex, code) {
        return String.fromCharCode(parseInt(code, hex ? 16 : 10));
    });

    for (var src in unescapeHTMLMap) {
        str = str.replace(unescapeHTMLMap[src], src);
    }

    return str;
};

