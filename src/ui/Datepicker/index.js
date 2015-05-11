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
    var templateWrap = require('./wrap.html', 'html');
    var templateList = require('./list.html', 'html');
    var templateToolbar = require('./toolbar.html', 'html');
    var style = require('./style.css', 'css');
    var tplWrap = new Template(templateWrap);
    var tplList = new Template(templateList);
    var tplToolbar = new Template(templateToolbar);
    var alienClass = 'alien-ui-datepicker';
    var alienIndex = 0;
    var $body = document.body;
    var now = new Date();
    var defaults = {
        format: 'YYYY-MM-DD',
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
            the._current = {};
            the._choose = {};
            the._initNode();
            the._initEvent();
        },


        /**
         * 渲染节点
         * @private
         */
        _initNode: function () {
            var the = this;

            modification.insert(tplWrap.render({
                id: the._id
            }), $body, 'beforeend');

            var $wrap = selector.query('#' + alienClass + '-' + the._id)[0];
            var nodes = selector.query('.j-flag', $wrap);

            the._$toolbar = nodes[0];
            the._$list = nodes[1];
            the._$wrap = $wrap;
            the._renderToolbar();
        },


        _renderToolbar: function () {
            var the = this;
            var options = the._options;
            var data = {
                years: [],
                months: []
            };
            var i;
            var j;

            for (i = options.range[0], j = options.range[1]; i <= j; i++) {
                data.years.push({
                    value: i,
                    text: i + options.lang.year
                });
            }

            for (i = 1, j = 13; i < j; i++) {
                data.months.push({
                    value: i - 1,
                    text: i + options.lang.month
                });
            }

            the._$toolbar.innerHTML = tplToolbar.render(data);

            var nodes = selector.query('.j-flag', the._$toolbar);

            the._$year = nodes[0];
            the._$month = nodes[1];
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
            var options = the._options;

            event.on(document, 'click', the._onclick.bind(the));
            event.on(the._$input, 'focusin', the.open.bind(the));
            event.on(the._$year, 'change', the._onchangeyear = function () {
                the._current.year = this.value;
                the._renderList();
            });
            event.on(the._$month, 'change', the._onchangemonth = function () {
                the._current.month = this.value;
                the._renderList();
            });
            event.on(the._$list, 'click', 'td', the._onchoose = function () {
                var year = attribute.data(this, 'year');
                var month = attribute.data(this, 'month');

                if (year < options.range[0] || year > options.range[1]) {
                    return;
                }

                the._choose.year = year;
                the._choose.month = month;
                the._choose.date = attribute.data(this, 'date');

                var d = new Date(the._choose.year, the._choose.month, the._choose.date);

                the._$input.value = date.format(options.format, d);
                attribute.removeClass(selector.query('td', the._$list), alienClass + '-active');
                attribute.addClass(this, alienClass + '-active');
                the.close();
            });
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
            var value = the._$input.value;
            var d = date.parse(value);
            var year = d.getFullYear();
            var month = d.getMonth();

            if (value) {
                the._choose.year = year;
                the._choose.month = month;
                the._choose.date = d.getDate();
            }

            if (the._current.year !== year || the._current.month !== month) {
                the._current.year = year;
                the._current.month = month;
                the.selectYear(the._current.year);
                the.selectMonth(the._current.month + 1);
                the._renderList();
            }

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
         * @private
         */
        _renderList: function () {
            var the = this;
            var options = the._options;
            var list = calendar.month(the._current.year, the._current.month, dato.extend({}, options, {
                activeDate: the._choose.year ? new Date(the._choose.year, the._choose.month, the._choose.date) : null
            }));
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

            the._$list.innerHTML = tplList.render(data);
        },


        /**
         * 销毁实例
         */
        destroy: function () {


        }
    });

    module.exports = Datepicker;
    modification.importStyle(style);
});