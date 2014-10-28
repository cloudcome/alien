/*!
 * 图片裁剪
 * @author ydr.me
 * @create 2014-10-28 15:21
 */


define(function (require, exports, module) {
    /**
     * @todo 增加 ui/Resize，独立出来
     * @module ui/Imgclip/index
     * @module libs/Template
     * @module libs/Emitter
     * @module util/data
     * @module util/class
     * @module core/dom/selector
     * @module core/dom/modification
     * @module core/dom/attribute
     * @module core/dom/drag
     */
    'use strict';

    var style = require('text!./style.css');
    var template = require('text!./template.html');
    var Template = require('../../libs/Template.js');
    var Emitter = require('../../libs/Emitter.js');
    var data = require('../../util/data.js');
    var klass = require('../../util/class.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/drag.js');
    var alienIndex = 1;
    var defaults = {
        minWidth: 100,
        minHeight: 100,
        maxWidth: null,
        maxHeight: null,
        ratio: 1
    };
    var Imgclip = klass.create({
        STATIC: {
            defaults: defaults
        },
        constructor: function ($ele, options) {
            var the = this;

            $ele = selector.query($ele);

            if (!$ele.length) {
                throw 'instance require an element';
            }

            Emitter.apply(the);
            the._$ele = $ele[0];
            the._options = data.extend(!0, {}, defaults, options);

            if (the._$ele.complete) {
                the._init();
            } else {
                event.on(the._$ele, 'load', the._init.bind(the));
            }
        },
        _init: function () {
            var the = this;
            var tpl = new Template(template);
            var wrap;
            var $ele = the._$ele;
            var $img = $ele.cloneNode(!0);
            var $wrap;

            the._id = alienIndex++;
            wrap = tpl.render({
                id: the._id
            });

            $wrap = the._$wrap = modification.parse(wrap)[0];
            modification.insert($wrap, $ele, 'afterend');
            attribute.css($wrap, {
                position: 'absolute',
                width: the._width = attribute.width($ele),
                height: the._height = attribute.height($ele)
            });
            attribute.top($wrap, attribute.top($ele));
            attribute.left($wrap, attribute.left($ele));
            the._$sele = selector.query('.alien-ui-imgclip-selection', $wrap)[0];
            the._$bg = selector.query('.alien-ui-imgclip-bg', $wrap)[0];
            the._$in = selector.query('.alien-ui-imgclip-in', $wrap)[0];
            modification.insert($img, the._$sele, 'afterbegin');
            the._$img = $img;
            the.x0 = 0;
            the.y0 = 0;
            the.x1 = 0;
            the.y1 = 0;
            the._on();
        },
        _on: function () {
            var the = this;
            var left0;
            var top0;
            var width0;
            var height0;
            var x0;
            var y0;
            // 0 未拖动
            // 1 正在拖动
            // 2 已有选区
            // 3 改变选区
            var state = 0;

            event.on(the._$wrap, 'dragstart', function (eve) {
                eve.preventDefault();
                var left;
                var top;

                if (state === 0) {
                    left0 = attribute.left(the._$wrap);
                    top0 = attribute.top(the._$wrap);
                    x0 = eve.pageX;
                    y0 = eve.pageY;
                    state = 1;
                    attribute.css(the._$bg, 'display', 'block');
                    attribute.css(the._$sele, {
                        display: 'block',
                        left: left = x0 - left0,
                        top: top = y0 - top0,
                        width: 0,
                        height: 0
                    });
                    attribute.css(the._$img, {
                        left: -left,
                        top: -top
                    });
                }
            });

            event.on(the._$wrap, 'drag', function (eve) {
                var deltaX;
                var deltaY;

                eve.preventDefault();

                if (state === 1) {
                    deltaX = eve.pageX - x0;
                    deltaY = eve.pageY - y0;
                    attribute.css(the._$sele, {
                        width: deltaX,
                        height: deltaY
                    });
                } else if (state === 2) {

                }
            });

            event.on(the._$wrap, 'dragend', function (eve) {
                eve.preventDefault();

                if (state === 1) {
                    state = 2;
                }
            });

            event.on(the._$in, 'dragstart', function (eve) {
                eve.preventDefault();

                if (state === 2) {
                    state = 3;
                    left0 = data.parseFloat(attribute.css(the._$sele, 'left'), 0);
                    top0 = data.parseFloat(attribute.css(the._$sele, 'top'), 0);
                    width0 = data.parseFloat(attribute.css(the._$sele, 'width'), 0);
                    height0 = data.parseFloat(attribute.css(the._$sele, 'height'), 0);
                    x0 = eve.pageX;
                    y0 = eve.pageY;
                    console.log('x0 => ' + x0);
                }
            });
            event.on(the._$in, 'drag', function (eve) {
                eve.preventDefault();

                var deltaX;
                var deltaY;
                var left;
                var top;
                var maxLeft;
                var maxTop;

                if (state === 3) {
                    deltaX = eve.pageX - x0;
                    deltaY = eve.pageY - y0;
                    left = left0 + deltaX;
                    top = top0 + deltaY;
                    maxLeft = the._width - width0;
                    maxTop = the._height - height0;

                    if (left <= 0) {
                        left = 0;
                    } else if (left >= maxLeft) {
                        left = maxLeft;
                    }

                    if (top <= 0) {
                        top = 0;
                    } else if (top >= maxTop) {
                        top = maxTop;
                    }

                    attribute.css(the._$sele, {
                        left: left,
                        top: top
                    });
                    attribute.css(the._$img, {
                        left: -left,
                        top: -top
                    });
                }
            });
            event.on(the._$in, 'dragend', function (eve) {
                eve.preventDefault();

                if (state === 3) {
                    state = 2;
                }
            });

            event.on(the._$bg, 'click', function () {
                if (state === 2) {
                    state = 0;
                    attribute.css(the._$bg, 'display', 'none');
                    attribute.css(the._$sele, 'display', 'none');
                }
            });
        },
        _un: function () {

        },
        destroy: function () {
            var the = this;

            the._un();
        }
    }, Emitter);

    modification.importStyle(style);
    module.exports = Imgclip;
});