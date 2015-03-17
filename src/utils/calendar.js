/*!
 * 日历
 * @author ydr.me
 * @create 2015-01-10 16:55
 */


define(function (require, exports, module) {
    /**
     * @module utils/calendar
     * @requires utils/date
     * @requires utils/dato
     * @requires utils/typeis
     */

    'use strict';


    var date = require('./date.js');
    var dato = require('./dato.js');
    var typeis = require('./typeis.js');
    var defaults = {
        // 激活的日期
        activeDate: null,
        // 是否为自然月
        isNatualMonth: false,
        // 一周的第一天星期几
        firstDayInWeek: 0
    };


    /**
     * 月历
     * @param year {Number} 年
     * @param month {Number} 月
     * @param [options] {Object} 配置
     * @param [options.activeDate=null] {Date|Number|Array} 高亮的日期，默认为今天
     * @param [options.isNatualMonth=false] {Boolean} 是否为自然月，默认 false
     * @param [options.firstDayInWeek=0] {Number} 一周的第一天星期几，默认为0，即星期日
     * @returns [Array] 月历数组
     */
    exports.month = function calendar(year, month, options) {
        options = dato.extend({}, defaults, options);
        month = options.isNatualMonth ? month - 1 : month;
        options.activeDate = typeis.array(options.activeDate) ? options.activeDate : [options.activeDate];

        var list = [];
        var prevDate = new Date(year, month - 1);
        var thisDate = new Date(year, month, 1);
        var thisMonthDays = date.getDaysInMonth(year, month);
        var thisMonthFirstDateDay = thisDate.getDay();
        thisMonthFirstDateDay = thisMonthFirstDateDay < options.firstDayInWeek ? thisMonthFirstDateDay + 7 : thisMonthFirstDateDay;
        var deltaDays = thisMonthFirstDateDay - options.firstDayInWeek;
        var prevMonthDays = date.getDaysInMonth(year, month - 1);
        var i = 0;

        // 上月
        for (; i < deltaDays; i++) {
            list.push({
                year: prevDate.getFullYear(),
                month: prevDate.getMonth() + 1,
                date: prevMonthDays - i,
                type: i
            });
        }

        list.reverse();

        // 本月
        for (i = 1; i <= thisMonthDays; i++) {
            list.push({
                year: thisDate.getFullYear(),
                month: thisDate.getMonth() + 1,
                date: i,
                type: 'this'
            });
        }

        deltaDays = list.length % 7;

        // 下月
        if (deltaDays) {
            var nextDate = new Date(year, month + 1);

            for (i = 1; i <= 7 - deltaDays; i++) {
                list.push({
                    year: nextDate.getFullYear(),
                    month: nextDate.getMonth() + 1,
                    date: i,
                    type: 'next'
                });
            }
        }


        var activeDateMap = [];
        options.activeDate.forEach(function (d) {
            d = date.parse(d);

            var id = _buildDateid({
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                date: d.getDate()
            });

            activeDateMap[id] = 1;
        });

        list.forEach(function (item) {
            item.id = _buildDateid(item);
            item.active = !!activeDateMap[item.id];
        });

        // 分组
        var group = [];

        while (list.length) {
            group.push(list.splice(0, 7));
        }

        return group;
    };


    /**
     * 生成日期ID
     * @param item {Object} 日对象
     * @private
     */
    function _buildDateid(item) {
        return [item.year, dato.fillString(item.month, 2), dato.fillString(item.date, 2)].join('') * 1;
    }

});