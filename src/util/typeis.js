/*!
 * 判断数据类型
 * @author ydr.me
 * @create 2014-11-15 12:54
 */


define(function (require, exports, module) {
    /**
     * @module util/typeis
     */
    'use strict';

    var udf = 'undefined';

    /**
     * 判断数据类型，结果全部为小写<br>
     * 原始数据类型：boolean、number、string、undefined、symbol
     * @param {*} object 任何对象
     * @returns {string}
     *
     * @example
     * typeis();
     * // => "undefined"
     *
     * typeis(null);
     * // => "null"
     *
     * typeis(1);
     * // => "number"
     *
     * typeis("1");
     * // => "string"
     *
     * typeis(!1);
     * // => "boolean"
     *
     * typeis({});
     * // => "object"
     *
     * typeis([]);
     * // => "array"
     *
     * typeis(/./);
     * // => "regexp"
     *
     * typeis(window);
     * // => "window"
     *
     * typeis(document);
     * // => "document"
     *
     * typeis(document);
     * // => "document"
     *
     * typeis(NaN);
     * // => "nan"
     *
     * typeis(Infinity);
     * // => "number"
     *
     * typeis(function(){});
     * // => "function"
     *
     * typeis(new Image);
     * // => "element"
     *
     * typeis(new Date);
     * // => "date"
     *
     * typeis(document.links);
     * // => "htmlcollection"
     *
     * typeis(document.body.dataset);
     * // => "domstringmap"
     *
     * typeis(document.body.classList);
     * // => "domtokenlist"
     *
     * typeis(document.body.childNodes);
     * // => "nodelist"
     *
     * typeis(document.createAttribute('abc'));
     * // => "attr"
     *
     * typeis(document.createComment('abc'));
     * // => "comment"
     *
     * typeis(new Event('abc'));
     * // => "event"
     *
     * typeis(document.createExpression());
     * // => "xpathexpression"
     *
     * typeis(document.createRange());
     * // => "range"
     *
     * typeis(document.createTextNode(''));
     * // => "text"
     */
    var typeis = function (object) {
        if (typeof object === udf) {
            return udf;
        } else if (typeof window !== udf && object === window) {
            return 'window';
        } else if (typeof global !== udf && object === global) {
            return 'global';
        } else if (typeof document !== udf && object === document) {
            return 'document';
        } else if (object === null) {
            return 'null';
        }

        var ret = Object.prototype.toString.call(object).slice(8, -1).toLowerCase();

        if (/element/.test(ret)) {
            return 'element';
        } else if (isNaN(object) && ret === 'number') {
            return 'nan';
        }

        return ret;
    };
    //var i = 0;
    //var jud = 'String Number Function Object Undefined Null Nan Element Regexp Boolean Array Window Document Global'.split(' ');
    //var makeStatic = function (tp) {
    //    type['is' + tp] = function (obj) {
    //        return typeis(obj) === tp.toLowerCase();
    //    };
    //};
    //
    //
    //
    //for (; i < jud.length; i++) {
    //    makeStatic(jud[i]);
    //}


    /**
     * 判断是否为纯对象
     * @param obj {*}
     * @returns {Boolean}
     *
     * @example
     * type.isPlainObject({a:1});
     * // => true
     */
    typeis.plainObject = function (obj) {
        return this.isObject(obj) && Object.getPrototypeOf(obj) === Object.prototype;
    };


    /**
     * 判断是否为空对象
     * @param obj {*}
     */
    typeis.emptyObject = function (obj) {
        return this.isObject(obj) && this.isPlainObject(obj) && Object.keys(obj).length === 0;
    };

    module.exports = typeis;
});