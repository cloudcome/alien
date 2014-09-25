/*!
 * data-traveller.js
 * @author ydr.me
 * 2014-09-14 17:26
 */


define(function (require, exports, module) {
    /**
     * @module util/data
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
            var likeArray = this.toArray(data);

            // 数组 或 类似数组
            if (likeArray.length) {
                for (i = 0, j = likeArray.length; i < j; i++) {
                    context = context || likeArray[i];
                    if (callback.call(context, i, likeArray[i]) === false) {
                        break;
                    }
                }
            }
            // 纯对象
            else if (data !== null && data !== udf) {
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
         * @param {Boolean|Object} [isExtendDeep] 是否深度扩展，可省略，默认false
         * @param {Object}  [source] 源对象
         * @param {Object}  [target] 目标对象，可以是多个
         * @returns {*}
         */
        extend: function extend(isExtendDeep, source, target) {
            var args = arguments;
            var isExtendDeep = typeof(args[0]) === 'boolean' && args[0] === !0;
            var current = isExtendDeep ? 1 : 0;
            var length = args.length;
            var source = args[current++];
            var i;
            var obj;
            var type;

            for (; current < length; current++) {
                obj = args[current];
                for (i in obj) {
                    if (obj.hasOwnProperty(i) && obj[i] !== undefined) {
                        type = this.type(obj[i]);
                        if (type === 'object' && isExtendDeep) {
                            source[i] = {};
                            extend.call(this, isExtendDeep, source[i], obj[i]);
                        } else if (type === 'array' && isExtendDeep) {
                            source[i] = [];
                            extend.call(this, isExtendDeep, source[i], obj[i]);
                        } else {
                            source[i] = obj[i];
                        }
                    }
                }
            }

            return source;
        },
        /**
         * 转换对象为一个纯数组，只要对象有length属性即可
         * @param {Object} [data] 对象
         * @param {Boolean} [isConvertWhole] 是否转换整个对象为数组中的第0个元素，当该对象无length属性时，默认false
         * @returns {Array}
         */
        toArray: function toArray(data, isConvertWhole) {
            var ret = [];
            var i = 0;
            var j;

            if (data && 'length' in data && this.type(data.length) === 'number' && data.length >= 0) {
                for (j = data.length; i < j; i++) {
                    ret.push(data[i]);
                }
            } else if (data && isConvertWhole) {
                ret.push(data);
            }

            return ret;
        }
    };
});