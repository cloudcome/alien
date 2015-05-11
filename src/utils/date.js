/*!
 * date.js
 * @author ydr.me
 * @create 2014-09-28 13:54
 */


define(function (require, exports, module) {
    /**
     * @module utils/date
     * @requires utils/allocation
     * @requires utils/dato
     * @requires utils/number
     * @requires utils/string
     * @requires utils/typeis
     */

    'use strict';

    var allocation = require('./allocation.js');
    var dato = require('./dato.js');
    var number = require('./number.js');
    var string = require('./string.js');
    var typeis = require('./typeis.js');
    var weeks = '日一二三四五六';
    var monthDates = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var REG_RANGE = /^(this|in)\s+?(?:(\d+)\s+?)?(day|week|month|year)s?$/i;
    var dateFormDefaults = {
        // 是否在小时内显示分钟，默认false，即：6小时前；若未true，即：6小时20分钟前
        minutesInHour: false
    };

    /**
     * 格式化日期<br>
     * 主要参考ECMA规范定义：YYYY-MM-DDTHH:mm:ss.sssZ<br>
     * 其他参数参考自moment<br>
     *
     * @param {String} format 格式化字符串<br>
     * 假设当前时间为：2014年1月1日 19点9分9秒9毫秒 周三<br>
     * <strong>日期</strong><br>
     * 至少4位年份<code>YYYY</code> 2014<br>
     * 至少2位年份<code>YY</code> 14<br>
     * 至少2位月份<code>MM</code> 01<br>
     * 至少1位月份<code>M</code> 1<br>
     * 至少2位日期<code>DD</code> 01<br>
     * 至少1位日期<code>D</code> 1<br>
     *
     * <strong>时间</strong><br>
     * 至少2位24小时制小时<code>HH</code> 19<br>
     * 至少1位24小时制小时<code>H</code> 19<br>
     * 至少2位12小时制小时<code>hh</code> 07<br>
     * 至少1位12小时制小时<code>h</code> 7<br>
     * 至少2位分钟数<code>mm</code> 09<br>
     * 至少1位分钟数<code>m</code> 9<br>
     * 至少2位秒数<code>ss</code> 09<br>
     * 至少1位秒数<code>s</code> 9<br>
     * 至少3位毫秒数<code>SSS</code> 009<br>
     * 至少2位毫秒数<code>SS</code> 09<br>
     * 至少1位毫秒数<code>S</code> 9<br>
     *
     * <strong>时段</strong><br>
     * 星期<code>e</code> 三<br>
     * 上下午<code>a</code> 下午<br>
     *
     * @param {Date|Object|Number|String} [date] 日期
     * @param {Object} [config] 格式配置
     * @returns {null|string}
     *
     * @example
     * // 默认的格式化
     * date.format('YYYY年MM月DD日 HH:mm:ss.SSS 星期e a');
     * // => "2014 年"
     * date.format('YYYY 年');
     * // => "2014 年"
     *
     * // 自定义格式化
     * var month = {
         *    "01": "January",
         *    "02": "February",
         *    "03": "March",
         *    "04": "April",
         *    "05": "May",
         *    "06": "June",
         *    "07": "July",
         *    "08": "August",
         *    "09": "September",
         *    "10": "October",
         *    "11": "November",
         *    "12": "December",
         * };
     * date.format('YYYY年MM月DD日 HH:mm:ss.SSS 星期e a', {
         *    // 要替换的字段，以及要替换的值
         *    'MM': month
         * });
     * // => "2014年October月04日 17:28:06.363 星期六 下午"
     */
    exports.format = function (format, date, config) {
        if (typeis(format) !== 'string') {
            throw new Error('date format must be a string');
        }

        var args = allocation.args(arguments);

        if (typeis(arguments[1]) === 'object') {
            config = args[1];
            date = new Date();
        }

        format = format || 'YYYY-MM-DD HH:mm:ss www';
        date = exports.parse(date);
        config = config || {};

        var Y = String(date.getFullYear());
        var M = String(date.getMonth() + 1);
        var D = String(date.getDate());
        var H = String(date.getHours());
        var h = H > 12 ? H - 12 : H;
        var a = H > 12 ? 0 : 1;
        var m = String(date.getMinutes());
        var s = String(date.getSeconds());
        var S = String(date.getMilliseconds());
        var e = String(date.getDay());
        var formater = [
            {
                key: 'YYYY',
                val: Y,
                is: 'Y'
            },
            {
                key: 'YY',
                val: Y.slice(-2),
                is: 'Y'
            },
            {
                key: 'MM',
                val: string.padLeft(M, 2, '0'),
                is: 'M'
            },
            {
                key: 'M',
                val: M,
                is: 'M'
            },
            {
                key: 'DD',
                val: string.padLeft(D, 2, '0'),
                is: 'D'
            },
            {
                key: 'D',
                val: D,
                is: 'D'
            },
            {
                key: 'HH',
                val: string.padLeft(H, 2, '0'),
                is: 'H'
            },
            {
                key: 'H',
                val: H,
                is: 'H'
            },
            {
                key: 'hh',
                val: string.padLeft(h, 2, '0'),
                is: 'h'
            },
            {
                key: 'h',
                val: h,
                is: 'h'
            },
            {
                key: 'mm',
                val: string.padLeft(m, 2, '0'),
                is: 'm'
            },
            {
                key: 'm',
                val: m,
                is: 'm'
            },
            {
                key: 'ss',
                val: string.padLeft(s, 2, '0'),
                is: 's'
            },
            {
                key: 's',
                val: s,
                is: 's'
            },
            {
                key: 'SSS',
                val: string.padLeft(S, 3, '0'),
                is: 'S'
            },
            {
                key: 'SS',
                val: string.padLeft(S, 2, '0'),
                is: 'S'
            },
            {
                key: 'S',
                val: S,
                is: 'S'
            },
            {
                key: 'e',
                val: weeks[e],
                is: 'e'
            },
            {
                key: 'a',
                val: a ? '上午' : '下午',
                is: 'a'
            }
        ];
        var hasFormat = {};
        var configFormater = [];

        // 年、月、日、时、分、秒、毫秒、星期、上下午
        // 只保证每个字段只被格式化一次，防止误操作
        dato.each(formater, function (index, fmt) {
            var reg = new RegExp(fmt.key, 'mg');

            if (!hasFormat[fmt.is]) {
                if (config[fmt.key]) {
                    hasFormat[fmt.is] = !0;
                    configFormater.push({
                        key: fmt.key,
                        val: config[fmt.key][fmt.val],
                        is: fmt.is
                    });
                } else {
                    if (reg.test(format)) {
                        hasFormat[fmt.is] = !0;
                        format = format.replace(reg, fmt.val);
                    }
                }
            }
        });

        // 自定义格式化
        dato.each(configFormater, function (index, fmt) {
            var reg = new RegExp(fmt.key, 'mg');
            format = format.replace(reg, fmt.val);
        });

        return format;
    };


    /**
     * 解析时间
     * @param {String|Date} string 时间字符串
     * @param {Date} [dftDate] 如果前置时间不合法，默认时间，默认为现在
     * @returns {Date}
     *
     * @example
     * date.parse('12/21/2014 12:21:22');
     * // => Sun Dec 21 2014 12:21:22 GMT+0800 (CST)
     */
    exports.parse = function (string, dftDate) {
        var date;

        dftDate = dftDate || new Date();

        switch (typeis(string)) {
            case 'string':
            case 'number':
                date = string;
                break;

            case 'date':
                return string;

            default :
                return dftDate;
        }

        return typeis.validDate(date) ? new Date(date) : dftDate;
    };


    /**
     * 是否为闰年
     * @param {Number} year 年份
     * @returns {boolean}
     *
     * @example
     * date.isLeapYear(2014);
     * // => false
     */
    exports.isLeapYear = function (year) {
        return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
    };


    /**
     * 获得某年某月的天数
     * @param {Number} year 年
     * @param {Number} month 月份，默认序列月，即1月为第0月
     * @param {Boolean} [isNatualMonth=false] 是否为自然月，默认为 false
     * @returns {Number} 天数
     *
     * @example
     * // 获得10月份的天数
     * date.getDaysInMonth(2014, 9);
     * // => 31
     */
    exports.getDaysInMonth = function (year, month, isNatualMonth) {
        month = isNatualMonth ? month - 1 : month;
        month = new Date(year, month).getMonth();

        return month === 1 ? (exports.isLeapYear(year) ? 29 : 28) : monthDates[month];
    };


    /**
     * 获得某年某月某日在当年的第几天
     * @param {Number} year 年份
     * @param {Number} month 默认序列月
     * @param {Number} date 日期
     * @param {Boolean} [isNatualMonth=false] 是否自然月，默认 false
     * @returns {Number}
     */
    exports.getDaysInYear = function (year, month, date, isNatualMonth) {
        month = isNatualMonth ? month - 1 : month;

        var days = date;

        while (month--) {
            days += exports.getDaysInMonth(year, month);
        }

        return days;
    };


    /**
     * 计算某年某月某日是当年的第几周
     * @param {Number} year 年
     * @param {Number} month 月
     * @param {Number} date 日
     * @param {Boolean} [isNatualMonth] 是否为自然月
     * @returns {number}
     *
     * @example
     * // 判断2014年10月24日是今年的第几周
     * date.getWeeksInYear(2014, 9, 24);
     * // => 43
     */
    exports.getWeeksInYear = function (year, month, date, isNatualMonth) {
        month = isNatualMonth ? month - 1 : month;

        var pastDate = date + new Date(year, 0, 1).getDay();
        var i = 0;

        for (; i < month; i++) {
            pastDate += exports.getDaysInMonth(year, i);
        }

        return Math.ceil(pastDate / 7);
    };


    /**
     * 计算某年某月某日是当月的第几周
     * @param {Number} year 年
     * @param {Number} month 月
     * @param {Number} date 日
     * @param {Boolean} [isNatualMonth=false] 是否为自然月
     * @returns {number}
     *
     * @example
     * // 判断2014年10月24日是当月的第几周
     * date.getWeeksInMonth(2014, 9, 24);
     * // => 4
     */
    exports.getWeeksInMonth = function (year, month, date, isNatualMonth) {
        month = isNatualMonth ? month - 1 : month;

        var pastDate = date + new Date(year, month, 1).getDay();

        return Math.ceil(pastDate / 7);
    };


    /**
     * 人性化比较时间时间
     * @param {String|Number|Date} date 比较时间
     * @param {String|Number|Date|Object} [compareDate] 被比较时间，默认为当前时间
     * @param {Object} [options] 配置
     * @param {Object} [options.minutesInHour=true] 是否在小时内显示分钟，默认true，即：6小时20分钟前，若为false，即：6小时前
     * @returns {string}
     *
     * @example
     * // 过去时间
     * date.from(Date.now() - 1);
     * // => "刚刚"
     * date.from(Date.now() - 10*1000);
     * // => "10秒前"
     * date.from(Date.now() - 61*1000);
     * // => "1分钟前"
     * date.from(Date.now() - 60*60*1000);
     * // => "1小时前"
     * date.from(Date.now() - 24*60*60*1000);
     * // => "1天前"
     * date.from(Date.now() - 30*24*60*60*1000);
     * // => "1个月前"
     * date.from(Date.now() - 12*30*24*60*60*1000);
     * // => "1年前"
     * date.from(Date.now() - 20*12*30*24*60*60*1000);
     * // => "19年前"
     * date.from(Date.now() - 100*12*30*24*60*60*1000);
     * // => "很久之前"
     *
     * // 将来时间
     * date.from(Date.now() + 1);
     * // => "即将"
     * date.from(Date.now() + 10*1000);
     * // => "10秒后"
     * date.from(Date.now() + 61*1000);
     * // => "1分钟后"
     * date.from(Date.now() + 60*60*1000);
     * // => "1小时后"
     * date.from(Date.now() + 24*60*60*1000);
     * // => "1天后"
     * date.from(Date.now() + 30*24*60*60*1000);
     * // => "1个月后"
     * date.from(Date.now() + 12*30*24*60*60*1000);
     * // => "11个月后"
     * date.from(Date.now() + 20*12*30*24*60*60*1000);
     * // => "19年后"
     * date.from(Date.now() + 100*12*30*24*60*60*1000);
     * // => "98年后"
     * date.from(Date.now() + 200*12*30*24*60*60*1000);
     * // => "很久之后"
     */
    exports.from = function (date, compareDate, options) {
        var args = arguments;
        var argL = args.length;

        // date.from(date, options)
        if (argL === 2 && typeis.object(args[1])) {
            options = args[1];
            compareDate = null;
        }

        options = dato.extend({}, dateFormDefaults, options);
        compareDate = compareDate || new Date();
        compareDate = exports.parse(compareDate);

        var old = exports.parse(date);
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

        var suffix = isInFeature ? '后' : '前';

        // < 10s
        if (seconds < 10) {
            return isInFeature ? '即将' : '刚刚';
        }
        // < 60s
        else if (minutes < 1) {
            return seconds + '秒' + suffix;
        }
        // < 1h
        else if (hours < 1) {
            return minutes + '分钟' + suffix;
        }
        // < 1D
        else if (days < 1) {
            var pastMinutes = options.minutesInHour ? minutes % 60 : '';
            return hours + '小时' + (pastMinutes ? pastMinutes + '分钟' : '') + suffix;
        }
        // < 30D
        else if (days < 30) {
            return days + '天' + suffix;
        }
        // < 12M
        else if (months < 12) {
            return months + '个月' + suffix;
        }
        // < 100Y
        else if (years < 100) {
            return years + '年' + suffix;
        }

        return '很久之' + suffix;
    };


    /**
     * 计算日期范围
     * @param range {String} 范围，可选
     * `this N days`/`this N weeks`/`this N months`/`this N years` 当日/周/月/年
     * `in Ndays`/`in N weeks`/`in N months`/`in N years` 几日/周/月/年内
     * @param [ref] {Date} 起点时间，默认为当前时间
     * @returns {{from: Date, to: Date}}
     *
     * @example
     * // this
     * date.range('this 1 day');
     * // 本周日 - 本周一
     * date.range('this 1 week');
     * // 本月一 - 本月末
     * date.range('this 1 month');
     * // 本年头 - 本年尾
     * date.range('this 1 year');
     *
     * // in
     * date.range('in 1 day');
     * // 今天 - 一周内
     * date.range('in 1 week');
     * // 今天 - 下个月今天
     * date.range('in 1 month');
     * // 今天 - 明年今天
     * date.range('in 1 year');
     */
    exports.range = function (range, ref) {
        range = String(range).toLowerCase();

        var temp = range.match(REG_RANGE);

        if (!temp) {
            throw new Error('date range error');
        }

        var type = temp[1];
        var value = number.parseInt(temp[2] || 1);
        var scope = temp[3];
        var oneDayMilliseconds = 1 * 24 * 60 * 60 * 1000;
        var from = exports.parse(ref);
        var thisYear = from.getFullYear();
        var thisMonth = from.getMonth();
        var thisDate = from.getDate();
        var thisDay = from.getDay();

        // 今日 00:00:00:000
        from.setHours(0);
        from.setMinutes(0);
        from.setSeconds(0);
        from.setMilliseconds(0);
        // 昨日 23:59:59:999
        var to = new Date(from.getTime() - 1);

        switch (type) {
            case 'this':
                switch (scope) {
                    case 'day':
                        to.setDate(thisDate + value - 1);
                        break;

                    case 'week':
                        from.setDate(thisDate + (0 - thisDay));
                        to.setDate(thisDate + (6 - thisDay) + (value - 1) * 7);
                        break;

                    case 'month':
                        from.setDate(1);
                        to.setMonth(thisMonth + value, 1);
                        to = new Date(to.getTime() - oneDayMilliseconds);
                        break;

                    case 'year':
                        from.setMonth(0);
                        from.setDate(1);
                        to.setFullYear(thisYear + value - 1);
                        to.setMonth(12, 1);
                        to = new Date(to.getTime() - oneDayMilliseconds);
                        break;
                }
                break;

            case 'in':
                switch (scope) {
                    case 'day':
                        to.setDate(thisDate + value - 1);
                        break;

                    case 'week':
                        to.setDate(thisDate + value * 7);
                        break;

                    case 'month':
                        to.setMonth(thisMonth + value, thisDate);
                        to = new Date(to.getTime() - oneDayMilliseconds);
                        break;

                    case 'year':
                        to.setFullYear(thisYear + value, thisMonth, thisDate);
                        to = new Date(to.getTime() - oneDayMilliseconds);
                        break;
                }
                break;
        }

        return {
            from: from,
            to: to
        };
    };


    /**
     * 输出 ISO date string
     * @param [date] {Date} 日期
     * @returns {string}
     */
    exports.iso = function (date) {
        date = exports.parse(date);
        return string.padLeft(date.getUTCFullYear(), 4, '0') + '-' +
            string.padLeft(date.getUTCMonth() + 1, 2, '0') + '-' +
            string.padLeft(date.getUTCDate(), 2, '0') + 'T' +
            string.padLeft(date.getUTCHours(), 2, '0') + ':' +
            string.padLeft(date.getUTCMinutes(), 2, '0') + ':' +
            string.padLeft(date.getUTCSeconds(), 2, '0') + '.' +
            string.padLeft(date.getUTCMilliseconds(), 2, '0') + 'Z';
    };
});