/*!
 * 分配器
 * @author ydr.me
 * @create 2015-02-02 15:24
 */


define(function (require, exports, module) {
    /**
     * @module utils/allocation
     * @requires utils/typeis
     * @requires utils/dato
     */
    'use strict';

    var typeis = require('./typeis.js');
    var dato = require('./dato.js');
    var noop = function () {
        // ignore
    };


    /**
     * getset 转换器
     * @param getset {{get: Function, set: Function, [onget]: Function, [onset]: Function}} 获取与设置的 Map
     * @param args {Object} 参数
     * @param [setLength=2] 设置行为的参数个数
     * @returns {*}
     *
     * @example
     * var fn = function(key, val){
     *     return allocation.getset({
     *         get: function(key){
     *             return 'get ' + key;
     *         },
     *         set: function(key, val){
     *             console.log('set ' + key + ' = ' + val);
     *         },
     *         // 所有 set 结束之后
     *         onset: function(){}
     *     }, arguments);
     * };
     *
     * fn('a');
     * // => "get a"
     *
     * fn(['a', 'b']);
     * // => {a: "get a", b: "get b"}
     *
     * fn('a', 1);
     * // => set a = 1
     *
     * fn({a: 1, b: 2});
     * // => set a = 1
     * // => set b = 2
     */
    exports.getset = function (getset, args, setLength) {
        setLength = setLength || 2;

        var argl = args.length;
        var ret = {};
        var i = argl;

        while (i--) {
            if (args[i] === undefined) {
                argl--;
            }
        }

        getset.onset = typeis.function(getset.onset) ? getset.onset : noop;

        // e.g. .html();
        if (argl === 0 && setLength === 1) {
            return getset.get();
        }
        // e.g. .html(html);
        else if (argl === 1 && setLength === 1) {
            getset.set(args[0]);
            getset.onset(args[0]);
        }
        // e.g. .css({width: 100});
        // e.g. .css(['width', 'height']);
        // e.g. .css('width');
        else if (argl === 1 && setLength === 2) {
            if (typeis.object(args[0])) {
                dato.each(args[0], function (key, val) {
                    getset.set(key, val);
                });
                getset.onset();
            } else if (typeis.array(args[0])) {
                dato.each(args[0], function (index, key) {
                    ret[key] = getset.get(key);
                });

                return ret;
            } else {
                return getset.get(args[0]);
            }
        }
        // e.g. .css('width', 100);
        else if (argl === 2 && setLength === 2) {
            getset.set(args[0], args[1]);
            getset.onset();
        }
    };


    /**
     * 修正参数传参，参数最末尾的 undefined 参数都将被舍去
     * @param args {Arguments} 参数
     * @returns {Array}
     */
    exports.args = function (args) {
        var argL = args.length;

        while (argL >= 0 && typeis.undefined(args[argL - 1])) {
            argL -= 1;
        }

        return dato.toArray(args).splice(0, argL);
    };
});