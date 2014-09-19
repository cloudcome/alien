/*!
 * dom-attribute.js
 * @author ydr.me
 * 2014-09-16 18:30
 */


define(function (require, exports, module) {
    /**
     * @module core/dom/attribute
     */
    'use strict';

    var regHump = /-(\w)/g;
    var regSep = /^-+|-+$/g;
    var regSplit = /[A-Z]/g;
    var regSpace = /\s+/;
    var data = require('../../util/data.js');

    module.exports = {
        /**
         * 设置、获取元素的特征
         * @param {HTMLElement} element            元素
         * @param {String/Object/Array} attrkey    特征键、键值对、键数组
         * @param {String} [attrVal]               特征值
         * @returns {*}
         */
        attr: function attr(element, attrkey, attrVal) {
            return _getSet(arguments, {
                get: function (attrKey) {
                    return element.getAttribute(attrKey);
                },
                set: function (attrkey, attrVal) {
                    element.setAttribute(attrkey, attrVal);
                }
            });
        },
        /**
         * 判断元素是否包含某个特征
         * @param {HTMLElement} element 元素
         * @param {String} attrKey 单个特征
         * @returns {boolean}
         */
        hasAttr: function hasAttr(element, attrKey) {
            return element.hasAttribute(attrKey);
        },
        /**
         * 移除元素的某个特征
         * @param {HTMLElement} element 元素
         * @param {String} [attrKey] 单个或多个特征属性，为空表示移除所有特征
         */
        removeAttr: function removeAttr(element, attrKey) {
            var attrKeys = attrKey ? attrKey.split(regSpace) : element.attributes;

            data.each(attrKeys, function (index, attrKey) {
                if (attrKey) {
                    element.removeAttribute(data.type(attrKey) === 'attr' ? attrKey.nodeName : attrKey);
                }
            });
        },
        /**
         * 设置、获取元素的属性
         * @param {HTMLElement} element 元素
         * @param {String/Object/Array} propKey 属性键、键值对、键数组
         * @param {String} [propVal] 属性值
         * @returns {*}
         */
        prop: function prop(element, propKey, propVal) {
            return _getSet(arguments, {
                get: function (propKey) {
                    return element[propKey];
                },
                set: function (propKey, propVal) {
                    element[propKey] = propVal;
                }
            });
        },
        /**
         * 设置、获取元素的样式
         * @param {HTMLElement} element 元素
         * @param {String/Object/Array} cssKey 样式属性、样式键值对、样式属性数组，
         *                                     样式属性可以写成`width:after`（伪元素的width）或`width`（实际元素的width）
         * @param {String} [cssVal] 样式属性值
         * @returns {*}
         */
        css: function css(element, cssKey, cssVal) {
            return _getSet(arguments, {
                get: function (cssKey) {
                    var temp = cssKey.split(':');
                    var pseudo = temp[temp.length - 1];

                    cssKey = temp[0];
                    pseudo = pseudo ? pseudo : null;
                    return getComputedStyle(element, pseudo)[_toSepString(cssKey)];
                },
                set: function (cssKey, cssVal) {
                    cssKey = cssKey.split(':')[0];
                    element.style[_toSepString(cssKey)] = cssVal;
                }
            });
        },
        /**
         * 设置、获取元素的数据集
         * @param {HTMLElement} element 元素
         * @param {String/Object/Array} dataKey 数据集键、键值对、键数组
         * @param {String} [dataVal] 数据集值
         * @returns {*}
         */
        data: function data(element, dataKey, dataVal) {
            return _getSet(arguments, {
                get: function (dataKey) {
                    return element.dataset[_toHumpString(dataKey)];
                },
                set: function (dataKey, dataVal) {
                    if (data.type(dataVal) === 'object') {
                        try {
                            dataVal = JSON.stringify(dataVal);
                        } catch (err) {
                            dataVal = '';
                        }
                    }
                    element.dataset[_toHumpString(dataKey)] = dataVal;
                }
            });
        },
        /**
         * 设置、获取元素的innerHTML
         * @param {HTMLElement} element 元素
         * @param {String}      [html] html字符串
         * @returns {String/Undefined}
         */
        html: function html(element, html) {
            return _getSet(arguments, {
                get: function () {
                    return element.innerHTML;
                },
                set: function (html) {
                    element.innerHTML = html;
                }
            }, 1);
        },
        /**
         * 设置、获取元素的innerText
         * @param {HTMLElement} element 元素
         * @param {String}      [text]  text字符串
         * @returns {String/Undefined}
         */
        text: function text(element, text) {
            return _getSet(arguments, {
                get: function () {
                    return element.innerText;
                },
                set: function (text) {
                    element.innerText = text;
                }
            }, 1);
        },
        /**
         * 添加元素的className
         * @param {HTMLElement} element 元素
         * @param {String} className 多个className使用空格分开
         * @returns {Undefined}
         */
        addClass: function addClass(element, className) {
            _class(element, 0, className);
        },
        /**
         * 移除元素的className
         * @param {HTMLElement} element 元素
         * @param {String} [className] 多个className使用空格分开，留空表示移除所有className
         * @returns {Undefined}
         */
        removeClass: function removeClass(element, className) {
            _class(element, 1, className);
        },
        /**
         * 判断元素是否包含某个className
         * @param {HTMLElement} element 元素
         * @param {String} className 单个className
         * @returns {Boolean}
         */
        hasClass: function hasClass(element, className) {
            return _class(element, 2, className);
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

        // .fn(element);
        if (argsLength === 0) {
            return getSet.get();
        }
        // .fn(element, 'name', '1');
        else if (argsLength === 2 && argumentsSetLength === 2) {
            return getSet.set(args[0], args[1]);
        }
        // .fn(element, {name: 1, id: 2});
        else if (argsLength === 1 && arg0Type === 'object' && argumentsSetLength === 2) {
            data.each(args[0], function (key, val) {
                getSet.set(key, val);
            });
        }
        // .fn(element, ['name', 'id']);
        else if (argsLength === 1 && arg0Type === 'array' && argumentsSetLength === 2) {
            data.each(args[0], function (index, key) {
                ret[key] = getSet.get(key);
            });
            return ret;
        }
        // .fn(element, 'name');
        else if (argsLength === 1 && arg0Type === 'string') {
            return argumentsSetLength === 1 ?
                getSet.set(args[0]) :
                getSet.get(args[0]);
        }
    }


    /**
     * 操作元素的className
     * @param {HTMLElement} element 元素
     * @param {Number} type 操作类型，0=add，1=remove，2=has
     * @param {String} [className] 样式名称，多个样式使用空格分开
     * @returns {Boolean}
     * @private
     */
    function _class(element, type, className) {
        var classNames;

        if (className) {
            classNames = className.trim().split(regSpace);
        }

        var classList = element.classList;

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
                    element.className = '';
                }
                break;

            // hasClass
            case 2:
                return classList.contains(classNames[0]);

        }
    }
});