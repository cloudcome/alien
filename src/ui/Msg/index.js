/*!
 * Msg
 * @author ydr.me
 * @create 2015-01-12 10:47
 */


define(function (require, exports, module) {
    /**
     * @module ui/Msg/
     * @module ui/Mask/
     * @module ui/Window/
     */

    'use strict';

    var Mask = require('../Mask/');
    var Window = require('../Window/');
    var ui = require('../base.js');
    var dato = require('../../util/dato.js');
    var typeis = require('../../util/typeis.js');
    var alienIndex = 0;
    var alienClass = 'alien-ui-msg';
    var defaults = {
        width: 300,
        height: 'auto',
        left: 'center',
        top: 'center',
        title: '提示',
        content: 'Hello world!',
        addClass: '',
        buttons: null,
        canDrag: true,
        isModal: true,
        timeout: -1
    };
    var Msg = ui.create({
        constructor: function (options) {
            var the = this;

            if (typeis.string(options)) {
                options = {
                    content: options
                };
            }

            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },


        _init: function () {

        }
    });

    module.exports = Msg;
});