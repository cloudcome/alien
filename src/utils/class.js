/**
 * 类的创建与继承
 * @author ydr.me
 * @create 2014-10-04 15:09
 */

/*===============================
 // 【以前】
 // 创建一个类
 var A = function(){};
 A.prototype.abc = '123';

 // 继承一个类
 var B = function(){
 A.apply(this, arguments);
 };

 B.prototype = new A();
 B.prototype.def = '456';

 // ===>

 //【现在】
 var A = klass.create({
 constructor: function(){},
 abc: '123'
 });
 var B = klass.extends(A).create({
 constructor: function(){},
 def: '456'
 });
 ===============================*/


define(function (require, exports, module) {
    /**
     * 类方法
     * @module utils/class
     * @requires utils/dato
     * @requires utils/typeis
     */
    'use strict';

    var dato = require('./dato.js');
    var typeis = require('./typeis.js');

    var classId = 0;

    /**
     * 单继承
     * @param {Function} constructor 子类
     * @param {Function} superConstructor 父类
     * @param {Boolean} [isCopyStatic=false] 是否复制静态方法
     * @link https://github.com/joyent/node/blob/master/lib/util.js#L628
     *
     * @example
     * // 父类
     * var Father = function(){};
     *
     * // 子类
     * var Child = function(){
     *     // 执行一次父类的方法
     *     Father.apply(this, arguments);
     *
     *     // 这里执行子类的方法、属性
     *     this.sth = 123;
     * };
     *
     * klass.inherit(Child, Father);
     *
     * // 这里开始写子类的原型方法
     * Child.prototype.fn = fn;
     */
    var inherit = function (constructor, superConstructor, isCopyStatic) {
        constructor.super_ = superConstructor;
        constructor.prototype = Object.create(superConstructor.prototype);

        if (isCopyStatic) {
            dato.extend(true, constructor, superConstructor);
        }
    };


    /**
     * 创建一个类（构造函数）【旧的方法，会在下一个大版本中废弃】
     * @param {Object} prototypes 原型链
     * @param {Function} [superConstructor=null] 父类
     * @param {Boolean} [isInheritStatic=false] 是否继承父类的静态方法
     * @returns {Function}
     */
    var create = function (prototypes, superConstructor, isInheritStatic) {
        if (typeis.Function(prototypes)) {
            prototypes = {
                constructor: prototypes
            };
        }

        if (!typeis.Function(prototypes.constructor)) {
            throw Error('propertypes.constructor must be a function');
        }

        var con = prototypes.constructor;

        prototypes.constructor = null;

        var superConstructorIsAFn = typeis.Function(superConstructor);
        var Class = function () {
            var the = this;
            var args = arguments;

            if (superConstructorIsAFn) {
                superConstructor.apply(the, args);
            }

            the.__classId__ = classId++;
            con.apply(the, args);
        };

        if (superConstructorIsAFn) {
            inherit(Class, superConstructor, isInheritStatic);
        }

        dato.each(prototypes, function (key, val) {
            Class.prototype[key] = val;
        });

        /**
         * 原始的 constructor
         * @type {Function}
         * @private
         */
        Class.prototype.__constructor__ = con;

        /**
         * 输出的 constructor
         * @type {Function}
         */
        Class.prototype.constructor = Class;

        return Class;
    };


    /**
     * 类的构造器
     * @param prototypes
     * @param superConstructor
     * @param isInheritStatic
     * @constructor
     */
    var Class = function (prototypes, superConstructor, isInheritStatic) {
        var the = this;

        the.p = prototypes;
        the.s = superConstructor;
        the.i = isInheritStatic;
    };

    Class.prototype = {
        constructor: Class,

        /**
         * 类的创建
         * @param {Object} [prototypes] 原型链
         * @returns {Function}
         */
        create: function (prototypes) {
            var the = this;

            the.p = prototypes || the.p;

            return create(the.p, the.s, the.i);
        }
    };


    /**
     * 类的继承，参考了 es6 的 class 表现
     * 因为 extends 是关键字，在 IE 下会报错，修改为 extend、inherit
     * @param superConstructor
     * @param isInheritStatic
     * @returns {Class}
     */
    exports['extends'] = exports.extend = function (superConstructor, isInheritStatic) {
        return new Class(null, superConstructor, isInheritStatic);
    };


    /**
     * 类的创建
     * @param {Object} prototypes 原型链
     * @param {Function} [superConstructor=null] 父类
     * @param {Boolean} [isInheritStatic=false] 是否继承父类的静态方法
     * @returns {Function}
     *
     * @example
     * // 1. 创建一个空原型链的类
     * var A = klass.create(fn);
     *
     * // 2. 创建一个有原型链的类
     * var B = klass.create({
     *     constructor: fn,
     *     ...
     * });
     *
     * // 3. 创建一个子类
     * var C = klass.extend(B).create(fn);
     * var D = klass.extend(C).create({
     *     constructor: fn,
     *     ...
     * });
     */
    exports.create = function (prototypes, superConstructor, isInheritStatic) {
        var the = this;

        // 上一个级联应该是 extends
        if (the.constructor === Class && the instanceof Class) {
            return the.create(prototypes);
        }

        return new Class(prototypes, superConstructor, isInheritStatic).create();
    };


    /**
     * 原型转让，将父级的原型复制到子类，
     * 比如写好的一个 Dialog 类有 A、B、C 三个原型方法，
     * 而写好的一个子类 ProductDialog，与 Dialog 的构造参数不一致，无法直接继承，
     * 那么就可以使用原型过渡，子类的 ProductDialog 原本没有 A、B、C 三个实例方法，
     * 只是在内部实例化了一个 Dialog 实例 dialog，那么就可以将 dialog 的原型方法复制到 ProductDialog 实例上
     * 即：`class.transfer(Dialog, ProductDialog, 'dialog')`
     * 结果是：将 Dialog 的原型通过 dialog 实例转让给 ProductDialog
     *
     * @param parentClass {Function|Object} 父级构造函数
     * @param childClass {Function} 子级构造函数
     * @param parentInstanceNameInChild {String} 父级实例在子类的名称
     * @param [filter] {Array} 允许和禁止的公共方法名称
     *
     * @example
     * name 与 ['name'] 匹配
     * name 与 ['!name'] 不匹配
     */
    exports.transfer = function (parentClass, childClass, parentInstanceNameInChild, filter) {
        dato.each(parentClass.prototype, function (property) {
            if (!childClass.prototype[property] && _matches(property, filter)) {
                childClass.prototype[property] = function () {
                    var the = this;
                    var ret = the[parentInstanceNameInChild][property].apply(the[parentInstanceNameInChild], arguments);
                    return ret instanceof parentClass ? the : ret;
                };
            }
        });
    };


    var REG_PRIVATE = /^_/;

    /**
     * 判断是否匹配
     * @param name {String} 待匹配字符串
     * @param [names] {Array} 被匹配字符串数组
     * @returns {boolean}
     * @private
     */
    function _matches(name, names) {
        names = names || [];

        if (REG_PRIVATE.test(name)) {
            return false;
        }

        if (!names.length) {
            return true;
        }

        var matched = true;

        dato.each(names, function (index, _name) {
            var flag = _name[0];

            // !name
            if (flag === '!') {
                matched = true;

                if (name === _name.slice(1)) {
                    matched = false;
                    return false;
                }
            }
            // name
            else {
                matched = false;

                if (name === _name) {
                    matched = true;
                    return false;
                }
            }
        });

        return matched;
    }
});
