/*!
 * dom-attribute.js
 * @author ydr.me
 * 2014-09-16 18:30
 */


define(function (require, exports, module) {
    /**
     * 处理有关 dom 属性的 API
     * @module core/dom/attribute
     * @requires util/data
     * @requires core/navigator/compatible
     */
    'use strict';

    var regHump = /-(\w)/g;
    var regSep = /^-+|-+$/g;
    var regSplit = /[A-Z]/g;
    var regSpace = /\s+/;
    var data = require('../../util/data.js');
    var compatible = require('../navigator/compatible.js');
    var regPx = /margin|width|height|padding|top|right|bottom|left/i;
    // +123.456
    // -123.456
    var regNum = /^[+\-]?\d+(\.\d*)?$/;
    var regEndPoint = /\.$/;

    module.exports = {
        /**
         * 设置、获取元素的属性
         * @param {HTMLElement} ele 元素
         * @param {String/Object/Array} attrkey 特征键、键值对、键数组
         * @param {String} [attrVal] 特征值
         * @returns {*}
         *
         * @example
         * // set
         * attribute.attr(ele, 'href', 'http://ydr.me');
         * attribute.attr(ele, {
         *    href: '',
         *    title: ''
         * });
         *
         * // get
         * attribute.attr(ele, 'href');
         * attribute.attr(ele, ['href', 'title']);
         */
        attr: function (ele, attrkey, attrVal) {
            return _getSet(arguments, {
                get: function (attrKey) {
                    return ele.getAttribute(attrKey);
                },
                set: function (attrkey, attrVal) {
                    ele.setAttribute(attrkey, attrVal);
                }
            });
        },
        /**
         * 判断元素是否包含某个属性
         * @param {HTMLElement} ele 元素
         * @param {String} attrKey 单个特征
         * @returns {boolean}
         *
         * @example
         * // 判断是否有某个属性
         * attribute.hasAttr(ele, 'href');
         * // => true
         */
        hasAttr: function (ele, attrKey) {
            return ele.hasAttribute(attrKey);
        },
        /**
         * 移除元素的某个属性
         * @param {HTMLElement} ele 元素
         * @param {String} [attrKey] 单个或多个特征属性，为空表示移除所有特征
         *
         * @example
         * // 移除
         * attribute.removeAttr(ele, 'href');
         */
        removeAttr: function (ele, attrKey) {
            var attrKeys = attrKey ? attrKey.split(regSpace) : ele.attributes;

            data.each(attrKeys, function (index, attrKey) {
                if (attrKey) {
                    ele.removeAttribute(data.type(attrKey) === 'attr' ? attrKey.nodeName : attrKey);
                }
            });
        },
        /**
         * 设置、获取元素的特性
         * @param {HTMLElement} ele 元素
         * @param {String/Object/Array} propKey 特性键、特性键值对、特性组
         * @param {String} [propVal] 特性值
         * @returns {*}
         *
         * @example
         * // set
         * attribute.prop(ele, 'hi', 'hey');
         * attribute.prop(ele, {
         *     hi: 'hey',
         *     ha: 'hehe'
         * });
         *
         * // get
         * attribute.prop(ele, 'hi');
         * attribute.prop(ele, ['hi', 'ha']);
         */
        prop: function (ele, propKey, propVal) {
            return _getSet(arguments, {
                get: function (propKey) {
                    return ele[propKey];
                },
                set: function (propKey, propVal) {
                    ele[propKey] = propVal;
                }
            });
        },
        /**
         * 修正 css 键值
         * @param {String} key css 键
         * @param {*} val css 值
         * @returns {{key: String, val: *}}
         *
         * @example
         * attribute.fixCss('marginTop', 10);
         * // => {
         * //    key: 'margin-top',
         * //    val: '10px'
         * // }
         */
        fixCss: function (key, val) {
            return {
                key: compatible.css3(_toSepString(key)),
                val: _toCssVal(key, val)
            };
        },
        /**
         * 设置、获取元素的样式
         * @param {HTMLElement} ele 元素
         * @param {String/Object/Array} key 样式属性、样式键值对、样式属性数组，
         *                                     样式属性可以写成`width::after`（伪元素的width）或`width`（实际元素的width）
         * @param {String|Number} [val] 样式属性值
         * @returns {*}
         *
         * @example
         * // set
         * attribute.css(ele, 'width', 100);
         * attribute.css(ele, {
         *    width: 100,
         *    height: '200px'
         * });
         *
         * // get
         * attribute.css(ele, 'width');
         * attribute.css(ele, 'width::after');
         * attribute.css(ele, ['width','height']);
         */
        css: function (ele, key, val) {
            var the = this;

            return _getSet(arguments, {
                get: function (key) {
                    var temp = key.split('::');
                    var pseudo = temp[temp.length - 1];

                    key = temp[0];
                    pseudo = pseudo ? pseudo : null;
                    return getComputedStyle(ele, pseudo)[_toSepString(key)];
                },
                set: function (key, val) {
                    key = key.split('::')[0];

                    var fix = the.fixCss(key, val);

                    ele.style[fix.key] = fix.val;
                }
            });
        },
        /**
         * 设置、获取元素的数据集
         * @param {HTMLElement} ele 元素
         * @param {String/Object/Array} dataKey 数据集键、键值对、键数组
         * @param {String} [dataVal] 数据集值
         * @returns {*}
         *
         * @example
         * // set
         * attribute.data(ele, 'abc', 123);
         * attribute.data(ele, 'def', {
         *    a: 1,
         *    b: 2
         * });
         * // => <div data-abc="123" data-def='{"a":1,"b":2}'></div>
         * // data 逻辑与jquery 的 data 是不一致的，所有的数据都是保存在 DOM 上的
         *
         * // get
         * attribute.data(ele, 'abc');
         * // => "123"
         * attribute.data(ele, ['abc', 'def']);
         * // 数据会优先被 JSON 解析，如果解析失败将返回原始字符串
         * // => {a: 1, b: 2}
         */
        data: function (ele, dataKey, dataVal) {
            return _getSet(arguments, {
                get: function (dataKey) {
                    var ret = ele.dataset[_toHumpString(dataKey)];

                    try{
                        return JSON.parse(ret);
                    }catch(err){
                        return ret;
                    }
                },
                set: function (dataKey, dataVal) {
                    if (data.type(dataVal) === 'object') {
                        try {
                            dataVal = JSON.stringify(dataVal);
                        } catch (err) {
                            dataVal = '';
                        }
                    }
                    ele.dataset[_toHumpString(dataKey)] = dataVal;
                }
            });
        },
        /**
         * 设置、获取元素的innerHTML
         * @param {HTMLElement} ele 元素
         * @param {String}      [html] html字符串
         * @returns {String/Undefined}
         *
         * @example
         * // set
         * attribute.html(ele, 'html');
         *
         * // get
         * attribute.html(ele);
         */
        html: function (ele, html) {
            return _getSet(arguments, {
                get: function () {
                    return ele.innerHTML;
                },
                set: function (html) {
                    ele.innerHTML = html;
                }
            }, 1);
        },
        /**
         * 设置、获取元素的innerText
         * @param {HTMLElement} ele 元素
         * @param {String}      [text]  text字符串
         * @returns {String/Undefined}
         *
         * @example
         * // set
         * attribute.text(ele, 'html');
         *
         * // get
         * attribute.text(ele);
         */
        text: function (ele, text) {
            return _getSet(arguments, {
                get: function () {
                    return ele.innerText;
                },
                set: function (text) {
                    ele.innerText = text;
                }
            }, 1);
        },
        /**
         * 添加元素的className
         * @param {HTMLElement} ele 元素
         * @param {String} className 多个className使用空格分开
         * @returns {Undefined}
         *
         * @example
         * attribute.addClass(ele, 'class');
         * attribute.addClass(ele, 'class1 class2');
         */
        addClass: function (ele, className) {
            _class(ele, 0, className);
        },
        /**
         * 移除元素的className
         * @param {HTMLElement} ele 元素
         * @param {String} [className] 多个className使用空格分开，留空表示移除所有className
         * @returns {Undefined}
         *
         * @example
         * // remove all className
         * attribute.removeClass(ele);
         * attribute.removeClass(ele, 'class');
         * attribute.removeClass(ele, 'class1 class2');
         */
        removeClass: function (ele, className) {
            _class(ele, 1, className);
        },
        /**
         * 判断元素是否包含某个className
         * @param {HTMLElement} ele 元素
         * @param {String} className 单个className
         * @returns {Boolean}
         *
         * @example
         * attribute.hasClass(ele, 'class');
         */
        hasClass: function (ele, className) {
            return _class(ele, 2, className);
        }
    };


    /**
     * 转换字符串为驼峰格式
     * @param {String} string 原始字符串
     * @returns {String} string 格式化后的字符串
     * @private
     */
    function _toHumpString(string) {
        return string.replace(regSep, '').replace(regHump, function ($0, $1) {
            return $1.toUpperCase();
        });
    }

    /**
     * 转换驼峰为分隔字符串
     * @param {String} string 原始字符串
     * @returns {String} string  格式化后的字符串
     * @private
     */
    function _toSepString(string) {
        return string.replace(regSep, '').replace(regSplit, function ($0) {
            return '-' + $0.toLowerCase();
        });
    }


    /**
     * 转换纯数字的css属性为字符，如：width=100 => width=100px
     * @param {String} key css属性
     * @param {String|Number} val css属性值
     * @returns {*}
     * @private
     */
    function _toCssVal(key, val) {
        if (!regPx.test(key)) {
            return val;
        }

        val += '';

        if (regNum.test(val)) {
            return val.replace(regEndPoint, '') + 'px';
        }

        return val;
    }


    /**
     * get set 传输派发
     * @param {Object} args   参数类数组
     * @param {Object} getSet 传输对象
     * @param {Number} [argumentsSetLength] 传输设置的参数个数，默认为2
     * @returns {*}
     * @private
     */
    function _getSet(args, getSet, argumentsSetLength) {
        args = [].slice.call(args, 1);
        argumentsSetLength = argumentsSetLength || 2;
        var arg0Type = data.type(args[0]);
        var ret = {};
        var argsLength = args.length;

        // .fn(ele);
        if (argsLength === 0) {
            return getSet.get();
        }
        // .fn(ele, 'name', '1');
        else if (argsLength === 2 && argumentsSetLength === 2) {
            return getSet.set(args[0], args[1]);
        }
        // .fn(ele, {name: 1, id: 2});
        else if (argsLength === 1 && arg0Type === 'object' && argumentsSetLength === 2) {
            data.each(args[0], function (key, val) {
                getSet.set(key, val);
            });
        }
        // .fn(ele, ['name', 'id']);
        else if (argsLength === 1 && arg0Type === 'array' && argumentsSetLength === 2) {
            data.each(args[0], function (index, key) {
                ret[key] = getSet.get(key);
            });
            return ret;
        }
        // .fn(ele, 'name');
        else if (argsLength === 1 && arg0Type === 'string') {
            return argumentsSetLength === 1 ?
                getSet.set(args[0]) :
                getSet.get(args[0]);
        }
    }


    /**
     * 操作元素的className
     * @param {HTMLElement} ele 元素
     * @param {Number} type 操作类型，0=add，1=remove，2=has
     * @param {String} [className] 样式名称，多个样式使用空格分开
     * @returns {*}
     * @private
     */
    function _class(ele, type, className) {

        if (data.type(ele) !== 'element') {
            return;
        }

        var classNames;

        if (className) {
            classNames = className.trim().split(regSpace);
        }

        var classList = ele.classList;

        switch (type) {
            // addClass
            case 0:
                data.each(classNames, function (index, klass) {
                    if (klass) {
                        classList.add(klass);
                    }
                });
                break;

            // removeClass
            case 1:
                if (classNames && classNames.length) {
                    data.each(classNames, function (index, klass) {
                        if (klass) {
                            classList.remove(klass);
                        }
                    });
                } else {
                    ele.className = '';
                }
                break;

            // hasClass
            case 2:
                return classList.contains(classNames[0]);

        }
    }
});