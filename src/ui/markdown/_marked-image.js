/**
 * marked render image
 * @author ydr.me
 * @create 2015-04-03 02:32:10
 */


define(function (require, exports, module) {
    'use strict';

    var typeis = require('../../utils/typeis.js');
    var dato = require('../../utils/dato.js');

    var REG_SIZE = /(?:\s+?=\s*?(\d+)(?:[x*×](\d+))?)?$/i;
    var defaults = {
        className: ''
    };

    // ![](1.png =200x100)
    module.exports = function (options) {
        options = dato.extend({}, defaults, options);

        return function (src, title, text) {
            src = src || '';

            var matches = src.match(REG_SIZE);
            var width = null;
            var height = null;

            if (matches) {
                width = matches[1];
                height = matches[2];
                src = src.replace(REG_SIZE, '');
            }

            return ''.concat(
                '<img class="' + options.className + '"',
                typeis.empty(title) ? '' : ' title="' + title + '"',
                typeis.empty(text) ? '' : ' alt="' + text + '"',
                typeis.empty(src) ? '' : ' src="' + src + '"',
                typeis.empty(width) ? '' : ' width="' + width + '"',
                typeis.empty(height) ? '' : ' height="' + height + '"',
                '>'
            );
        };
    };
});