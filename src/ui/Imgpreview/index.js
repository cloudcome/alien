/*!
 * index.js
 * @author ydr.me
 * @create 2014-10-26 17:28
 */


define(function (require, exports, module) {
    /**
     * @module ui/Imgpreview/index
     * @requires util/class
     */
    'use strict';

    var klass = require('../../util/class.js');
    var data = require('../../util/data.js');
    var howdo = require('../../util/howdo.js');
    var Emitter = require('../../libs/Emitter.js');
    var selector = require('../../core/dom/selector.js');
    var event = require('../../core/event/base.js');
    var compatible = require('../../core/navigator/compatible.js');
    var url = window[compatible.html5('URL', window)];
    var defaults = {};
    var REG_EXTNAME = /\.[^.]*$/;
    var Imgpreview = klass.create({
        constructor: function (ele) {
            var the = this;

            ele = selector.query(ele);

            if (!ele.length) {
                throw new Error('instance element is empty');
            }

            the._$ele = ele[0];

            Emitter.call(the);
            the._init();
        },
        _init: function () {
            var the = this;

            event.on(the._$ele, 'change', the._onchange.bind(the));
        },
        _onchange: function () {
            var ret = [];
            var the = this;
            var $ele = the._$ele;

            if ($ele.files && $ele.files.length) {
                data.each($ele.files, function (i, file) {
                    if (/image/.test(file.type)) {
                        ret.push({
                            src: url.createObjectURL(file),
                            size: file.size,
                            type: file.type,
                            name: file.name,
                            extname: (file.name.match(REG_EXTNAME) || [''])[0],
                            file: file
                        });
                    }
                });
            }

            howdo.each(ret, function (i, item, done) {
                _getImgSize(item.src, done);
            }).together(function (err) {
                if (err) {
                    return the.emit('error', err);
                }

                var args = Array.prototype.slice.call(arguments, 1);

                data.each(args, function (j, size) {
                    ret[j].width = size.width;
                    ret[j].height = size.height;
                });

                the.emit(the._$ele, 'change', ret);
            });
        },
        destroy: function () {
            var the = this;

            event.un(the._$ele, 'change', the._onchange);
        }
    }, Emitter);

    module.exports = Imgpreview;


    /**
     * 获取图片尺寸
     * @param src
     * @param callback
     * @private
     */
    function _getImgSize(src, callback) {
        var img = new Image();
        img.src = src;
        img.onload = function () {
            callback(null, {
                width: this.width,
                height: this.height
            });
        };
        img.onerror = callback;
    }
});