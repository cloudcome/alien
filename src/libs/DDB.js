/*!
 * dom data bind
 *
 * 如下这种格式的 DOM 才能够被正确绑定
 * <div d-attr="{name: name}"
 *      d-class="{class1: hasClass1, class2: hasClass2}"
 *      d-html="html"></div>
 *
 * @author ydr.me
 * @create 2015-04-14 14:114
 */


define(function (require, exports, module) {
    /**
     * @module libs/DDB
     */
    'use strict';

    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var modification = require('../core/dom/modification.js');
    var event = require('../core/event/touch.js');
    var klass = require('../utils/class.js');
    var dato = require('../utils/dato.js');
    var string = require('../utils/string.js');
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
    var REG_LIST_KEY = /^([^.[]*)[.[]?/;
    var REG_SCOPE_SPLIT = /[[\].]/g;
    var REG_FIRST_POINT = /^([^.]*)\./;
    var SINGLE_ATTRS = ['html', 'text', 'model', 'value'];
    var LIST_ATTRS = ['repeat'];
    var defaults = {
        prefix: 'd',
        openTag: '{{',
        closeTag: '}}',
        debug: false
    };
    var DDB = klass.extends(Emitter).create({
        constructor: function ($rootScope, data, options) {
            var the = this;

            the._$rootScope = selector.query($rootScope)[0];
            the.data = data;
            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },
        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;
            var options = the._options;

            the._REG_ATTR_NAME = new RegExp('^' + string.escapeRegExp(options.prefix) + '-(.*)$', 'i');
            the._prefix = the._generateKey();
            the._attrMap = {};
            the._views = [];
            the._id = 0;
            the._hasReady = false;
            the._scan(the._$rootScope);
            the._render();
            the._watch();
        },


        /**
         * 扫描节点
         * @param $ele
         * @private
         */
        _scan: function ($ele) {
            var the = this;
            var attrs = dato.toArray($ele.attributes);
            var $parentEle = selector.parent($ele)[0];
            var parentScope = $ele === the._$rootScope ? '' : the._getProp($parentEle, 'scope');
            var $parentScope = parentScope ? the._getProp($parentEle, '$scope') : the._$rootScope;
            var hasRepeat = false;
            var deepList = [];

            attrs.forEach(function (attr) {
                var attrInfo = the._getAttrInfo($ele, attr);

                if (!attrInfo) {
                    the._setProp($ele, 'scope', parentScope);
                    the._setProp($ele, '$scope', $parentScope);
                    return;
                }

                var attrType = attrInfo[0];
                var attrVal = attrInfo[1];
                var expInfo = the._parseSlices(attrVal, attrType);

                // repeat
                if (attrType === 'repeat') {
                    hasRepeat = true;

                    var repeatKeys = expInfo[0][attrType];
                    var repeatVarOfIndex = repeatKeys[0];
                    var repeatVarOfValue = repeatKeys[1];
                    var repeatVarOfKey = repeatKeys[2];
                    var repeatVarOfScope = repeatKeys[3];
                    var scope = the._joinScope(parentScope, repeatVarOfScope);
                    var list = the._getScopeData(the.data, scope);
                    var $pos = modification.create('#comment', the._id++);

                    modification.insert($pos, $ele, 'afterend');
                    modification.remove($ele);

                    dato.each(list, function (index) {
                        var $clone = $ele.cloneNode(true);
                        var view = {
                            index: index,
                            $ele: $ele,
                            parentScope: parentScope,
                            scope: scope,
                            $scope: $clone,
                            repeat: {
                                index: repeatVarOfIndex,
                                value: repeatVarOfValue,
                                key: repeatVarOfKey,
                                scope: repeatVarOfScope
                            }
                        };

                        the._setProp($clone, 'index', index);
                        the._setProp($clone, 'scope', scope + '[' + index + ']');
                        the._setProp($clone, '$scope', $clone);
                        the._setProp($clone, 'view', view);
                        modification.insert($clone, $pos, 'beforebegin');
                        deepList.push($clone);
                        the._views.push(view);
                    });
                } else {
                    var view = {
                        $ele: $ele,
                        parentScope: parentScope,
                        scope: parentScope,
                        $scope: $parentScope,
                        raw: attrVal,
                        type: attrType,
                        slices: expInfo
                    };

                    the._views.push(view);
                    the._setProp($ele, 'scope', parentScope);
                    the._setProp($ele, '$scope', $parentScope);
                    the._setProp($ele, 'view', view);
                }
            });

            if (!attrs.length) {
                the._setProp($ele, 'scope', parentScope);
                the._setProp($ele, '$scope', $parentScope);
            }

            if (hasRepeat) {
                deepList.forEach(function ($ele) {
                    var index = the._getProp($ele, 'index');
                    var scope = the._getProp($ele, 'scope');

                    selector.children($ele).forEach(function ($ele) {
                        the._setProp($ele, 'scope', scope);
                        the._setProp($ele, 'index', index);
                        the._scan($ele);
                    });
                });
            } else {
                selector.children($ele).forEach(function ($ele) {
                    the._scan($ele);
                });
            }
        },


        /**
         * 渲染属性
         * @private
         */
        _render: function () {
            var the = this;

            dato.each(the._views, function (index, view) {
                var slices = view.slices;

                if (!slices) {
                    return;
                }

                var $ele = view.$ele;
                var slice0 = slices[0];

                switch (view.type) {
                    case 'html':
                    case 'text':
                    case 'model':
                    case 'value':
                        view.render = function () {
                            var map = {
                                html: 'innerHTML',
                                text: 'textContent',
                                model: 'value',
                                value: 'value'
                            };
                            var scopeData = the._scopeChain(view);
                            var ret = the._execScope(the._buildScope(false, slice0.exp, scopeData), scopeData);

                            if ($ele[map[view.type]] === ret) {
                                return;
                            }

                            if (view.type === 'model' && !the._hasReady) {
                                the._oninput(view);
                            }

                            if (!(view.type === 'model' && the._hasReady)) {
                                $ele[map[view.type]] = ret;
                            }
                        };
                        break;

                    case 'class':
                        view.render = function () {
                            var scopeData = the._scopeChain(view);

                            dato.each(slices, function (index, slice) {
                                var boolean = !!the._execScope(the._buildScope(false, slice.exp, scopeData), scopeData);

                                attribute[(boolean ? 'add' : 'remove') + 'Class']($ele, slice.key);
                            });
                        };
                        break;

                    case 'style':
                    case 'attr':
                    case 'prop':
                    case 'data':
                        view.render = function () {
                            var map = {};
                            var scopeData = the._scopeChain(view);

                            dato.each(slices, function (index, slice) {
                                map[slice.key] = the._execScope(the._buildScope(false, slice.exp, scopeData), scopeData);
                            });

                            attribute[view.type]($ele, map);
                        };
                        break;
                }

                view.render();
            });

            the._hasReady = true;
        },


        /**
         * 监听数据变化
         * @private
         */
        _watch: function () {
            var the = this;

            watch(the.data, function () {
                the._render();
            });
        },


        /**
         * oninput 监听
         * @param view
         * @private
         */
        _oninput: function (view) {
            var the = this;
            var $ele = view.$ele;
            var slice = view.slices[0];
            var scope = view.scope;

            slice._s = the._buildScope(true, the._joinScope(scope, slice.exp.replace(REG_FIRST_POINT, '')));
            event.on($ele, 'input', function () {
                slice._s.call(the, this.value);
            });
        },


        /**
         * 作用域链
         * @param view
         * @private
         */
        _scopeChain: function (view) {
            var the = this;
            var scopeDatas = [];
            /**
             * 向上冒泡作用域
             * @param view
             */
            var bubbleScope = function (view) {
                var $scope = view.$scope;
                var scopeView = the._getProp($scope, 'view');
                var scopeData = {};

                if (!scopeView || !scopeView.repeat) {
                    return;
                }

                // 作用域在 repeat 内
                if (scopeView && scopeView.repeat) {
                    scopeData[scopeView.repeat.index] = scopeView.index;

                    if (scopeView.repeat.key) {
                        scopeData[scopeView.repeat.key] = the._getScopeData(the.data, scopeView.parentScope);
                    }

                    scopeData[scopeView.repeat.value] = the._getScopeData(the.data, scopeView.scope)[scopeView.index];
                }

                scopeDatas.unshift(scopeData);

                var $parentEle = selector.parent(scopeView.$scope)[0];
                var $parentScope = the._getProp($parentEle, '$scope');
                var parentView = the._getProp($parentScope, 'view');

                if (parentView) {
                    bubbleScope(parentView);
                }
            };

            bubbleScope(view);

            return dato.extend.apply(dato, [{}].concat(scopeDatas));
        },


        /**
         * 获取作用域数据
         * @param parent
         * @param scope
         * @returns {*}
         * @private
         */
        _getScopeData: function (parent, scope) {
            var scopeList = scope.split(REG_SCOPE_SPLIT);

            dato.each(scopeList, function (index, scope) {
                if (scope) {
                    parent = parent[scope];
                }
            });

            return parent;
        },


        /**
         * 获取属性绑定信息
         * @param $ele
         * @param attr
         * @returns {Array|null}
         * @private
         */
        _getAttrInfo: function ($ele, attr) {
            var the = this;
            var nodeName = attr.nodeName;

            if (!the._REG_ATTR_NAME.test(nodeName)) {
                return null;
            }

            var type = nodeName.match(the._REG_ATTR_NAME)[1].toLowerCase();
            var val = attribute.attr($ele, nodeName);

            attribute.removeAttr($ele, nodeName);

            return [type, val, nodeName];
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
        _parseSlices: function (str, attrType) {
            str = str.trim();

            var the = this;
            var isSingle = SINGLE_ATTRS.indexOf(attrType) > -1;
            var isList = LIST_ATTRS.indexOf(attrType) > -1;

            if (isSingle) {
                return [{
                    exp: str
                }];
            }

            if (isList) {
                var matches = str.match(REG_LIST_ATTR);
                var matche3 = matches[3].trim();
                var key = matche3.match(REG_LIST_KEY)[1];
                var scope = matche3.replace(REG_LIST_KEY, '');

                if (!scope) {
                    scope = key;
                    key = '';
                }

                return [{
                    repeat: [(matches[1] || the._generateKey()).trim(), matches[2].trim(), key, scope],
                    exp: str
                }];
            }

            var list = str.split(',');
            var ret = [];

            list.forEach(function (item) {
                var temp = item.split(':');
                var temp0 = temp[0].trim();
                var temp1 = temp[1].trim();
                var obj = {
                    exp: temp1,
                    key: temp0
                };

                ret.push(obj);
            });

            return ret;
        },


        /**
         * 构建域函数
         * @param isSet
         * @param exp
         * @param [scopeData]
         * @returns {function}
         * @private
         */
        _buildScope: function (isSet, exp, scopeData) {
            var the = this;
            var _var = the._generateKey();
            var body = '';

            if (isSet) {
                body = 'this.data.' + exp + '=' + _var + ';';
            } else {
                dato.each(the.data, function (key) {
                    body += 'var ' + key + '=' + _var + '["' + key + '"];';
                });

                dato.each(scopeData || {}, function (key) {
                    body += 'var ' + key + '=' + _var + '["' + key + '"];';
                });

                body += 'return ' + exp + ';';
            }

            var ret;

            try {
                /* jshint evil: true */
                ret = new Function(_var, body);
            } catch (err) {
                ret = function () {
                    return the._options.debug ? err.message : '';
                };
            }

            return ret;
        },


        /**
         * 执行域函数
         * @param fn
         * @param [scopeData]
         * @private
         */
        _execScope: function (fn, scopeData) {
            var the = this;
            var ret = '';

            try {
                ret = fn.call(the, dato.extend({}, the.data, scopeData));
            } catch (err) {
                ret = the._options.debug ? err.message : '';
            }

            return ret;
        },


        /**
         * 生成随机字符串
         * @returns {string}
         * @private
         */
        _generateKey: function () {
            return PREFIX + Date.now() + random.string(10, 'aA0');
        },


        /**
         * 合并表达式
         * @param parentScope
         * @param scope
         * @returns {string}
         * @private
         */
        _joinScope: function (parentScope, scope) {
            var split = parentScope ? '.' : '';

            return parentScope + split + scope;
        },


        /**
         * 设置 DOM 属性
         * @param $ele
         * @param key
         * @param val
         * @private
         */
        _setProp: function ($ele, key, val) {
            var the = this;

            attribute.prop($ele, the._prefix + key, val);
        },


        /**
         * 获取 DOM 属性
         * @param $ele
         * @param key
         * @returns {*}
         * @private
         */
        _getProp: function ($ele, key) {
            var the = this;

            return attribute.prop($ele, the._prefix + key);
        }
    });

    DDB.defaults = defaults;
    module.exports = DDB;
});