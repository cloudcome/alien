/*!
 * textarea 自增高
 * @author ydr.me
 * @create 2014-12-16 11:07
 * @ref http://www.jacklmoore.com/autosize
 */


define(function (require, exports, module) {
    /**
     * @module libs/Autoheight
     * @requires ui/generator
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/event/base
     * @requires util/dato
     */
    'use strict';

    var generator = require('../generator.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/base.js');
    var dato = require('../../util/dato.js');
    var style = require('css!./style.css');
    var alienClass = 'alien-ui-autoheight';
    var defaults = {};
    var typographyStyles = [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'fontStyle',
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
            top: -9999,
            left: -9999,
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
        // 使输入框的高度多出一行，避免文本域高度变化的时候文字重排
        $mirror.value = value + '\n';
        attribute.width($mirror, width);

        var scrollHeight = $mirror.scrollHeight;

        attribute.innerHeight($ref, scrollHeight > the._innerHeight ? scrollHeight : the._innerHeight);
        $mirror.value = value;
    };
    var Autoheight = generator({
        STATIC: {},
        constructor: function ($ele, options) {
            var the = this;

            the._$ele = selector.query($ele);

            if (!the._$ele.length) {
                throw new Error('instance element is empty');
            }

            the._$ele = the._$ele[0];
            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;

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
            // 先插入字符，重新排版后还原
            $ele.value = ' ';
            the._$ele.style.height = 'auto';
            the._innerHeight = attribute.innerHeight(the._$ele);
            $ele.value = value;
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;

            adjust.call(the);
            event.on(the._$ele, 'input', adjust.bind(the));
        },


        /**
         * 重新定位尺寸
         */
        resize: function () {
            var the = this;
            the._initSize();
            adjust.call(the);
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            event.un(the._$ele, 'input', adjust);
        }
    });

    modification.importStyle(style);
    document.body.appendChild($mirror);
    module.exports = Autoheight;
});