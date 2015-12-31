/**
 * 编辑器对话框
 * @author ydr.me
 * @create 2015-12-29 18:19
 */


define(function (require, exports, module) {
    'use strict';

    var ui = require('../index.js');
    var Dialog = require('../dialog/index.js');
    var klass = require('../../utils/class.js');
    var dato = require('../../utils/dato.js');
    var number = require('../../utils/number.js');
    var event = require('../../core/event/base.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var style = require('./dialog.css', 'css');

    var namespace = 'donkey-ui-editor_dialog';
    ui.importStyle(style);
    module.exports = klass.extend(Dialog).create(function () {
        var the = this;
        var eContainer = the.getNode();

        if (the._options.buttons.length) {
            var eDiv = modification.create('div', {
                'class': namespace + '-action'
            });

            eContainer.appendChild(eDiv);
            eContainer = eDiv;
        }

        dato.each(the._options.buttons, function (index, button) {
            button['class'] = button['class'] || '';
            button['class'] += ' ' + namespace + '-btn';
            button['data-index'] = index;
            var eBtn = modification.create('div', button);

            eBtn.innerHTML = button.text;
            eContainer.appendChild(eBtn);
        });

        attribute.addClass(the._$window, namespace);
        event.on(eContainer, 'click', '.' + namespace + '-btn', function () {
            var index = attribute.data(this, 'index');

            index = number.parseInt(index);
            the.emit('action', index);
        });
    });
});