/*!
 * date.js
 * @author ydr.me
 * @create 2014-09-28 13:54
 */


define(function (require, exports, module) {
    /**
     * @module util/date
     * @requires util/data
     */
    'use strict';

    var data = require('./data.js');
    var regInvalid = /invalid/i;
    var regSep = /-/g;
    var regChinese = /[\u4e00-\u9fa5]/g;
    var regAPM = /[ap]m/ig;
    var weeks = '日一二三四五六';
    var monthDates = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    module.exports = {
        /**
         * 格式化日志
         * @param {String} format 格式化字符串
         * 假设当前时间为：2014年1月1日 19点9分9秒 周三
         * YYYY 2014
         * YY 14
         * MM 01
         * M 1
         * DD 01
         * D 1
         * HH 19
         * hh 07
         * H 19
         * h 7
         * mm 09
         * m 9
         * ss 09
         * s 9
         * www 星期三
         * ww 周三
         * w 三
         * aaa 下午
         * AA PM
         * aa pm
         * @param {Date|Object|Number|String} [date] 日期
         * @param {Object} [config] 格式配置
         * @returns {null|string}
         */
        format: function (format, date, config) {
            if (data.type(format) !== 'string') {
                throw new Error('date format must string');
            }

            if (data.type(arguments[1]) === 'object') {
                config = arguments[1];
            }

            format = format || 'YYYY-MM-DD HH:mm:ss www';
            date = data.type(date) === 'date' ? date : new Date(date || Date.now());
            date = this.parse(date);
            date = date || new Date();
            config = config || {};

            var Y = String(date.getFullYear());
            var M = String(date.getMonth() + 1);
            var D = String(date.getDate());
            var H = String(date.getHours());
            var h = H > 12 ? H - 12 : H;
            var a = H > 12 ? 0 : 1;
            var m = String(date.getMinutes());
            var s = String(date.getSeconds());
            var w = String(date.getDay());
            var formater = [
                {
                    YYYY: Y
                },
                {
                    YY: Y.slice(-2)
                },
                {
                    MM: _fixNumber(M)
                },
                {
                    M: M
                },
                {
                    DD: _fixNumber(D)
                },
                {
                    D: D
                },
                {
                    HH: _fixNumber(H)
                },
                {
                    H: H
                },
                {
                    hh: _fixNumber(h)
                },
                {
                    h: h
                },
                {
                    mm: _fixNumber(m)
                },
                {
                    m: m
                },
                {
                    ss: _fixNumber(s)
                },
                {
                    s: s
                },
                {
                    www: '星期' + weeks[w]
                },
                {
                    ww: '周' + weeks[w]
                },
                {
                    w: weeks[w]
                },
                {
                    aaa: a ? '上午' : '下午'
                },
                {
                    AA: a ? 'AM' : 'PM'
                },
                {
                    aa: a ? 'am' : 'pm'
                }
            ];

            data.each(formater, function (index, fmt) {
                var key = Object.keys(fmt)[0];
                var val = config[key] || fmt[key];
                var reg = new RegExp(key, 'mg');

                format = format.replace(reg, val);
            });

            return format;
        },
        /**
         * 解析时间
         * @param {String} string 时间字符串
         * @returns {Date|null}
         */
        parse: function (string) {
            var date = new Date(string);

            if (_parseDate(date)) {
                return date;
            }

            string = string.replace(regSep, '/').replace(regChinese, '').replace(regAPM, '');

            return _parseDate(new Date(string));
        },
        /**
         * 是否为闰年
         * @param {Number} year 年份
         * @returns {boolean}
         */
        isLeapYear: function (year) {
            return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
        },
        /**
         * 获得某年某月的天数
         * @param {Number} year 年
         * @param {Number} month 月份，默认序列月，即1月为第0月
         * @param {Boolean} [isNatualMonth] 是否为自然月
         * @returns {Number} 天数
         */
        getDaysInMonth: function (year, month, isNatualMonth) {
            month = isNatualMonth ? month - 1 : month;

            return  month === 1 ? (this.isLeapYear(year) ? 29 : 28) : monthDates[month];
        },
//        /**
//         * 获得某年某月1日星期几
//         * @param {Number} year 年
//         * @param {Number} month 月份，默认序列月，即1月为第0月
//         * @param {Boolean} [isNatualMonth] 是否为自然月
//         * @returns {Number} 星期序号，即周日为0
//         */
//        getMonthFirstDateOfDay: function (year, month, isNatualMonth) {
//            month = isNatualMonth ? month - 1 : month;
//
//            return new Date(year, month, 1).getDay();
//        },
        /**
         * 计算某年某月某日是当年的第几周
         * @param {Number} year 年
         * @param {Number} month 月
         * @param {Number} date 日
         * @param {Boolean} [isNatualMonth] 是否为自然月
         * @returns {number}
         */
        getWeeksInYear: function (year, month, date, isNatualMonth) {
            month = isNatualMonth ? month - 1 : month;

            var pastDate = date + new Date(year, 0, 1).getDay();
            var i = 0;

            for (; i < month; i++) {
                pastDate += this.getDaysInMonth(year, i);
            }

            return Math.ceil(pastDate / 7);
        },
        /**
         * 计算某年某月某日是当月的第几周
         * @param {Number} year 年
         * @param {Number} month 月
         * @param {Number} date 日
         * @param {Boolean} [isNatualMonth] 是否为自然月
         * @returns {number}
         */
        getWeeksInMonth: function (year, month, date, isNatualMonth) {
            month = isNatualMonth ? month - 1 : month;

            var pastDate = date + new Date(year, month, 1).getDay();

            return Math.ceil(pastDate / 7);
        },
        /**
         * 人性化比较时间时间
         * @param {String|Number|Date} date 比较时间
         * @param {String|Number|Date} [date] 被比较时间，默认为当前时间
         * @returns {string}
         */
        from: function (date, compareDate) {
            compareDate = compareDate || new Date();
            compareDate = this.parse(compareDate);

            var old = this.parse(date);
            var oldTime;
            var diff;
            var seconds;
            var minutes;
            var hours;
            var days;
            var months;
            var years;
            var isInFeature;

            if (!old || !compareDate) {
                return '未知';
            }

            oldTime = old.getTime();

            // 小于 1970年1月1日 08:00:00
            if (oldTime <= 0) {
                return '很久之前';
            } else if (oldTime >= Number.MAX_VALUE) {
                return '很久之后';
            }

            diff = compareDate.getTime() - oldTime;
            isInFeature = diff < 0;
            diff = isInFeature ? -diff : diff;
            seconds = Math.floor(diff / 1000);
            minutes = Math.floor(diff / (1000 * 60));
            hours = Math.floor(diff / (1000 * 60 * 60));
            days = Math.floor(diff / (1000 * 60 * 60 * 24));
            years = Math.abs(compareDate.getFullYear() - old.getFullYear());
            months = isInFeature ?
                years * 12 - compareDate.getMonth() + old.getMonth() :
                years * 12 + compareDate.getMonth() - old.getMonth();
            years -= (isInFeature ? 1 : 0);


            // < 10s
            if (seconds < 10) {
                return isInFeature ? '即将' : '刚刚';
            }
            // < 60s
            else if (minutes < 1) {
                return seconds + '秒' + (isInFeature ? '内' : '前');
            }
            // < 1h
            else if (hours < 1) {
                return minutes + '分钟' + (isInFeature ? '内' : '前');
            }
            // < 1d
            else if (days < 1) {
                return hours + '小时' + (minutes % 60 ? minutes % 60 + '分钟' : '') + (isInFeature ? '内' : '前');
            }
            // < 1M
            else if (months < 1) {
                return days + '天' + (isInFeature ? '内' : '前');
            }
            // < 1Y
            else if (years < 1) {
                return months + '个月' + (isInFeature ? '内' : '前');
            }
            // < 100Y
            else if (years < 100) {
                return years + '年' + (isInFeature ? '内' : '前');
            }

            return '很久之' + (isInFeature ? '后' : '前');
        }
    };


    /**
     * 解析为合法的日期
     * @param {Date|Object|String|Number}date
     * @returns {Date|null}
     * @private
     */
    function _parseDate(date) {
        var type = data.type(date);

        if (type !== 'date') {
            date = new Date(date)
        }

        return regInvalid.test(date.toString()) ? null : date;
    }

    /**
     * 修复十进制数字，4 => '04'
     * @param {Number|String} num
     * @returns {Number|string}
     * @private
     */
    function _fixNumber(num) {
        return num < 10 ? '0' + num : num;
    }
});