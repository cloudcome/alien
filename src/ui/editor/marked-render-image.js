/*!
 * marked render image
 * @author ydr.me
 * @create 2015-04-03 02:32:10
 */


define(function (require, exports, module) {
    'use strict';

    var typeis = require('../../utils/typeis.js');
    var REG_SIZE = /(?:\s+?=\s*?(\d+)(?:[x*×](\d+))?)?$/i;

    // ![](1.png =200x100)
    module.exports = function (src, title, text) {
        src = src || '';

        var matches = src.match(REG_SIZE);
        var width = null;
        var height = null;

        if (matches) {
            width = matches[1];
            height = matches[2];
            src = src.replace(REG_SIZE, '');
        }

        return '<img' +
            (typeis.null(title) ? '' : ' title="' + title + '"') +
            (typeis.null(text) ? '' : ' alt="' + text + '"') +
            (typeis.null(src) ? '' : ' src="' + src + '"' ) +
            (typeis.null(width) ? '' : ' width="' + width + '"') +
            (typeis.null(height) ? '' : ' height="' + height + '"' ) +
            '>';
    };
});