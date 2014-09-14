/*!
 * core-dom-modify.js
 * @author ydr.me
 * 2014-09-14 17:24
 */


define(function (require, exports, module) {
    'use strict';

    module.exports = {
        /**
         * 创建DOM元素
         * @param {String} html
         * @returns {NodeList}
         */
        create: function (html) {
            var fg = document.createDocumentFragment();
            fg.innerHTML = html;
            return fg.childNodes;
        }
    };
});