/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-02-05 10:51
 */


define(function (require, exports, module) {
    /**
     * @module parent/index
     */
    'use strict';

    var calendar = require('../../util/calendar.js');
    var dato = require('../../util/dato.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/touch.js');
    var Template = require('../../libs/Template.js');
    var ui = require('../base.js');
    var html = require('html!./template.html');
    var style = require('css!./style.css');
    var tpl = new Template(html);
    var alienClass = 'alien-ui-datepicker';
    var alienIndex = 0;
    var $body = document.body;
    var now = new Date();
    var defaults = {
        year: now.getFullYear(),
        month: now.getMonth(),
        date: now.getDate(),
        activeDate: now,
        firstDayInWeek: 0,
        addClass: '',
        lang: {
            // 星期前缀，如：“星期”或“周”等
            weekPrefix: '',
            weeks: ['日', '一', '二', '三', '四', '五', '六']
        }
    };
    var Datepicker = ui.create({
        constructor: function (options) {
            var the = this;

            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        }
    });
    var pro = Datepicker.prototype;

    pro._init = function () {
        var the = this;
        var options = the._options;

        the._initNode();
        the.render(options.year, options.month, options);
    };

    pro._initNode = function () {
        var the = this;
        var options = the._options;
        var $wrap = modification.create('div', {
            class: alienClass + ' ' + options.addClass,
            id: alienIndex++
        });

        modification.insert($wrap, $body);
        the._$wrap = $wrap;
    };

    pro.render = function (year, month) {
        var the = this;
        var options = the._options;
        var list = calendar.month(year, month, options);
        var data = {
            thead: [],
            tbody: list
        };
        var i = options.firstDayInWeek;
        var j = i + 7;
        var k;

        for (; i < j; i++) {
            k = i % 7;
            data.thead.push(options.lang.weekPrefix + options.lang.weeks[k]);
        }

        the._$wrap.innerHTML = tpl.render(data);
    };

    module.exports = Datepicker;
    modification.importStyle(style);
});