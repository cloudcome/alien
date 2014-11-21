/*!
 * DDB.js
 * @author ydr.me
 * @create 2014-10-18 12:12
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
    var alienKey = 'alien-libs-DDB-';
    var alienIndex = 1;
    var regRepeat = /^(([^,]+)+\s*,\s*)?(.*)\s+in\s+(.*)$/;
    var regAlien = /^al-/;
    var regClass = /^alien-[\da-z]{10}$/;
    var DDB = klass.create({
        STATIC: {},


        /**
         * 构造函数
         * @param ele
         * @param data
         */
        constructor: function (ele, data) {
            var the = this;

            ele = selector.query(ele);

            if (!ele.length) {
                throw new Error('data binding must have an element');
            }

            Emitter.apply(the, arguments);
            the._ele = ele[0];
            the._data = data || {};
            the._init();
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;

            // 元素表
            the._elesMap = {};
            // 渲染表
            the._parseMap = {};
            // 重复表
            the._repeatItems = [];
            the._repeatTemps = {};
            // 忽略渲染的节点
            the._ignore = null;
            // 状态，0=初始化阶段，1=更新阶段
            the._state = 0;
            // 解析
            the._parse(the._ele);
            // 事件监听
            the._on();
            // 渲染
            the._render(the._parseMap, the._data);
        },


        _parse: function (begin) {
            var the = this;
            var children = selector.children(begin);
            var parser = [];

            if (!children.length) {
                return parser;
            }

            dato.each(children, function (i, child) {
                var attrs = child.attributes;
                var className = 'alien-' + random.string(10);

                the._elesMap[alienIndex] = child;

                child[alienKey + 'index'] = alienIndex;
                attribute.addClass(child, className);

                // 查找到所有符合的属性
                dato.each(attrs, function (j, attr) {
                    var name = attr.name;
                    var val = attr.value;
                    var type;
                    var json;
                    var repeatInfo;
                    var closestRepeat;
                    var closestRepeatIndex;
                    var render;

                    if (regAlien.test(attr.name)) {
                        type = name.slice(3);

                        if (type === 'repeat') {
                            if (repeatInfo = val.match(regRepeat)) {
                                the._parseMap[child[alienKey + 'index']] = {
                                    index: alienIndex,
                                    // 节点
                                    node: child,
                                    className: className,
                                    // 渲染数据
                                    render: [],
                                    // 子集
                                    repeat: {
                                        node: child,
                                        index: alienIndex,
                                        type: type,
                                        exp: val,
                                        data: the._data,
                                        key: repeatInfo[2],
                                        val: repeatInfo[3],
                                        name: repeatInfo[4],
                                        map: {}
                                    }
                                };
                                the._repeatItems.push(alienIndex);
                            }
                        } else {
                            closestRepeat = the._closestRepeat(child);

                            if (closestRepeat) {
                                closestRepeatIndex = closestRepeat[alienKey + 'index'];

                                the._findFather(closestRepeatIndex)[alienIndex] = {
                                    node: child,
                                    className: className,
                                    render: [],
                                    repeat: {}
                                };
                                render = the._findFather(closestRepeatIndex)[alienIndex].render;
                            }
                        }

                        if (!render && !the._parseMap[alienIndex]) {
                            the._parseMap[alienIndex] = {
                                index: alienIndex,
                                node: child,
                                className: className,
                                render: [],
                                repeat: {}
                            };
                        }

                        if (!render) {
                            render = the._parseMap[alienIndex].render;
                        }

                        if (type === 'class' || type === 'style') {
                            json = _parseJSON(val);

                            dato.each(json, function (val, exp) {
                                render.push({
                                    index: alienIndex,
                                    type: type,
                                    exp: exp,
                                    val: val,
                                    data: the._data
                                });
                            });
                        } else {
                            render.push({
                                index: alienIndex,
                                type: type,
                                exp: val,
                                data: the._data
                            });
                        }
                    }
                });

                alienIndex++;
                the._parse(child);

            });
        },

        _closestRepeat: function (node) {
            var ret = null;

            while (node !== this._ele) {
                node = node.parentNode;

                if (attribute.attr(node, 'al-repeat')) {
                    ret = node;
                    break;
                }
            }

            return ret;
        },

        _findFather: function (i) {
            var find = null;
            var src = this._parseMap;

            i = dato.parseInt(i, 0);

            _each(src);

            function _each(father) {
                if (find) {
                    return find;
                }

                dato.each(father, function (j, obj) {
                    if (obj.repeat && i === dato.parseInt(obj.repeat.index, 0)) {
                        find = obj.repeat.map;
                        return !1;
                    }

                    if (i === dato.parseInt(j, 0)) {
                        find = father[j];
                        return !1;
                    }

                    if (obj.repeat && obj.repeat.map) {
                        _each(obj.repeat.map);
                    }
                });
            }

            return find;
        },

        _on: function () {
            var the = this;
            var ele = the._ele;

            event.on(ele, 'input change', function (eve) {
                var node = eve.target;
                var index = node[alienKey + 'index'];
                var val = node.value;
                var parser;

                // 存在的元素
                if (index) {
                    parser = the._parseMap[index];

                    dato.each(parser.render, function (i, rd) {
                        if (rd.type === 'model') {
                            the._ignore = node;
                            the._data[rd.exp] = val;
                            the._render(the._parseMap, the._data);
                            return !1;
                        }
                    });
                }
            });
        },

        _render: function (maps, data) {
            var the = this;
            var isFirstRender = the._state === 0;

            the._state = 1;
            the.emit('change', the._data);

            dato.each(maps, function (i, map) {
                var node = map.node;
                var repeatName = map.repeat.name;
                var repeatKey = map.repeat.key;
                var repeatVal = map.repeat.val;
                var eachLength = repeatName ? Object.keys(data[repeatName]).length : 0;
                var eachIndex = 0;
                var childrenLength;
                var repeatFather;
                var repeatChild;
                var isRepeat = the._repeatItems.indexOf(map.index) > -1;

                if (isFirstRender && isRepeat) {
                    the._repeatTemps[map.index] = {
                        parentClass: _getSignClass(node.parentNode),
                        clone: node.cloneNode(!0)
                    };
                }

                // 上次有数据，本次被清除
                if (!eachLength && isRepeat && (!the._lastData || Object.keys(the._lastData[repeatName]).length)) {
                    repeatFather = selector.query('.' + the._repeatTemps[map.index].parentClass, the._ele)[0];
                    repeatFather.innerHTML = '';
                }

                if (map.repeat.map && eachLength) {
                    childrenLength = selector.query('.' + map.className, the._ele).length;
                    repeatFather = selector.query('.' + the._repeatTemps[map.index].parentClass, the._ele)[0];
                    repeatChild = the._repeatTemps[map.index].clone;

                    // repeat 项目不够
                    if (eachLength > childrenLength) {
                        while (eachLength > childrenLength) {
                            modification.insert(repeatChild.cloneNode(!0), repeatFather, 'beforeend');
                            childrenLength++;
                        }
                    }
                    // repeat 项目超出
                    else if (eachLength < childrenLength) {
                        while (eachLength < childrenLength) {
                            modification.remove(repeatFather.lastChild);
                            childrenLength--;
                        }
                    }

                    dato.each(data[repeatName], function (key, val) {
                        var d1 = {};
                        var d2;

                        if (repeatKey) {
                            d1[repeatKey] = key;
                        }

                        d1[repeatVal] = val;
                        d2 = dato.extend(!0, {}, data, d1);
                        d2[alienKey + 'index'] = eachIndex;
                        the._render(map.repeat.map, d2);
                        eachIndex++;
                    });
                }

                dato.each(map.render, function (j, rd) {
                    var exeVal;
                    var selectIndex = data[alienKey + 'index'] !== undefined ? data[alienKey + 'index'] : 0;
                    var node = selector.query('.' + map.className, the._ele)[selectIndex];

                    if (node !== the._ignore) {
                        exeVal = rd.type === 'repeat' ?
                            null :
                            _exe(rd.exp, isFirstRender ? rd.data : data);

                        switch (rd.type) {
                            case 'html':
                                if (node.innerHTML !== exeVal) {
                                    node.innerHTML = exeVal;
                                }

                                break;

                            case 'text':
                                if (node.textContent !== exeVal) {
                                    node.textContent = exeVal;
                                }

                                break;

                            case 'value':
                            case 'model':
                                if (node.value !== exeVal) {
                                    node.value = exeVal;
                                }

                                break;

                            case 'class':
                                attribute[(exeVal ? 'add' : 'remove') + 'Class'](node, rd.val);
                                break;

                            case 'style':
                                attribute.css(node, rd.val, exeVal);
                                break;
                        }
                    }
                });
            });
        },


        /**
         * 手动更新数据
         * @param {Function} 回调
         * @chainable
         *
         * @example
         * ddb.update(function(data, next){
         *    // 这里的数据可以是异步，也可以同步修改的
         *    // 只需要在数据最终状态处，执行 next(); 即可
         *    // data 是当前的数据，修改的话，请直接修改 data
         *    next();
         * });
         */
        update: function (callback) {
            var the = this;
            var next = function () {
                the._render(the._parseMap, the._data);
            };

            the._lastData = dato.extend(!0, {}, the._data);
            callback.call(the, the._data, next);

            return the;
        }
    }, Emitter);


    /**
     * 解析 JSON 表达式
     * @param str
     * @returns {*}
     * @private
     */
    function _parseJSON(str) {
        var arr1 = str.trim().slice(1, -1).split(',');
        var json = {};

        dato.each(arr1, function (index, val) {
            var arr2 = val.split(':');
            var name = arr2[0].trim();
            var exp = arr2[1].trim();

            if (arr2.length === 2 && name && exp) {
                json[name] = exp;
            }
        });

        return json;
    }


    /**
     * 执行表达式
     * @param exp
     * @param data
     * @returns {String}
     * @private
     */
    function _exe(exp, data) {
        var fnStr = 'try{';

        dato.each(data, function (key) {
            if (key.indexOf('-') === -1) {
                fnStr += 'var ' + key + '=data.' + key + ';';
            }
        });

        fnStr += 'return ' + exp + '}catch(err){return err.message;}';

        try {
            return (new Function('data', fnStr))(data);
        } catch (err) {
            return err.message;
        }
    }


    /**
     * 获取标识class
     * @param node
     * @returns {string}
     * @private
     */
    function _getSignClass(node) {
        var list = node.classList;
        var className = '';

        dato.each(list, function (i, cn) {
            if (regClass.test(cn)) {
                className = cn;
                return !1;
            }
        });

        return className;
    }


    /**
     * 为子节点添加ignore属性
     * @param node
     * @param ignore
     * @private
     */
    function _ignoreNode(node, ignore) {
        var children = selector.children(node);
        var child;

        while (children.length--) {
            child = children[children.length];
            child[alienKey + 'ignore'] = ignore;

            _ignoreNode(child);
        }
    }


    module.exports = DDB;
});