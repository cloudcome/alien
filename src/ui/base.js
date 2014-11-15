/*!
 * UI 类创建文件
 * @author ydr.me
 * @create 2014-11-11 20:07
 */


define(function (require, exports, module) {
    /**
     * @module ui/base
     * @requires util/dato
     * @requires util/typeis
     * @requires util/class
     */
    'use strict';

    var dato = require('../util/dato.js');
    var typeis = require('../util/typeis.js');
    var klass = require('../util/class.js');
    var udf;

    /**
     * 创建一个 UI 类
     * @param property {Object}
     * @property property.constructor {Function} 构造函数
     * @property [property.STATIC={}] {Object} 静态属性、方法，可以为空
     * @param [superConstructor=null] {Function} 父类
     * @param [isInheritStatic=false] {Boolean} 是否继承父类的静态方法
     *
     * @example
     * var Dialog = ui({
     *     constructor: fn,
     *     STATIC: {},
     *     myClassName: fn
     * });
     */
    module.exports = function (property, superConstructor, isInheritStatic) {
        if (typeis(property) !== 'object') {
            throw 'UI class property must be an obejct';
        }

        if (typeis(property.constructor) !== 'function') {
            throw 'UI class property.constructor must be a function';
        }

        // 添加默认方法
        if (property.getOptions === udf) {
            property.getOptions = function (key) {
                var the = this;
                var keyType = typeis(key);
                var ret = [];

                if (keyType === 'string' || keyType === 'number') {
                    return the._options && the._options[key];
                } else if (keyType === 'array') {
                    dato.each(key, function (index, k) {
                        ret.push(the._options && the._options[k]);
                    });

                    return ret;
                }
            };
        }

        if (property.setOptions === udf) {
            property.setOptions = function (key, val) {
                var the = this;
                var keyType = typeis(key);

                if (keyType === 'string' || keyType === 'number') {
                    return the._options ? the._options[key] = val : udf;
                } else if (keyType === 'object') {
                    dato.extend(the._options, key);
                }
            };
        }

        return klass.create(property, superConstructor, isInheritStatic);
    };
});