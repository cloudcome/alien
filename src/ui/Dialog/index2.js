/*!
 * 对话框
 * @author ydr.me
 * @create 2015-01-11 16:53
 */


define(function (require, exports, module) {
    /**
     * @module ui/Dialog/
     */
    'use strict';

    var Mask = require('../Mask/');
    var Window = require('../Window/');
    var dato = require('../util/dato.js');
    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var modification = require('../core/dom/modification.js');
    var animation = require('../core/dom/animation.js');
    var ui = require('../base.js');
    var defaults = {};
    var alienIndex = 0;
    var alienClass = 'alien-ui-dialog';
    var Dialog = ui.create({
        constructor: function ($content, options) {
            var the = this;

            the._$content = selector.query($content)[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },


        _init: function () {
            var the = this;

            the._$bg = new Mask(window, {
                addClass: alienClass + '-bg'
            });

            the._$dialog = new Window();

            return the;
        }
    });

    module.exports = Dialog;
});