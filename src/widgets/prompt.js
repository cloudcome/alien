/*!
 * prompt
 * @author ydr.me
 * @create 2014-12-14 18:12
 */


define(function (require, exports, module) {
    'use strict';

    /**
     * @module widgets/prompt
     * @requires ui/Msg/
     * @requires ui/
     * @requires utils/dato
     */

    var selector = require('../core/dom/selector.js');
    var ui = require('../ui/');
    var Msg = require('../ui/Msg/');
    var typeis = require('../utils/typeis.js');
    var dato = require('../utils/dato.js');
    var allocation = require('../utils/allocation.js');
    var alienClass = 'alien-widgets-prompt';
    var alienIndex = 0;
    var defaults = {
        title: '请输入',
        buttons: ['确定', '取消'],
        addClass: alienClass,
        sureIndex: 0,
        input: {
            tagName: 'input',
            type: 'text',
            className: '',
            placeholder: '请输入'
        }
    };
    var Confirm = ui.create(function (tips, defaultValue, options) {
        var args = allocation.args(arguments);

        if (!typeis.string(args[1])) {
            defaultValue = '';
            options = args[1];
        }

        options = dato.extend(true, {}, defaults, options);
        options.input.tagName = options.input.tagName.toLowerCase();
        options.input.type = options.input.type.toLowerCase();
        options.content = '<div>' + tips + '</div>' +
        '<' + options.input.tagName + ' ' +
        'type="' + options.input.type + '" ' +
        'class="' + options.input.className + '" ' +
        'placeholder="' + options.input.placeholder + '" ' +
        'value="' + defaultValue + '"' +
        'id="' + alienClass + alienIndex + '">' +
        (options.input.tagName === 'textarea' ? defaultValue + '</textarea>' : '');

        var the = this;

        the._id = alienIndex++;
        the.prompt = new Msg(options).on('open', function () {
            the._$input = selector.query('#' + alienClass + the._id)[0];
            the._$input.select();
            the._$input.focus();
        }).on('close', function (index) {
            the.emit(options.sureIndex === index ? 'sure' : 'cancel', the._$input.value);
        });
    });

    module.exports = function (content, options) {
        return new Confirm(content, options);
    };
});