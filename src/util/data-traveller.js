/*!
 * data-traveller.js
 * @author ydr.me
 * 2014-09-14 17:26
 */


define(function (require, exports, module) {
    /**
     * @module util/data-traveller
     */

    'use strict';

    var udf;

    module.exports = {
        /**
         * 判断数据类型
         * @param {*} object
         * @returns {string}
         */
        type: function type(object) {
            if (object === window) {
                return 'window';
            } else if (object === document) {
                return 'document';
            } else if (object === udf) {
                return 'undefined';
            } else if (object === null) {
                return 'null';
            } else if (object === null) {
                return 'null';
            }

            var ret = ({}).toString.call(object).match(/\s(.*)\]/)[1].toLowerCase();

            if (/element/.test(ret)) {
                return 'element';
            } else if (isNaN(object) && ret === 'number') {
                return 'nan';
            }

            return ret;
        },
        /**
         * 遍历元素
         * @param {Array/Object}   data  数组
         * @param {Function}       callback  回调，返回false时停止遍历
         * @param {*}              [context] 上下文
         */
        each: function each(data, callback, context) {
            var i;
            var j;
            var dataType = this.type(data);

            // 数组 || 元素集合 || 节点集合
            if (dataType === 'array' || dataType === 'htmlcollection' || dataType === 'nodelist') {
                for (i = 0, j = data.length; i < j; i++) {
                    context = context || data[i];
                    if (callback.call(context, i, data[i]) === false) {
                        break;
                    }
                }
            } else if (data !== null && data !== udf) {
                for (i in data) {
                    if (data.hasOwnProperty(i)) {
                        context = context || data[i];
                        if (callback.call(context, i, data[i]) === false) {
                            break;
                        }
                    }
                }
            }
        },
        /**
         * 扩展静态对象
         * @param {Boolean} 是否深度扩展，可省略，默认false
         * @param {Object}  源对象
         * @param {Object}  目标对象
         * @returns {*}
         */
        extend: function extend(/*arguments*/) {
            var args = arguments;
            var isExtendDeep = typeof(args[0]) === 'boolean' && args[0] === !0;
            var current = isExtendDeep ? 1 : 0;
            var length = args.length;
            var source = args[current];
            var i;
            var obj;

            for (; current < length; current++) {
                obj = args[current];
                for (i in obj) {
                    if (obj.hasOwnProperty(i) && obj[i] !== undefined) {
                        if (typeof(obj[i]) === 'object' && isExtendDeep) {
                            source[i] = extend(isExtendDeep, source, obj[i]);
                        } else {
                            source[i] = obj[i];
                        }
                    }
                }
            }

            return source;
        }
    };
});