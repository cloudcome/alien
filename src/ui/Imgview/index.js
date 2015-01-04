/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-01-04 21:43
 */


define(function (require, exports, module) {
    /**
     * @module ui/Viewer
     */
    'use strict';


    var generator = require('../generator.js');
    var Dialog = require('../Dialog/');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/touch.js');
    var Template = require('../../libs/Template.js');
    var template = require('html!./template.html');
    var style = require('css!./style.css');
    var dato = require('../../util/dato.js');
    var tpl = new Template(template);
    var alienClass = 'alien-ui-imgview';
    var defaults = {};
    var Imgview = generator({
        constructor: function (options) {
            var the = this;

            the._options = dato.extend({}, defaults, options);
            the._init();
        },

        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;

            the._initNode();
            the._initDialog();
            the._initEvent();
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var html = tpl.render({});
            var node = modification.parse(html)[0];

            modification.insert(node, document.body, 'beforeend');
            the._$ele = node;
        },


        /**
         * 初始化对话框
         * @private
         */
        _initDialog: function () {
            var the = this;

            the._dialogOptions = {
                title: null,
                addClass: alienClass + '-dialog'
            };
            the._dialog = new Dialog(the._$ele, the._dialogOptions);
            the._dialog.open();
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {

        }
    });

    modification.importStyle(style);
    module.exports = Imgview;
});