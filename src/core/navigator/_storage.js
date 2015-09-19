/*!
 * 本地存储
 * @author ydr.me
 * @create 2015-02-02 15:17
 */


define(function (require, exports, module) {
    /**
     * @module core/navigator/storage
     * @requires utils/allocation
     * @requires utils/dato
     */
    'use strict';

    var allocation = require('./../../utils/allocation.js');
    var typeis = require('./../../utils/typeis.js');
    var dato = require('./../../utils/dato.js');

    module.exports = function (storage, exports) {
        var gs = function (isJSON) {
            var args = allocation.args(arguments);

            args.shift();
            return allocation.getset({
                get: function (key) {
                    var ret = null;

                    try {
                        ret = storage.getItem(key);
                    } catch (err) {
                        // ignore
                    }

                    if (!isJSON) {
                        return ret;
                    }

                    try {
                        ret = JSON.parse(ret);
                    } catch (err) {
                        ret = {};
                    }

                    if (isJSON) {
                        ret = typeis.object(ret) || typeis.array(ret) ? ret : {};
                    }

                    return ret;
                },
                set: function (key, val) {
                    if (isJSON && (typeis.object(val) || typeis.array(val))) {
                        try {
                            val = JSON.stringify(val);
                        } catch (err) {
                            val = '';
                        }
                    }

                    try {
                        storage.setItem(key, val);
                    } catch (err) {
                        // ignore
                    }
                }
            }, args);
        };

        /**
         * 获取本地存储值
         * @param key {String|Number|Array} 键或者键数组
         */
        exports.get = function (key/*arguments*/) {
            var args = allocation.args(arguments);

            key = args.length > 1 ? dato.toArray(args) : key;

            return gs(false, key);
        };


        /**
         * 获取本地存储值
         * @param key {String|Number|Array} 键或者键数组
         */
        exports.getJSON = function (key/*arguments*/) {
            var args = allocation.args(arguments);

            key = args.length > 1 ? dato.toArray(args) : key;

            return gs(true, key);
        };


        /**
         * 设置本地存储值
         * @param key {String|Number|Object} 键或者键值对
         * @param [val] {String} 值
         */
        exports.set = function (key, val) {
            var args = allocation.args(arguments);

            args.unshift(false);
            gs.apply(window, args);
        };


        /**
         * 设置本地存储值
         * @param key {String|Number|Object} 键或者键值对
         * @param [val] {String} 值
         */
        exports.setJSON = function (key, val) {
            var args = allocation.args(arguments);

            args.unshift(true);
            gs.apply(window, args);
        };


        /**
         * 本地存储长度
         * @returns {number}
         */
        exports.size = function () {
            return storage.length;
        };


        /**
         * 移除本地存储
         * @param [key] {String|Number|Array} 键或者键数组
         */
        exports.remove = function (key) {
            if (key === undefined) {
                return storage.clear();
            }

            key = typeis.array(key) ? key : [key];

            key.forEach(function (ik) {
                storage.removeItem(ik);
            });
        };
    };
});