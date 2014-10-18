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
     * @requires util/data
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires libs/Emitter
     */
    'use strict';

    var klass = require('../util/class.js');
    var utilData = require('../util/data.js');
    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var modification = require('../core/dom/modification.js');
    var event = require('../core/event/base.js');
    var Emitter = require('./Emitter.js');
    var alienKey = 'alien-libs-DDB-';
    var alienIndex = 1;
    var regRepeat = /^(([^,]+)+\s*,\s*)?(.*)\s+in\s+(.*)$/;
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
            the._renderMap = {};
            // 事件表
            the._eventsMap = {};
            // 忽略渲染的节点
            the._ignore = null;
            // 解析
            the._parse();
        },


        /**
         * 解析
         * @private
         * 1、有个 elesMap
         *
         * 2、对应的赋值关系 renderMap
         * {
         *     1: {
         *        type: 'html',
         *        // 表达式
         *        exp: 'html'
         *     },
         *     2: {
         *        type: 'html',
         *        // 表达式
         *        exp: 'a.b.c.d.e.f'
         *     }
         * }
         */
        _parse: function () {
            var the = this;
            var repeatNodes = [];

            _parse(the._ele, the._data);

            function _parse(ele, data, keyValArr) {
                var eles = selector.query('*', ele);
                keyValArr = keyValArr || [];

                utilData.each(eles, function (index, ele) {
                    var parseData = utilData.extend(!1, {}, the._data, data);
                    var klass = attribute.attr(ele, 'al-class');
                    var style = attribute.attr(ele, 'al-style');
                    var html = attribute.attr(ele, 'al-html');
                    var value = attribute.attr(ele, 'al-value');
                    var repeat = attribute.attr(ele, 'al-repeat');
                    var repeatInfo;
                    var repeatKey;
                    var repeatVal;
                    var repeatList;
                    var repeatData;
                    var repeatClone;
                    var repeatTimes = 0;

                    the._elesMap[alienIndex] = ele;

                    // 属性
                    if (klass || style) {
                        if (klass) {
                            klass = _parseJSON(klass);

                            utilData.each(klass, function (className, exp) {
                                if (_exe(exp, parseData)) {
                                    attribute.addClass(ele, className);
                                } else {
                                    attribute.removeClass(ele, className);
                                }
                            });
                        }

                        if (style) {
                            style = _parseJSON(style);

                            utilData.each(style, function (styleKey, exp) {
                                var styleVal = _exe(exp, parseData);
                                attribute.css(ele, styleKey, styleVal);
                            });
                        }
                    }
                    // 内容
                    else {
                        if (html) {
                            html = html.trim();

                            // 存在表达式 && 未被解析过的
                            if (html && !_isIn(ele, repeatNodes)) {
                                ele.innerHTML = _exe(html, parseData);
                                the._renderMap[alienIndex] = {
                                    type: 'html',
                                    data: parseData,
                                    exp: html,
                                    repeat: keyValArr
                                };
                            }
                        } else if (value) {
                            value = value.trim();

                            // 存在表达式 && 未被解析过的
                            if (value && !_isIn(ele, repeatNodes)) {
                                ele.value = _exe(value, parseData);
                                the._renderMap[alienIndex] = {
                                    type: 'value',
                                    data: parseData,
                                    exp: value,
                                    repeat: keyValArr
                                };

                                the._eventsMap[alienIndex] = the._eventsMap[alienIndex] || [];
                                the._eventsMap[alienIndex].push('input');
                                the._eventsMap[alienIndex].push('change');
                                event.on(ele, 'input change', function () {
                                    the._ignore = this;
                                    the._data[value] = this.value;
                                    the._reRender();
                                });
                            }
                        } else if (repeat) {
                            repeat = repeat.trim();

                            if (repeat) {
                                repeatInfo = repeat.match(regRepeat);

                                if (repeatInfo) {
                                    repeatKey = repeatInfo[2].trim();
                                    repeatVal = repeatInfo[3].trim();
                                    repeatList = repeatInfo[4].trim();
                                    repeatData = data[repeatList];
                                    repeatClone = ele.cloneNode(!0);

                                    repeatNodes.push(ele);
                                    utilData.each(repeatData, function (key, val) {
                                        var d = {};
                                        var e = ele;

                                        d[repeatKey] = key;
                                        d[repeatVal] = val;

                                        if (repeatTimes++) {
                                            e = modification.insert(repeatClone.cloneNode(!0), ele.parentNode, 'beforeend', !0);
                                            _parse(e, d, [repeatList, key, repeatKey, repeatVal]);
                                        } else {
                                            _parse(e, d, [repeatList, key, repeatKey, repeatVal]);
                                            attribute.prop(e, alienKey + 'hasrepeat', 1);
                                        }
                                    });
                                }
                            }
                        }
                    }

                    alienIndex++;
                });
            }
        },


        /**
         * 重新渲染
         * @private
         */
        _reRender: function () {
            var the = this;

            the.emit('change', the._data);

            utilData.each(the._renderMap, function (key, parse) {
                var ele = the._elesMap[key];
                var val;
                var repeatList;

                if (the._ignore !== ele) {
                    the._ignore = null;

                    if (parse.repeat.length) {
                        repeatList = parse.data[parse.repeat[0]];
                        parse.data[parse.repeat[2]] = parse.repeat[1];
                        parse.data[parse.repeat[3]] = repeatList[parse.repeat[1]];
                    }

                    val = _exe(parse.exp, utilData.extend(!1, {}, parse.data, the._data));

                    switch (parse.type) {
                        case 'html':
                            if (val !== ele.innerHTML) {
                                ele.innerHTML = val;
                            }
                            break;

                        case 'value':
                            if (val !== ele.value) {
                                ele.value = val;
                            }
                            break;
                    }
                }
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
                the._reRender();
            };

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

        utilData.each(arr1, function (index, val) {
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

        utilData.each(data, function (key) {
            fnStr += 'var ' + key + '=data.' + key + ';';
        });

        fnStr += 'return ' + exp + '}catch(err){return err.message;}';

        try {
            return (new Function('data', fnStr))(data);
        } catch (err) {
            return err.message;
        }
    }


    /**
     * 元素是否在父级集合里
     * @param ele
     * @param parents
     * @returns {boolean}
     * @private
     */
    function _isIn(ele, parents) {
        var ret = !1;

        utilData.each(parents, function (index, parent) {
            if (parent.contains(ele) && parent[alienKey + 'hasrepeat']) {
                ret = !0;
                return !1;
            }
        });

        return ret;
    }


    module.exports = DDB;
});