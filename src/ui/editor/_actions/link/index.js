/**
 * 链接选择器
 * @author ydr.me
 * @create 2015-12-28 17:36
 */


define(function (require, exports, module) {
    'use strict';

    var ui = require('../../../index.js');
    var Dialog = require('../../_dialog.js');
    var klass = require('../../../../utils/class.js');
    var dato = require('../../../../utils/dato.js');
    var event = require('../../../../core/event/base.js');
    var selector = require('../../../../core/dom/selector.js');
    var modification = require('../../../../core/dom/modification.js');
    var Template = require('../../../../libs/template.js');
    var template = require('./template.html', 'html');
    var style = require('./style.css', 'css');
    var tpl = new Template(template);

    var defaults = {
        width: 400,
        title: '链接',
        buttons: [{
            text: '确定'
        }, {
            text: '取消'
        }]
    };

    var Link = ui.create({
        constructor: function (editor, options) {
            var the = this;

            the._options = dato.extend({}, defaults, options);
            the.editor = editor;
            the._initNode();
            the._initEvent();
        },


        _initNode: function () {
            var the = this;
            var options = the._options;

            the._dialog = new Dialog({
                width: options.width,
                title: options.title,
                template: tpl.render(options),
                buttons: options.buttons
            });
            var nodes = selector.query('.j-flag', the._dialog.getNode());
            the._eUrl = nodes[0];
            the._eTitle = nodes[1];
            the._eTarget = nodes[2];
        },


        _initEvent: function () {
            var the = this;

            the._dialog.on('open', function () {
                the._eUrl.focus();
            });

            the._dialog.on('action', function (index) {
                switch (index) {
                    case 0:
                        var url = the._eUrl.value;

                        if (url) {
                            the.editor.wrap('a', {
                                href: url,
                                target: the._eTarget.checked ? '_blank' : '_self',
                                title: the._eTitle.value
                            });
                            the.reset();
                        }
                        break;
                }

                the._dialog.close();
            });
        },


        /**
         * 重置
         * @returns {Link}
         */
        reset: function () {
            var the = this;

            the._eUrl.value = '';
            the._eTitle.value = '';
            the._eTarget.checked = false;

            return the;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            the._dialog.destroy();
        }
    });

    ui.importStyle(style);
    klass.transfer(Dialog, Link, '_dialog');
    klass.transfer(Dialog.super_, Link, '_dialog');
    Link.defaults = defaults;
    module.exports = Link;
});