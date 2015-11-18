/*!
 * 遮罩
 * @author ydr.me
 * @create 2015-01-11 13:06
 */


define(function (require, exports, module) {
    /**
     * @module ui/mask/
     * @requires utils/dato
     * @requires utils/typeis
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/dom/animation
     * @requires ui/
     */
    'use strict';

    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/touch.js');
    var animation = require('../../core/dom/animation.js');
    var ui = require('../');
    var style = require('./style.css', 'css');
    var alienIndex = 0;
    var alienClass = 'alien-ui-mask';
    var maskWindowLength = 0;
    var maskWindowList = [];
    var win = window;
    var doc = win.document;
    var html = doc.documentElement;
    var body = doc.body;
    var defaults = {
        addClass: '',
        duration: 234,
        style: {},
        easing: 'ease-in-out-circ',
        // 是否固定窗口
        fixed: true
    };
    var Mask = ui.create({
        constructor: function ($cover, options) {
            var the = this;

            the._$cover = selector.query($cover)[0];
            the._$cover = _isSimilar2Window(the._$cover) ? win : the._$cover;
            the._options = dato.extend(true, {}, defaults, options);
            the.destroyed = false;
            the.visible = false;
            the.className = 'mask';
            the._initNode();
            the._initEvent();

            return the;
        },


        _initNode: function () {
            var the = this;
            var options = the._options;
            var style = dato.extend({
                display: 'none'
            }, options.style);

            the.id = alienIndex;
            the._$mask = modification.create('div', {
                id: alienClass + '-' + alienIndex++,
                style: style,
                'class': alienClass
            });
            attribute.addClass(the._$mask, options.addClass);
            modification.insert(the._$mask, body);
        },


        _initEvent: function () {
            var the = this;

            event.on(the._$mask, 'click', function (eve) {
                if (!selector.has(eve.target, this)) {
                    return;
                }

                var $window = selector.closest(eve.target, '.alien-ui-window')[0];

                if (!$window) {
                    /**
                     * 触碰了遮罩
                     * @event hit
                     */
                    the.emit('hit');
                }
            });
        },


        /**
         * 打开 mask
         */
        open: function () {
            var the = this;

            if (the.visible) {
                return the;
            }

            var options = the._options;
            var pos = Mask.getCoverSize(the._$cover);

            pos.display = 'block';
            pos.zIndex = ui.getZindex();
            attribute.css(the._$mask, pos);
            the.visible = true;

            /**
             * 遮罩打开
             * @event open
             */
            the.emit('open');

            if (the._$cover === win) {
                maskWindowLength++;
                maskWindowList.push(the);

                if (options.fixed && attribute.height(body) > attribute.height(win)) {
                    attribute.addClass(body, alienClass + '-overflow');
                }
            }

            return the;
        },


        /**
         * 重置尺寸
         * @param pos
         */
        resize: function (pos) {
            var the = this;

            if (!the.visible) {
                return the;
            }

            var options = the._options;

            pos = dato.extend({}, Mask.getCoverSize(the._$cover), pos);
            animation.transition(the._$mask, pos, {
                duation: options.duration,
                easing: options.easing
            }, function () {
                /**
                 * 遮罩改变尺寸后
                 * @event resize
                 */
                the.emit('resize');
            });

            return the;
        },


        /**
         * 关闭 mask
         */
        close: function () {
            var the = this;

            if (!the.visible) {
                return the;
            }

            attribute.css(the._$mask, 'display', 'none');
            the.visible = false;

            /**
             * 遮罩关闭后
             * @event close
             */
            the.emit('close');

            if (the._$cover === window) {
                maskWindowLength--;

                var findIndex = -1;

                dato.each(maskWindowList, function (index, mask) {
                    if (mask.id === the.id) {
                        findIndex = index;
                        return false;
                    }
                });

                maskWindowList.splice(findIndex, 1);
            }

            if (!maskWindowLength) {
                attribute.removeClass(body, alienClass + '-overflow');
            }

            return the;
        },


        /**
         * 获取当前 mask 节点
         * @returns {Object}
         */
        getNode: function () {
            return this._$mask;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            if (the.destroyed) {
                return;
            }

            the.destroyed = true;
            the.close();
            event.un(the._$mask, 'click');
            modification.remove(the._$mask);
        }
    });


    /**
     * 获得需要覆盖的尺寸
     * @param $ele {Object} 要覆盖的尺寸及定位
     * @returns {*}
     */
    Mask.getCoverSize = function ($ele) {
        $ele = _isSimilar2Window($ele) ? win : $ele;
        var ret = {
            overflow: 'auto',
            overflowScrolling: 'touch'
        };

        // 其他节点
        if ($ele === win) {
            return dato.extend(ret, {
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            });
        }

        return dato.extend(ret, {
            position: 'absolute',
            width: attribute.outerWidth($ele),
            height: attribute.outerHeight($ele),
            top: attribute.top($ele),
            left: attribute.left($ele)
        });
    };


    /**
     * 覆盖 window 的 mask 列表
     * @type {Array}
     */
    Mask.maskWindowList = maskWindowList;


    /**
     * 获得当前最顶层覆盖 window 的 mask
     * @returns {*}
     */
    Mask.getTopWindowMask = function () {
        return maskWindowList[maskWindowLength - 1];
    };

    module.exports = Mask;
    style += '.' + alienClass + '-overflow{padding-right:' + _getScrollbarWidth() + 'px !important;}';
    ui.importStyle(style);
    event.on(document, 'keyup', function (eve) {
        var mask;

        if (eve.which === 27 && Mask.maskWindowList.length) {
            mask = Mask.getTopWindowMask();

            /**
             * 当前遮罩被按 ESC 后
             * @event esc
             */
            mask.emit('esc');
        }
    });


    /**
     * 获得当前页面的滚动条宽度
     * @returns {number}
     * @private
     */
    function _getScrollbarWidth() {
        var divWidth = 100;
        var $div = modification.create('div', {
            style: {
                position: 'absolute',
                width: divWidth,
                height: 100,
                overflow: 'scroll'
            }
        });

        modification.insert($div, document.body);
        var width = divWidth - $div.clientWidth;
        modification.remove($div);

        return width;
    }

    /**
     * 是否与 window 同等对待
     * @param $ele
     * @returns {boolean}
     * @private
     */
    function _isSimilar2Window($ele) {
        return $ele === win || $ele === doc ||
            $ele === html || $ele === body || !$ele;
    }
});