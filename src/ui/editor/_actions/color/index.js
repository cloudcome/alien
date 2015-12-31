/**
 * 颜色选择器
 * @author ydr.me
 * @create 2015-12-24 15:37
 */


define(function (require, exports, module) {
    'use strict';

    var Card = require('../../_card.js');
    var ui = require('../../../index.js');
    var klass = require('../../../../utils/class.js');
    var dato = require('../../../../utils/dato.js');
    var attribute = require('../../../../core/dom/attribute.js');
    var event = require('../../../../core/event/base.js');
    var Template = require('../../../../libs/template.js');
    var template = require('./template.html', 'html');
    var style = require('./style.css', 'css');
    var tpl = new Template(template);

    var namespace = 'donkey-ui-editor_action-color';
    var commandTypeMap = {
        1: 'foreColor',
        2: 'backColor'
    };
    var defaults = {
        colors: [
            '880000', '800080', 'ff0000', 'ff00ff',
            '000080', '0000ff', '00ffff', '008080',
            '008000', '808000', '00ff00', 'ffcc00',
            '000000', '808080', 'c0c0c0', 'ffffff'
        ],
        style: {
            width: 134
        },
        type: 1
    };

    var Color = ui.create({
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

            the._card = new Card({
                style: options.style,
                template: tpl.render(options)
            });
        },


        _initEvent: function () {
            var the = this;

            event.on(the._card.getNode(), 'click', '.' + namespace + '-item', the._onclick = function () {
                var color = attribute.data(this, 'color');
                var command = commandTypeMap[the._options.type];

                the.editor.restoreSelection();
                the.editor[command](color);
                the._card.close();
            });
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            event.un(the._card.getNode(), 'click', the._onclick);
            the._card.destroy();
        }
    });

    ui.importStyle(style);
    klass.transfer(Card, Color, '_card');
    Color.defaults = defaults;
    module.exports = Color;
});