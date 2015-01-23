/*!
 * DDB.js
 * @author ydr.me
 * @create 2014年11月21日 16:01:20
 */


/**

 // AST

 {
    node: $ele,
    children: {
        node: $ele,
        children: {
           ...
        }
    }
 }

 */


define(function (require, exports, module) {
    /**
     * DOM-DATA-Binding
     * @module libs/DDB
     * @requires util/class
     * @requires util/dato
     * @requires util/random
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/event/base
     * @requires libs/Emitter
     */
    'use strict';

    var klass = require('../util/class.js');
    var dato = require('../util/dato.js');
    var random = require('../util/random.js');
    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var modification = require('../core/dom/modification.js');
    var event = require('../core/event/base.js');
    var Emitter = require('./Emitter.js');
    var alienKey = 'alien-libs-DDB';
    var REG_ALIEN_ATTR = /^al-/i;
    var DDB = klass.create({
        constructor: function ($ele) {
            var the = this;

            the._$ele = selector.query($ele);

            if (!the._$ele.length) {
                throw new Error('instance require an element');
            }

            Emitter.apply(the, arguments);
            the._$ele = the._$ele[0];
            the._init();
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;

            the._data = {};
            the._parser = [];
            the._scanNodes(the._$ele);
        },


        /**
         * 扫描节点
         * @private
         */
        _scanNodes: function ($ele) {
            var the = this;

            dato.each($ele.childNodes, function (index, $ele) {
                if ($ele.nodeType === 1) {
                    $ele[alienKey] = {};
                    the._parser.push($ele);
                    the._parseElement($ele);
                }
            });
        },


        /**
         * 解析元素
         * @private
         */
        _parseElement: function ($ele) {
            var the = this;

            the._parseAttrs($ele);
            the._scanNodes($ele);
        },


        /**
         * 解析属性
         * @private
         */
        _parseAttrs: function ($ele) {
            var the = this;
            var attrs = $ele.attributes;

            dato.each(attrs, function (index, attr) {
                var name = attr.name.toLowerCase();
                var val = attr.value;
                var relName;

                if (REG_ALIEN_ATTR.test(name)) {
                    relName = name.slice(3);

                    switch (relName) {
                        case 'style':
                        case 'html':
                        case 'class':
                        case 'model':
                        case 'repeat':
                            $ele[alienKey][relName] = {
                                // 表达式
                                exp: val,
                                // 绑定数据
                                data: {}
                            };
                            break;
                    }

                    if (relName === 'model') {
                        $ele[alienKey][relName].data[val] = $ele.value;
                        the._listenModel($ele);
                    }
                }
            });
        },


        /**
         * 监听数据模型
         * @param $ele
         * @private
         */
        _listenModel: function ($ele) {
            var the = this;

            event.on($ele, 'change input', function(){
                the._data[this[alienKey].model.exp] = this.value;
                the.update(the._data);
            });
        },


        /**
         * 执行表达式
         * @param type
         * @param exp
         * @param data
         * @private
         */
        _exec: function (type, exp, data) {
            switch (type) {
                case 'style':
                    break;
                case 'html':
                    break;
                case 'class':
                    break;
                case 'model':
                    break;
                case 'repeat':
                    break;
            }
        },


        /**
         * 更新渲染数据
         * @param data
         */
        update: function (data) {
            var the = this;

            dato.extend(true, the._data, data);
            the.emit('change', the._data);
        },


        /**
         * 销毁实例
         */
        destroy: function () {

        }
    }, Emitter);


    module.exports = DDB;
});