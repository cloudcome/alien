/*!
 * 图片裁剪
 * @author ydr.me
 * @create 2014-10-28 15:21
 */


define(function (require, exports, module) {
    /**
     * @module ui/img-clip/
     * @requires ui/
     * @requires libs/template
     * @requires utils/dato
     * @requires utils/number
     * @requires utils/controller
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/dom/animation
     * @requires core/event/drag
     * @requires ui/resize/
     */
    'use strict';

    var ui = require('../');
    var style = require('./style.css', 'css');
    var template = require('./template.html', 'html');
    var Template = require('../../libs/template.js');
    var dato = require('../../utils/dato.js');
    var number = require('../../utils/number.js');
    var controller = require('../../utils/controller.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/drag.js');
    var Resize = require('../resize/index.js');
    var animationOptions = {
        duration: 345
    };
    var alienIndex = 1;
    var defaults = {
        minWidth: 0,
        minHeight: 0,
        maxWidth: 0,
        maxHeight: 0,
        ratio: 0
    };
    var Imgclip = ui.create({
        constructor: function ($ele, options) {
            var the = this;

            $ele = selector.query($ele);

            if (!$ele.length) {
                throw 'instance require an element';
            }

            the._$ele = $ele[0];
            the.destroyed = false;
            the._options = dato.extend(!0, {}, defaults, options);
            the.className = 'img-clip';

            if (the._$ele.complete) {
                the._init();
            } else {
                event.on(the._$ele, 'load', the._init.bind(the));
            }
        },
        /**
         * 调整裁剪尺寸
         * @private
         */
        _ratioClip: function () {
            var the = this;
            var options = the._options;

            if (the.destroyed) {
                return;
            }

            the.destroyed = true;
            options.minWidth = options.minWidth * the._ratioWidth;
            options.maxWidth = options.maxWidth * the._ratioWidth;
            options.minHeight = options.minHeight * the._ratioHeight;
            options.maxHeight = options.maxHeight * the._ratioHeight;
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;
            var $ele = the._$ele;
            var options = the._options;
            var img = new Image();
            var adjust;

            // 外围尺寸
            the._wrapWidth = attribute.width($ele);
            the._wrapHeight = attribute.height($ele);
            img.src = $ele.src;
            img.onload = function () {
                the._imgWidth = this.width;
                the._imgHeight = this.height;
                the._ratioWidth = the._wrapWidth / the._imgWidth;
                the._ratioHeight = the._wrapHeight / the._imgHeight;
                the._ratioClip();

                if (options.minWidth > 0 && the._wrapWidth < options.minWidth ||
                    options.minHeight > 0 && the._wrapHeight < options.minHeight) {
                    controller.nextTick(function () {
                        /**
                         * 图片裁剪出现错误
                         * @event error
                         * @param err {Error} 错误对象
                         */
                        the.emit('error', new Error('图片尺寸至少需要' + options.minWidth + '×' + options.minHeight + 'px'));
                    });
                } else {
                    adjust = _adjustSize(options.minWidth, options.minHeight, options.ratio, !0);
                    options.minWidth = adjust[0];
                    options.minHeight = adjust[1];
                    the._initSize();
                }
            };
            return the;
        },


        _initSize: function () {
            var the = this;
            var tpl = new Template(template);
            var wrap;
            var $ele = the._$ele;
            var $img = $ele.cloneNode(true);
            var $wrap;

            if (attribute.css($ele.parentNode, 'position') === 'static') {
                attribute.css($ele.parentNode, 'postion', 'relative');
            }

            the._id = alienIndex++;
            wrap = tpl.render({
                id: the._id
            });

            $wrap = the._$wrap = modification.parse(wrap)[0];
            modification.insert($wrap, $ele, 'afterend');

            // 选区最大尺寸
            the._maxWidth = the._wrapWidth;
            the._maxHeight = the._wrapHeight;

            attribute.css($wrap, {
                position: 'absolute',
                width: the._wrapWidth,
                height: the._wrapHeight
            });
            attribute.top($wrap, attribute.top($ele));
            attribute.left($wrap, attribute.left($ele));

            var nodes = selector.query('.j-flag', $wrap);

            the._$bg = nodes[0];
            the._$sele = nodes[1];
            modification.insert($img, the._$sele, 'afterbegin');
            attribute.css($img, {
                width: the._wrapWidth,
                height: the._wrapHeight,
                maxWidth: 'none',
                maxHeight: 'none'
            });
            the._$img = $img;
            // 重置选区
            the._reset();
            the._resize = new Resize(the._$sele, the._options);
            the._initEvent();
            the.on('clipstart clipend', the._updateClipRange);
        },


        /**
         * 更新选区的范围
         * @private
         */
        _updateClipRange: function () {
            var the = this;
            var options = the._options;
            var maxWidth = the._wrapWidth - the._selection.left;
            var maxHeight = the._wrapHeight - the._selection.top;
            var adjust = _adjustSize(maxWidth, maxHeight, options.ratio);

            the._maxLeft = the._wrapWidth - the._selection.width;
            the._maxTop = the._wrapHeight - the._selection.height;
            the._resize.setOptions({
                minWidth: options.minWidth,
                minHeight: options.minHeight,
                maxWidth: the._maxWidth = adjust[0],
                maxHeight: the._maxHeight = adjust[1]
            });
        },


        /**
         * 重置选区
         * @private
         */
        _reset: function () {
            var the = this;

            the._selection = {
                top: 0,
                left: 0,
                width: 0,
                height: 0
            };
        },


        /**
         * 事件监听
         * @private
         */
        _initEvent: function () {
            var the = this;
            var x0;
            var y0;
            var left0;
            var top0;
            // 0 无选区
            // 1 正在选区
            // 2 已有选区
            // 3 移动选区
            // 4 缩放选区
            var state = 0;
            var isReset = false;
            var options = the._options;

            event.on(the._$wrap, 'dragstart', function (eve) {
                eve.preventDefault();

                var left;
                var top;

                // 开始新选区
                if (state === 0 || state === 2) {
                    isReset = state === 2;
                    state = 1;
                    left = attribute.left(the._$wrap);
                    top = attribute.top(the._$wrap);
                    x0 = eve.pageX;
                    y0 = eve.pageY;
                    attribute.css(the._$bg, 'display', 'block');
                    attribute.css(the._$sele, {
                        display: 'block',
                        left: the._selection.left = x0 - left,
                        top: the._selection.top = y0 - top,
                        width: 0,
                        height: 0
                    });
                    attribute.css(the._$img, {
                        left: -the._selection.left,
                        top: -the._selection.top
                    });

                    /**
                     * 裁剪开始
                     * @event clipstart
                     * @param selection {{width:Number,height:Number,left:Number,top:Number,srcWidth:Number,srcHeight:Number,srcLeft:Number,srcTop:Number}} 裁剪区域
                     */
                    the.emit('clipstart', the._selection);
                }
            });

            event.on(the._$wrap, 'drag', function (eve) {
                eve.preventDefault();

                var width;
                var height;
                var adjust;

                if (state === 1) {
                    width = eve.pageX - x0;
                    height = eve.pageY - y0;

                    if (width > the._maxWidth) {
                        width = the._maxWidth;
                    }

                    if (height > the._maxHeight) {
                        height = the._maxHeight;
                    }

                    adjust = _adjustSize(width, height, options.ratio);
                    width = adjust[0];
                    height = adjust[1];

                    attribute.css(the._$sele, {
                        width: the._selection.width = width,
                        height: the._selection.height = height
                    });

                    /**
                     * 裁剪中
                     * @event clip
                     * @param selection {{width:Number,height:Number,left:Number,top:Number,srcWidth:Number,srcHeight:Number,srcLeft:Number,srcTop:Number}} 裁剪区域
                     */
                    the.emit('clip', the._selection);
                }
            });

            event.on(the._$wrap, 'dragend', function (eve) {
                var deltaLeft;
                var deltaTop;
                var selectionProp = {};
                var imgProp = {};

                eve.preventDefault();

                if (state === 1) {
                    state = 2;

                    // 1. 调整尺寸
                    if (the._selection.width < options.minWidth) {
                        selectionProp.width = the._selection.width = options.minWidth;
                    }

                    if (the._selection.height < options.minHeight) {
                        selectionProp.height = the._selection.height = options.minHeight;
                    }

                    // 2. 调整位置
                    if ((deltaLeft = the._selection.width + the._selection.left - the._wrapWidth) > 0) {
                        selectionProp.left = the._selection.left -= deltaLeft;
                        imgProp.left = -the._selection.left;
                    }

                    if ((deltaTop = the._selection.height + the._selection.top - the._wrapHeight) > 0) {
                        selectionProp.top = the._selection.top -= deltaTop;
                        imgProp.top = -the._selection.top;
                    }

                    animation.transition(the._$sele, selectionProp, animationOptions);
                    animation.transition(the._$img, imgProp, animationOptions);
                    the._ratioSelection();

                    /**
                     * 裁剪结束
                     * @event clipend
                     * @param selection {{width:Number,height:Number,left:Number,top:Number,srcWidth:Number,srcHeight:Number,srcLeft:Number,srcTop:Number}} 裁剪区域
                     */
                    the.emit('clipend', the._selection);
                }
            });

            event.on(the._$sele, 'dragstart', function (eve) {
                eve.preventDefault();

                if (state === 2) {
                    state = 3;
                    left0 = number.parseFloat(attribute.css(the._$sele, 'left'), 0);
                    top0 = number.parseFloat(attribute.css(the._$sele, 'top'), 0);
                    x0 = eve.pageX;
                    y0 = eve.pageY;

                    /**
                     * 裁剪开始
                     * @event clipstart
                     * @param selection {{width:Number,height:Number,left:Number,top:Number,srcWidth:Number,srcHeight:Number,srcLeft:Number,srcTop:Number}} 裁剪区域
                     */
                    the.emit('clipstart', the._selection);
                }
            });

            event.on(the._$sele, 'drag', function (eve) {
                eve.preventDefault();

                var left;
                var top;

                if (state === 3) {
                    left = left0 + eve.pageX - x0;
                    top = top0 + eve.pageY - y0;

                    if (left <= 0) {
                        left = 0;
                    } else if (left >= the._maxLeft) {
                        left = the._maxLeft;
                    }

                    if (top <= 0) {
                        top = 0;
                    } else if (top >= the._maxTop) {
                        top = the._maxTop;
                    }

                    the._selection.left = left;
                    the._selection.top = top;

                    attribute.css(the._$sele, {
                        left: left,
                        top: top
                    });
                    attribute.css(the._$img, {
                        left: -left,
                        top: -top
                    });

                    /**
                     * 裁剪中
                     * @event clip
                     * @param selection {{width:Number,height:Number,left:Number,top:Number,srcWidth:Number,srcHeight:Number,srcLeft:Number,srcTop:Number}} 裁剪区域
                     */
                    the.emit('clip', the._selection);
                }
            });

            event.on(the._$sele, 'dragend', function (eve) {
                eve.preventDefault();

                if (state === 3) {
                    state = 2;
                    the._ratioSelection();

                    /**
                     * 裁剪结束
                     * @event clipend
                     * @param selection {{width:Number,height:Number,left:Number,top:Number,srcWidth:Number,srcHeight:Number,srcLeft:Number,srcTop:Number}} 裁剪区域
                     */
                    the.emit('clipend', the._selection);
                }
            });

            the._resize.on('resizestart', function () {
                if (state === 2) {
                    state = 4;

                    /**
                     * 裁剪开始
                     * @event clipstart
                     * @param selection {{width:Number,height:Number,left:Number,top:Number,srcWidth:Number,srcHeight:Number,srcLeft:Number,srcTop:Number}} 裁剪区域
                     */
                    the.emit('clipstart', the._selection);
                }
            });

            the._resize.on('resize', function (size) {
                if (state === 4) {
                    the._selection.width = size.width;
                    the._selection.height = size.height;

                    /**
                     * 裁剪中
                     * @event clip
                     * @param selection {{width:Number,height:Number,left:Number,top:Number,srcWidth:Number,srcHeight:Number,srcLeft:Number,srcTop:Number}} 裁剪区域
                     */
                    the.emit('clip', the._selection);
                }
            });

            the._resize.on('resizeend', function () {
                if (state === 4) {
                    state = 2;
                    the._ratioSelection();

                    /**
                     * 裁剪结束
                     * @event clipend
                     * @param selection {{width:Number,height:Number,left:Number,top:Number,srcWidth:Number,srcHeight:Number,srcLeft:Number,srcTop:Number}} 裁剪区域
                     */
                    the.emit('clipend', the._selection);
                }
            });

            event.on(the._$bg, 'click', function () {
                if (state === 2) {
                    if (isReset) {
                        isReset = false;
                    } else {
                        state = 0;
                        attribute.css(the._$bg, 'display', 'none');
                        attribute.css(the._$sele, 'display', 'none');
                        the._reset();

                        /**
                         * 裁剪取消
                         * @event cancel
                         * @param selection {{width:Number,height:Number,left:Number,top:Number,srcWidth:Number,srcHeight:Number,srcLeft:Number,srcTop:Number}} 裁剪区域
                         */
                        the.emit('cancel', the._selection);
                    }
                }
            });
        },


        /**
         * 调整原始选区尺寸
         * @private
         */
        _ratioSelection: function () {
            var the = this;

            the._selection.srcLeft = the._selection.left / the._ratioWidth;
            the._selection.srcTop = the._selection.top / the._ratioWidth;
            the._selection.srcWidth = the._selection.width / the._ratioWidth;
            the._selection.srcHeight = the._selection.height / the._ratioHeight;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            event.un(the._$wrap, 'dragstart');
            event.un(the._$wrap, 'drag');
            event.un(the._$wrap, 'dragend');
            event.un(the._$sele, 'dragstart');
            event.un(the._$sele, 'drag');
            event.un(the._$sele, 'dragend');
            event.un(the._$bg, 'click');

            if (the._resize) {
                the._resize.destroy();
                modification.remove(the._$wrap);
            }
        }
    });

    Imgclip.defaults = defaults;
    ui.importStyle(style);
    module.exports = Imgclip;


    /**
     * 按比例校准尺寸
     * @param width
     * @param height
     * @param ratio
     * @param [isReferToSmaller=false] {Boolean} 是否参照小边，默认false
     * @returns {Array}
     * @private
     */
    function _adjustSize(width, height, ratio, isReferToSmaller) {
        if (!ratio) {
            return [width, height];
        }

        if (!width && !height) {
            return [0, 0];
        }

        if (!width) {
            return [height * ratio, height];
        }

        if (!height) {
            return [width, width / ratio];
        }

        return width / height > ratio ?
            (isReferToSmaller ? [width, width / ratio] : [height * ratio, height]) :
            (isReferToSmaller ? [height * ratio, height] : [width, width / ratio]);
    }
});