/*!
 * dom data bind
 *
 * 如下这种格式的 DOM 才能够被正确绑定
 * <div d-attr="{name: name}"
 *      d-class="{class1: hasClass1, class2: hasClass2}"
 *      d-html="html"></div>
 *
 * @author ydr.me
 * @create 2015-04-14 14:14
 */


define(function (require, exports, module) {
    /**
     * @module libs/DDB
     */
    'use strict';

    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var modification = require('../core/dom/modification.js');
    var klass = require('../utils/class.js');
    var dato = require('../utils/dato.js');
    var typeis = require('../utils/typeis.js');
    var random = require('../utils/random.js');
    var Emitter = require('./Emitter.js');
    var watch = require('../3rd/watch.js').watch;
    //var vueDirective = require('./vue-directive.js');
    //var TO_JSON_LIST = ['style', 'class'];
    //var CHAR_CODE_MAP = {
    //    double: 0x22,
    //    single: 0x27,
    //    comma: 0x2c,
    //    parent_open: 0x28,
    //    parent_close: 0x29,
    //    bracket_open: 0x5b,
    //    bracket_close: 0x5d,
    //    brace_open: 0x7b,
    //    brace_close: 0x7d
    //};
    var PREFIX = 'alienLibsDDB';
    var REG_OPERATORS = /[+*/-]/;
    var REG_QUOTE = /['"]/;
    var REG_SINGLE_STRING = /'[^'"]*?'/;
    var REG_DOUBLE_STRING = /"[^'"]*?"/;
    var REG_LIST_ATTR = /^(?:(.*?)\s*?,\s*?)?(.*?):\s*?(.*)$/;
    var SINGLE_ATTRS = ['html', 'text'];
    var LIST_ATTRS = ['repeat'];
    var defaults = {
        prefix: 'd',
        openTag: '{{',
        closeTag: '}}'
    };
    var DDB = klass.create(function ($container, data, options) {
        var the = this;

        the._$container = selector.query($container)[0];
        the.data = data;
        the._options = dato.extend(true, {}, defaults, options);
        the._init();
    }, Emitter);
    DDB.defaults = defaults;

    DDB.implement({
        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;
            var options = the._options;

            the._REG_ATTR_NAME = new RegExp('^' + dato.fixRegExp(options.prefix) + '-(.*)$', 'i');
            the._attrMap = {};
            the._views = [];
            the._parseAttr(the._$container);
            the._renderAttr();
        },


        /**
         * 解析属性
         * @private
         */
        _parseAttr: function (node) {
            var the = this;
            var attrs = dato.toArray(node.attributes);

            attrs.forEach(function (attr) {
                var attrInfo = the._getAttrInfo(node, attr);

                if (!attrInfo) {
                    return;
                }

                var attrType = attrInfo[0];
                var attrVal = attrInfo[1];
                var expInfo = the._parseExpInfo(attrVal, attrType);

                //the._attrMap[attrType] = the._attrMap[attrType] || [];
                //the._attrMap[attrType].push({
                //    node: node,
                //    raw: attrVal,
                //    type: attrType,
                //    slices: expInfo
                //});

                the._views.push({
                    node: node,
                    raw: attrVal,
                    type: attrType,
                    slices: expInfo
                });
            });

            selector.children(node).forEach(function (node) {
                the._parseAttr(node);
            });
        },


        /**
         * 渲染属性
         * @private
         */
        _renderAttr: function () {
            var the = this;
            var inRepeat = 0;
            var repeats = [];

            dato.each(the._views, function (index, view) {
                var slices = view.slices;
                var slice0 = slices[0];
                var node = view.node;

                if (view.type === 'repeat') {
                    repeats.push(slice0.keys[2]);
                    inRepeat++;
                    view.$temp = node.cloneNode(true);
                    view.repeats = repeats;
                    view.$pos = modification.create('#comment', 'repeat');
                    modification.insert(view.$pos, node, 'afterend');
                    modification.remove(node);

                    view.render = function () {
                        var data = the._getRepeatData(view.repeats);
                        dato.each(data || [], function (index, value) {
                            modification.insert(view.$temp.cloneNode(true), view.$pos, 'beforebegin');
                        });
                    };

                    view.render();

                    watch()
                }
            });


            //var htmlList = the._attrMap.html;
            //var styleList = the._attrMap.style;
            //var classList = the._attrMap.class;
            //
            //// d-html
            //dato.each(htmlList, function (index, item) {
            //    var slices = item.slices;
            //    var node = item.node;
            //    var keys = [];
            //
            //    slices.forEach(function (slice) {
            //        slice.parser = the._buildScope(slice.exp);
            //        keys = keys.concat(slice.keys);
            //    });
            //
            //    item.render = function () {
            //        node.innerHTML = item.slices[0].parser.call(the, the.data);
            //    };
            //
            //    item.render();
            //
            //    watch(the.data, keys, item.watcher = function (key, action, neo, old) {
            //        item.render();
            //    });
            //});
            //
            //// d-style
            //dato.each(styleList, function (index, item) {
            //    var slices = item.slices;
            //    var node = item.node;
            //    var keys = [];
            //
            //    slices.forEach(function (slice) {
            //        slice.parser = the._buildScope(slice.exp);
            //        keys = keys.concat(slice.keys);
            //    });
            //
            //    item.render = function () {
            //        var styleSet = {};
            //
            //        item.slices.forEach(function (slice) {
            //            styleSet[slice.key] = slice.parser.call(the, the.data);
            //        });
            //
            //        attribute.css(node, styleSet);
            //    };
            //
            //    item.render();
            //
            //    watch(the.data, keys, item.watcher = function (key, action, neo, old) {
            //        item.render();
            //    });
            //});
            //
            //// d-class
            //dato.each(classList, function (index, item) {
            //    var slices = item.slices;
            //    var node = item.node;
            //    var keys = [];
            //
            //    slices.forEach(function (slice) {
            //        slice.parser = the._buildScope(slice.exp);
            //        keys = keys.concat(slice.keys);
            //    });
            //
            //    item.render = function () {
            //        var classSet = {};
            //
            //        item.slices.forEach(function (slice) {
            //            classSet[slice.key] = slice.parser.call(the, the.data);
            //        });
            //
            //        dato.each(classSet, function (className, boolean) {
            //            attribute[(!!boolean ? 'add' : 'remove') + 'Class'](node, className);
            //        });
            //    };
            //
            //    item.render();
            //
            //    watch(the.data, keys, item.watcher = function (key, action, neo, old) {
            //        item.render();
            //    });
            //});
        },


        /**
         * 获取 repeat 层级数据
         * @param repeats
         * @returns {*}
         * @private
         */
        _getRepeatData: function (repeats) {
            var data = this.data;

            repeats.forEach(function (repeat) {
                data = data[repeat];
            });

            return data;
        },


        /**
         * 获取属性绑定信息
         * @param node
         * @param attr
         * @returns {Array|null}
         * @private
         */
        _getAttrInfo: function (node, attr) {
            var the = this;
            var nodeName = attr.nodeName;

            if (!the._REG_ATTR_NAME.test(nodeName)) {
                return null;
            }

            var type = nodeName.match(the._REG_ATTR_NAME)[1].toLowerCase();
            var val = attribute.attr(node, nodeName);

            attribute.removeAttr(node, nodeName);

            return [type, val];
        },


        /**
         * 解析属性表达式信息
         * @param str
         * @param attrType
         * @returns {Array}
         * @private
         *
         * @example
         * // width: a, height: b + c + 'px'
         * => [{keys: ["a"], exp: "a", key: "width"},
         *     {keys: ["b", "c"], exp: "b + c + 'px'", key: "height"}]
         *
         * // a + 'a' + b
         * => [{keys: ["a", "b"], exp: "a + 'a' + b", key: ""}]
         *
         * // index,item: list
         */
        _parseExpInfo: function (str, attrType) {
            str = str.trim();

            var the = this;
            var isSingle = SINGLE_ATTRS.indexOf(attrType) > -1;
            var isList = LIST_ATTRS.indexOf(attrType) > -1;

            if (isSingle) {
                return [{
                    keys: the._pickKeys(str),
                    exp: str,
                    key: ''
                }];
            }

            if (isList) {
                var matches = str.match(REG_LIST_ATTR);

                return [{
                    keys: [(matches[1] || the._generateKey()).trim(), matches[2].trim(), matches[3].trim()],
                    exp: str,
                    key: ''
                }];
            }

            var list = str.split(',');
            var ret = [];

            list.forEach(function (item) {
                var temp = item.split(':');
                var temp0 = temp[0].trim();
                var temp1 = temp[1].trim();
                var obj = {
                    keys: the._pickKeys(temp1),
                    exp: temp1,
                    key: temp0
                };

                ret.push(obj);
            });

            return ret;
        },


        /**
         * 提取键
         * @param exp
         * @returns {Array}
         * @private
         */
        _pickKeys: function (exp) {
            while (REG_QUOTE.test(exp)) {
                exp = exp
                    .replace(REG_SINGLE_STRING, '')
                    .replace(REG_DOUBLE_STRING, '');
            }

            var ret = [];

            exp.split(REG_OPERATORS).forEach(function (item) {
                item = item.trim();

                if (item) {
                    ret.push(item);
                }
            });

            return ret;
        },


        /**
         * 构建域函数
         * @param exp
         * @returns {function}
         * @private
         */
        _buildScope: function (exp) {
            var the = this;
            var body = '';
            var _var = the._generateKey();

            dato.each(the.data, function (key) {
                body += 'var ' + key + '=' + _var + '["' + key + '"];';
            });

            body += 'return ' + exp;

            return new Function(_var, body);
        },


        /**
         * 生成随机字符串
         * @returns {string}
         * @private
         */
        _generateKey: function () {
            return PREFIX + Date.now() + random.string(10, 'aA0');
        }
    });

    module.exports = DDB;
});