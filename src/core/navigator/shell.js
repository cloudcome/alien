/*!
 * shell.js
 * @author ydr.me
 * @create 2014-09-30 17:22
 */


define(function (require, exports, module) {
    /**
     * @module core/navigator/shell
     */
    'use strict';

    var ieAX = window.ActiveXObject;
    var ieMode = document.documentMode;
    var ieVer = _getIeVersion() || ieMode || 0;
    var isIe = ieAX || ieMode;
    var chromiumType = _getChromiumType();

    module.exports = {
        /**
         * 判断是否为 IE 浏览器
         *
         * @example
         * shell.isIE;
         * // true or false
         */
        isIE: (function () {
            return !!ieVer;
        })(),
        /**
         * IE 版本
         *
         * @example
         * shell.ieVersion;
         * // 6/7/8/9/10/11/12...
         */
        ieVersion: (function () {
            return ieVer;
        })(),
        /**
         * 是否为谷歌 chrome 浏览器
         *
         * @example
         * shell.isChrome;
         * // true or false
         */
        isChrome: (function () {
            return chromiumType === 'chrome';
        })(),
        /**
         * 是否为360浏览器
         *
         * @example
         * shell.is360;
         * // true or false
         */
        if (_aliMimeType() || _UA()) {
            // 360浏览器
            return '360';
        }
        /**
         * 是否为猎豹安全浏览器
         *
         * @example
         * shell.isLiebao;
         * // true or false
         */
        isLiebao: (function () {
            return chromiumType === 'liebao';
        })(),
        /**
         * 是否搜狗高速浏览器
         *
         * @example
         * shell.isSogou;
         * // true or false
         */
        isSogou: (function () {
            return chromiumType === 'sogou';
        })(),
        /**
         * 是否为 QQ 浏览器
         *
         * @example
         * shell.isQQ;
         * // true or false
         */
        isQQ: (function () {
            return chromiumType === 'qq';
        })()
    };


//    /**
//     * 测试 MIME
//     * @param where
//     * @param value
//     * @param [name]
//     * @param [nameReg]
//     * @returns {boolean}
//     * @private
//     */
//    function _mime(where, value, name, nameReg) {
//        var mimeTypes = navigator.mimeTypes;
//        var i;
//
//        for (i in mimeTypes) {
//            if (mimeTypes[i][where] == value) {
//                if (name !== undefined && nameReg.test(mimeTypes[i][name])) {
//                    return true;
//                }
//                else if (name === undefined) {
//                    return true;
//                }
//            }
//        }
//
//        return false;
//    }


    /**
     * 检测 external 是否包含该字段
     * @param reg 正则
     * @param type 检测类型，0为键，1为值
     * @returns {boolean}
     * @private
     */
    function _testExternal(reg, type) {
        var external = window.external || {};

        for (var i in external) {
            if (reg.test(type ? external[i] : i)) {
                return true;
            }
        }

        return false;
    }

    function _aliMimeType() {
        var _desc = '', _type = '';
        var _aliServiceCount = 0;
        var _AliSSOLogin = false;
        for (var i = 0; i < window.clientInformation.mimeTypes.length; i++ ) {
            _desc = window.clientInformation.mimeTypes[i].description;
            _type = window.clientInformation.mimeTypes[i].type;
            if (_desc.indexOf('AliSSOLogin') >= 0) {
                _AliSSOLogin = true;
            }

            if (_desc.indexOf('ali')>=0 || _desc.indexOf('Ali')>=0) {
                _aliServiceCount++;
            }
        }

        if (_AliSSOLogin && _aliServiceCount >= 2 ) {
            return true;
        } else {
            return false;
        }
    }

    function _UA() {
        if (navigator.userAgent.indexOf('360Browser') > -1 ) {
            return true;
        } else if (navigator.userAgent.indexOf('360EE') > -1 ) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 获取 Chromium 内核浏览器类型
     * @link http://www.adtchrome.com/js/help.js
     * @link https://ext.chrome.360.cn/webstore
     * @link https://ext.se.360.cn
     * @return {String}
     *         360 360浏览器
     *         sougou 搜狗浏览器
     *         liebao 猎豹浏览器
     *         chrome 谷歌浏览器
     *         ''    无法判断
     * @version 1.0
     * 2014年3月12日20:39:55
     */

    function _getChromiumType() {
        if (isIe || typeof window.scrollMaxX !== 'undefined') {
            return '';
        }

        var _track = 'track' in document.createElement('track');
        var webstoreKeysLength = window.chrome && window.chrome.webstore ? Object.keys(window.chrome.webstore).length : 0;

        // 搜狗浏览器
        if (_testExternal(/^sogou/i, 0)) {
            return 'sogou';
        }

        // 猎豹浏览器
        if (_testExternal(/^liebao/i, 0)) {
            return 'liebao';
        }

        // chrome
        if (window.clientInformation && window.clientInformation.languages && window.clientInformation.languages.length > 2) {
            return 'chrome';
        }


        if (_track) {
            // 360极速浏览器
            // 360安全浏览器
            return webstoreKeysLength > 1 ? '360ee' : '360se';
        }

        return '';
    }


    // 获得ie浏览器版本

    function _getIeVersion() {
        var v = 3,
            p = document.createElement('p'),
            all = p.getElementsByTagName('i');

        while (
            p.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
                all[0]);

        return v > 4 ? v : 0;
    }

});
