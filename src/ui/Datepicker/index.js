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

    var calendar = require('../../utils/calendar.js');
    var dato = require('../../utils/dato.js');
    var date = require('../../utils/date.js');
    var typeis = require('../../utils/typeis.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var animation = require('../../core/dom/animation.js');
    var event = require('../../core/event/base.js');
    var Template = require('../../libs/Template.js');
    var ui = require('../');
    var html = require('html!./template.html');
    var style = require('css!./style.css');
    var tpl = new Template(html);
    var alienClass = 'alien-ui-datepicker';
    var alienIndex = 0;
    var $body = document.body;
    var now = new Date();
    var defaults = {
        activeDate: now,
        firstDayInWeek: 0,
        addClass: '',
        lang: {
            year: '年',
            month: '月',
            // 星期前缀，如：“星期”或“周”等
            weekPrefix: '',
            weeks: ['日', '一', '二', '三', '四', '五', '六']
        },
        range: [1970, now.getFullYear()],
        duration: 300,
        easing: 'in-out'
    };
    var Datepicker = ui.create(function ($input, options) {
        var the = this;

        the._$input = selector.query($input)[0];
        the._options = dato.extend(true, {}, defaults, options);
        the._init();
    });

    Datepicker.defaults = defaults;
    Template.config({
        debug: true
    });

    Datepicker.implement({
        _init: function () {
            var the = this;

            the._id = alienIndex++;
            the._initNode();
            the._initEvent();
        },


        /**
         * 渲染节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;
            var $wrap = modification.create('div', {
                class: alienClass + ' ' + options.addClass,
                id: alienClass + '-' + the._id
            });
            var nodes = selector.query('.j-flag', $wrap);

            the._$year = nodes[0];
            the._$month = nodes[1];
            modification.insert($wrap, $body);
            the._$wrap = $wrap;
        },


        /**
         * 选择年份
         * @param fullyear
         * @returns {Datepicker}
         */
        selectYear: function (fullyear) {
            var the = this;

            the._$year.value = fullyear;

            return the;
        },


        /**
         * 选择年份
         * @param natureMonth
         * @returns {Datepicker}
         */
        selectMonth: function (natureMonth) {
            var the = this;

            the._$month.value = natureMonth - 1;

            return the;
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;

            event.on(document, 'click', the._onclick.bind(the));
            event.on(the._$input, 'focusin', the.open.bind(the));
        },


        /**
         * 单击
         * @param eve
         * @private
         */
        _onclick: function (eve) {
            var the = this;
            var $target = eve.target;

            if ($target === the._$input || selector.closest($target, '#' + alienClass + '-' + the._id)[0]) {
                return;
            }

            the.close();
        },


        /**
         * 打开日历
         * @public
         */
        open: function () {
            var the = this;
            var options = the._options;
            var pos = {
                top: attribute.top(the._$input) + attribute.outerHeight(the._$input),
                left: attribute.left(the._$input)
            };
            var d = date.parse(the._$input.value);
            var fullyear = d.getFullYear();
            var month = d.getMonth();

            the.selectYear(fullyear);
            the.selectMonth(month + 1);
            the._render(fullyear, month, options);
            pos.display = 'block';
            attribute.css(the._$wrap, pos);
            animation.transition(the._$wrap, {
                opacity: 1
            }, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                the.emit('open');
            });

            return the;
        },


        /**
         * 关闭日历
         * @returns {Datepicker}
         */
        close: function () {
            var the = this;
            var options = the._options;

            animation.transition(the._$wrap, {
                opacity: 0
            }, {
                duration: options.duration,
                easing: options.easing
            }, function () {
                attribute.css(the._$wrap, 'display', 'none');
                the.emit('close');
            });

            return the;
        },


        /**
         * 渲染日历
         * @param year
         * @param month
         * @private
         */
        _render: function (year, month) {
            var the = this;
            var options = the._options;
            var list = calendar.month(year, month, options);
            var data = {
                thead: [],
                tbody: list,
                years: [],
                months: []
            };
            var i = options.firstDayInWeek;
            var j = i + 7;
            var k;

            for (; i < j; i++) {
                k = i % 7;
                data.thead.push(options.lang.weekPrefix + options.lang.weeks[k]);
            }

            for (i = options.range[0], j = options.range[1]; i <= j; i++) {
                data.years.push(i + options.lang.year);
            }

            for (i = 1, j = 13; i < j; i++) {
                data.months.push(i + options.lang.month);
            }

            the._$wrap.innerHTML = tpl.render(data);
        }
    });

    module.exports = Datepicker;
    modification.importStyle(style);
});