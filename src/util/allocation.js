/*!
 * 分配器
 * @author ydr.me
 * @create 2015-02-02 15:24
 */


define(function (require, exports, module) {
    /**
     * @module parent/getset
     */
    'use strict';

    var typeis = require('./typeis.js');
    var dato = require('./dato.js');


    /**
     * getset 转换器
     * @param getset {{get: Function, set: Function}} 获取与设置的 Map
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
     *         }
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

        while(i--){
            if(args[i] === undefined){
                argl--;
            }
        }

        // e.g. .html();
        if (argl === 0 && setLength === 1) {
            return getset.get();
        }
        // e.g. .html(html);
        else if (argl === 1 && setLength === 1) {
            getset.set(args[0]);
        }
        // e.g. .css({width: 100});
        // e.g. .css(['width', 'height']);
        // e.g. .css('width');
        else if (argl === 1 && setLength === 2) {
            if (typeis.object(args[0])) {
                dato.each(args[0], function (key, val) {
                    getset.set(key, val);
                });
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
            return getset.set(args[0], args[1]);
        }
    };
});