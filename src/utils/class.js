/*!
 * 类的创建与继承
 * @author ydr.me
 * @create 2014-10-04 15:09
 * @compatible ie8
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
        if (typeis.function(prototypes)) {
            prototypes = {
                constructor: prototypes
            };
        }

        if (!typeis.function(prototypes.constructor)) {
            throw Error('propertypes.constructor must be a function');
        }

        var con = prototypes.constructor;

        prototypes.constructor = null;

        var superConstructorIsAFn = typeis.function(superConstructor);
        var c = function () {
            var the = this;
            var args = arguments;

            if (superConstructorIsAFn) {
                superConstructor.apply(the, args);
            }

            con.apply(the, args);
        };

        if (superConstructorIsAFn) {
            inherit(c, superConstructor, isInheritStatic);
        }

        dato.each(prototypes, function (key, val) {
            c.prototype[key] = val;
        });

        /**
         * 原始的 constructor
         * @type {Function}
         * @private
         */
        c.prototype.__constructor__ = con;

        /**
         * 输出的 constructor
         * @type {Function}
         */
        c.prototype.constructor = c;

        return c;
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
     * @param superConstructor
     * @param isInheritStatic
     * @returns {Class}
     */
    exports.extends = exports.inherit = function (superConstructor, isInheritStatic) {
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
     * var C = klass.extends(B).create(fn);
     * var D = klass.extends(C).create({
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
});
