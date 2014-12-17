/*!
 * UI 类生成器
 * @author ydr.me
 * @create 2014-11-11 20:07
 */


define(function (require, exports, module) {
    /**
     * @module ui/generator
     * @requires util/dato
     * @requires util/typeis
     * @requires util/class
     * @requires libs/Emitter
     */
    'use strict';

    var dato = require('../util/dato.js');
    var typeis = require('../util/typeis.js');
    var klass = require('../util/class.js');
    var Emitter = require('../libs/Emitter.js');
    var udf;
    var warningPropertyList = 'emit on un _eventsPool _eventsLimit'.split(' ');

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
    module.exports = function (property, isInheritSuperStatic) {
        var proto = {};

        if (typeis(property) !== 'object') {
            throw 'UI class property must be an obejct';
        }

        if (typeis(property.constructor) !== 'function') {
            throw 'UI class property.constructor must be a function';
        }

        dato.each(property, function (key, val) {
            proto[key] = val;

            if (warningPropertyList.indexOf(key) > -1) {
                console.warn(property.constructor.toString() + ' rewrite Emitter\' property in prototype of `' + key + '`');
            }
        });

        proto.constructor = function () {
            Emitter.apply(this, arguments);
            property.constructor.apply(this, arguments);
        };

        // 添加默认方法
        if (property.getOptions === udf) {
            proto.getOptions = function (key) {
                var the = this;
                var keyType = typeis(key);
                var ret = [];

                the.emit('getoptions');
                if (keyType === 'string' || keyType === 'number') {
                    return the._options && the._options[key];
                } else if (keyType === 'array') {
                    dato.each(key, function (index, k) {
                        ret.push(the._options && the._options[k]);
                    });

                    return ret;
                } else {
                    return the._options;
                }
            };
        }

        if (property.setOptions === udf) {
            proto.setOptions = function (key, val) {
                var the = this;
                var keyType = typeis(key);

                if (keyType === 'string' || keyType === 'number') {
                    the._options ? the._options[key] = val : udf;
                } else if (keyType === 'object') {
                    dato.extend(the._options, key);
                }

                the.emit('setoptions', the._options);
            };
        }

        return klass.create(proto, Emitter, isInheritSuperStatic);
    };
});