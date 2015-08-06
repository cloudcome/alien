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
     * @requires libs/emitter
     */
    'use strict';

    var dato = require('../utils/dato.js');
    var typeis = require('../utils/typeis.js');
    var klass = require('../utils/class.js');
    var Emitter = require('../libs/emitter.js');
    var modification = require('../core/dom/modification.js');
    var udf;
    //var warningPropertyList = 'emit on un _eventsPool _eventsLimit'.split(' ');
    var zIndex = 999;

    /**
     * 使用 UI 基础类给各个 UI 组件来分配 z-index
     * @returns {number}
     */
    exports.getZindex = function () {
        return zIndex++;
    };


    /**
     * 创建一个 UI 类
     * @param prototypes {Object} 原型链
     * @param [isInheritSuperStatic=false] {Boolean} 是否继承父类的静态方法
     * @returns {Constructor}
     *
     * @example
     * var Dialog = ui.create({...});
     */
    exports.create = function (prototypes, isInheritSuperStatic) {
        if (!typeis.function(prototypes.constructor)) {
            throw 'UI class constructor must be a function';
        }

        // 添加默认方法
        if (prototypes.getOptions === udf) {
            prototypes.getOptions = function (key) {
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

        if (prototypes.setOptions === udf) {
            prototypes.setOptions = function (key, val) {
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
                 * @params options {Object} 参数
                 */
                the.emit('setoptions', the._options);

                return the;
            };
        }

        return klass.extends(Emitter, isInheritSuperStatic).create(prototypes);
    };


    /**
     * 导入 UI 样式
     * @param styleText {String}
     */
    exports.importStyle = function (styleText) {
        modification.importStyle(styleText);
    };
});