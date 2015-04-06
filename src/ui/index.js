/*!
 * UI 类基础
 * @author ydr.me
 * @create 2014-11-11 20:07
 */


define(function (require, exports, module) {
    /**
     * @module ui/
     * @requires utils/dato
     * @requires utils/typeis
     * @requires utils/class
     * @requires libs/Emitter
     */
    'use strict';

    var dato = require('../utils/dato.js');
    var typeis = require('../utils/typeis.js');
    var klass = require('../utils/class.js');
    var Emitter = require('../libs/Emitter.js');
    var udf;
    var warningPropertyList = 'emit on un _eventsPool _eventsLimit'.split(' ');
    var zIndex = 999;


    /**
     * 获取 zIndex
     * @returns {number}
     */
    exports.getZindex = function () {
        return zIndex++;
    };


    /**
     * 创建一个 UI 类
     * @param constructor {Function} 构造函数
     * @param [isInheritSuperStatic=false] {Boolean} 是否继承父类的静态方法
     *
     * @example
     * var Dialog = ui.create(fn);
     */
    exports.create = function (constructor, isInheritSuperStatic) {
        if (typeis(constructor) !== 'function') {
            throw 'UI class constructor must be a function';
        }

        var UI = klass.create(constructor, Emitter, isInheritSuperStatic);

        // 添加默认方法
        if (UI.fn.getOptions === udf) {
            UI.fn.getOptions = function (key) {
                var the = this;
                var keyType = typeis(key);
                var ret = [];

                /**
                 * 获取 ui 配置
                 * @event getoptions
                 */
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

        if (UI.fn.setOptions === udf) {
            UI.fn.setOptions = function (key, val) {
                var the = this;
                var keyType = typeis(key);

                if (keyType === 'string' || keyType === 'number') {
                    the._options ? the._options[key] = val : udf;
                } else if (keyType === 'object') {
                    dato.extend(true, the._options, key);
                }

                /**
                 * 设置 ui 配置
                 * @event setoptions
                 */
                the.emit('setoptions', the._options);
            };
        }

        return UI;
    };
});