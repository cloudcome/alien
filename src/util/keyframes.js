/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-02-12 13:51
 */


define(function (require, exports, module) {
    /**
     * @module parent/keyframes
     */
    'use strict';

    var attribute = require('../core/dom/attribute.js');
    var modification = require('../core/dom/modification.js');
    var random = require('./random.js');
    var typeis = require('./typeis.js');
    var dato = require('./dato.js');
    var REG_NUM = /^(\d+?\.)?\d+$/;
    var VENDOR_PREFIX = ['-webkit-', '-moz-', '-ms-', ''];

    module.exports = function (name, keyframes) {
        if (!typeis.string(name)) {
            keyframes = arguments[0];
            name = 'alien-keyframes-' + random.string(9, 'aA0-_');
        }

        var mainStyle = '';

        dato.each(keyframes, function (percent, properties) {
            percent = REG_NUM.test(percent) ? percent * 100 + '%' : percent;
            mainStyle += percent + '{';

            var transformKey = '';
            var transformVal = [];

            dato.each(properties, function (key, val) {
                var fix = attribute.fixCss(key, val);

                if (fix.key.indexOf('transform') > -1) {
                    transformKey = fix.key;
                    transformVal.push(fix.val + (fix.imp ? ' !important' : ''));
                } else {
                    mainStyle += fix.key + ':' + fix.val + (fix.imp ? ' !important' : '') + ';';
                }
            });

            mainStyle += (transformVal.length ? transformKey + ':' + transformVal.join(' ') : '') + '}';
        });

        var style = '';

        dato.each(VENDOR_PREFIX, function (i, prefix) {
            style += '@' + prefix + 'keyframes ' + name + '{' + mainStyle + '}';
        });

        modification.importStyle(style);

        return name;
    };


    function _toObjString(obj) {

    }
});