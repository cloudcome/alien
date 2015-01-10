/*!
 * 日历
 * @author ydr.me
 * @create 2015-01-10 16:55
 */


define(function (require, exports, module) {
    /**
     * @module util/calendar
     * @requires util/date
     */
    'use strict';

    var date = require('./date.js');



    /**
     * 月历
     * @param year {Number} 年
     * @param month {Number} 月
     * @param [isNatualMonth=false] {Boolean} 是否自然月，默认 false
     * @param [firstDayInWeek=0] {Number} 一周的第一天星期几，默认为0，即星期日
     */
    exports.month = function calendar(year, month, isNatualMonth, firstDayInWeek) {
        month = isNatualMonth ? month - 1 : month;
        firstDayInWeek = firstDayInWeek || 0;

        var list = [];
        var prevDate = new Date(year, month - 1);
        var thisDate = new Date(year, month, 1);
        var thisMonthDays = date.getDaysInMonth(year, month);
        var thisMonthFirstDateDay = thisDate.getDay();
        thisMonthFirstDateDay = thisMonthFirstDateDay < firstDayInWeek ? thisMonthFirstDateDay + 7 : thisMonthFirstDateDay;
        var deltaDays = thisMonthFirstDateDay - firstDayInWeek;
        var prevMonthDays = date.getDaysInMonth(year, month - 1);
        var i = 0;

        // 上月
        for (; i < deltaDays; i++) {
            list.push({
                year: prevDate.getFullYear(),
                month: prevDate.getMonth() + 1,
                date: prevMonthDays - i,
                type: 'prev'
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

        // 分组
        var group = [];

        while (list.length) {
            group.push(list.splice(0, 7));
        }

        return group;
    };

});