/*!
 * textarea 自增高
 * @author ydr.me
 * @create 2014-12-16 11:07
 * @ref http://www.jacklmoore.com/autosize
 */


define(function (require, exports, module) {
    /**
     * @module ui/auto-height/
     * @requires ui/
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/event/base
     * @requires utils/dato
     */
    'use strict';

    var ui = require('../');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/base.js');
    var dato = require('../../utils/dato.js');
    var selection = require('../../utils/selection.js');
    var controller = require('../../utils/controller.js');
    var style = require('./style.css', 'css');
    var alienClass = 'alien-ui-autoheight';
    var defaults = {
        offsetTop: 0
    };
    var typographyStyles = [
        'font',
        'letterSpacing',
        'textTransform',
        'wordSpacing',
        'textIndent',
        'whiteSpace',
        'lineHeight',
        'padding'
    ];
    // 创建镜像 textarea
    var $mirror = modification.create('textarea', {
        tabindex: -1,
        style: {
            position: 'absolute',
            top: '-9999em',
            left: '-9999em',
            border: 0,
            boxSizing: 'content-box',
            wordWrap: 'break-word',
            height: '0 !important',
            minHeight: '0 !important',
            overflow: 'hidden',
            transition: 'none'
        }
    });
    var adjust = function () {
        var the = this;
        var $ref = the._$ele;
        var value = $ref.value || attribute.attr($ref, 'placeholder') || '';
        var style = attribute.css($ref, typographyStyles);
        var width = attribute.width($ref);

        attribute.css($mirror, style);
        $mirror.value = value;
        attribute.width($mirror, width);

        var scrollHeight = $mirror.scrollHeight;

        attribute.innerHeight($ref, scrollHeight > the._innerHeight ? scrollHeight : the._innerHeight);
    };
    var AutoHeight = ui.create({
        constructor: function ($ele, options) {
            var the = this;

            the._$ele = selector.query($ele);

            if (!the._$ele.length) {
                throw new Error('instance element is empty');
            }

            the._$ele = the._$ele[0];
            the._options = dato.extend(true, {}, defaults, options);
            the.destroyed = false;
            the.className = 'auto-height';
            attribute.addClass(the._$ele, alienClass);
            the._initSize();
            the._initEvent();
        },


        /**
         * 初始化尺寸
         * @private
         */
        _initSize: function () {
            var the = this;
            var $ele = the._$ele;
            var value = $ele.value;

            attribute.css($ele, {
                overflow: 'hidden'
            });

            //the._pos = selection.getPos($ele);

            // 先插入字符，重新排版后还原
            $ele.value = ' ';
            the._$ele.style.height = 'auto';
            the._innerHeight = attribute.innerHeight(the._$ele);
            $ele.value = value;

            // 避免手机 safari 在滚动的时候聚焦输入框
            // selection.setPos($ele, the._pos);
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;


            adjust.call(the);
            event.on(the._$ele, 'input', the._adjust = controller.debounce(adjust.bind(the)));
        },


        /**
         * 重新定位尺寸
         * @public
         */
        resize: function () {
            var the = this;

            the._initSize();
            adjust.call(the);

            var offsetY = selection.getOffset(the._$ele)[1];

            animation.scrollTo(window, {
                y: attribute.top(the._$ele) + offsetY
            }, {
                duration: 1
            });
        },


        /**
         * 销毁实例
         * @public
         */
        destroy: function () {
            var the = this;

            if (the.destroyed) {
                return;
            }

            the.destroyed = true;
            event.un(the._$ele, 'input', the._adjust);
        }
    });

    ui.importStyle(style);
    document.body.appendChild($mirror);
    AutoHeight.defaults = defaults;
    module.exports = AutoHeight;
});