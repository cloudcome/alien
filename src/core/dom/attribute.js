/*!
 * dom-attribute.js
 * @author ydr.me
 * 2014-09-16 18:30
 */


define(function (require, exports, module) {
    /**
     * 处理有关 dom 属性的 API
     * @module core/dom/attribute
     * @requires util/dato
     * @requires util/typeis
     * @requires core/navigator/compatible
     * @requires core/dom/selector
     */
    'use strict';

    var regHump = /-(\w)/g;
    var regSep = /^-+|-+$/g;
    var regSplit = /[A-Z]/g;
    var regSpace = /\s+/;
    var dato = require('../../util/dato.js');
    var typeis = require('../../util/typeis.js');
    var compatible = require('../navigator/compatible.js');
    var selector = require('./selector.js');
    var REG_PX = /margin|width|height|padding|top|right|bottom|left/i;
    var REG_TRANSFORM = /translate|scale|skew|rotate|matrix|perspective/i;
    var REG_IMPORTANT = /\s!important$/i;
    // +123.456
    // -123.456
    var regNum = /^[+\-]?\d+(\.\d*)?$/;
    var regEndPoint = /\.$/;
    var innerWidth = ['borderLeftWidth', 'borderRightWidth'];
    var width = innerWidth.concat(['paddingLeft', 'paddingRight']);
    var innerHeight = ['borderTopWidth', 'borderBottomWidth'];
    var height = innerHeight.concat(['paddingTop', 'paddingBottom']);

    var attribute = module.exports = {
        /**
         * 设置、获取元素的属性
         * @param {HTMLElement} ele 元素
         * @param {String/Object/Array} key 特征键、键值对、键数组
         * @param {String} [val] 特征值
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
        attr: function (ele, key, val) {
            if (!ele || ele.nodeType !== 1 || !key) {
                return;
            }

            return _getSet(arguments, {
                get: function (key) {
                    return ele.getAttribute(key);
                },
                set: function (key, val) {
                    ele.setAttribute(key, val);
                }
            });
        },


        /**
         * 判断元素是否包含某个属性
         * @param {HTMLElement} ele 元素
         * @param {String} key 单个特征
         * @returns {boolean}
         *
         * @example
         * // 判断是否有某个属性
         * attribute.hasAttr(ele, 'href');
         * // => true
         */
        hasAttr: function (ele, key) {
            if (!ele || ele.nodeType !== 1 || !key) {
                return !1;
            }

            return ele.hasAttribute(key);
        },


        /**
         * 移除元素的某个属性
         * @param {HTMLElement} ele 元素
         * @param {String} [key] 单个或多个特征属性，为空表示移除所有特征
         *
         * @example
         * // 移除
         * attribute.removeAttr(ele, 'href');
         */
        removeAttr: function (ele, key) {
            if (!ele || ele.nodeType !== 1) {
                return;
            }

            var attrKeys = key ? key.split(regSpace) : ele.attributes;

            dato.each(attrKeys, function (index, key) {
                if (key) {
                    ele.removeAttribute(typeis(key) === 'attr' ? key.nodeName : key);
                }
            });
        },


        /**
         * 设置、获取元素的特性
         * @param {HTMLElement} ele 元素
         * @param {String/Object/Array} key 特性键、特性键值对、特性组
         * @param {*} [val] 特性值
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
        prop: function (ele, key, val) {
            return _getSet(arguments, {
                get: function (key) {
                    return ele[key];
                },
                set: function (key, val) {
                    ele[key] = val;
                }
            });
        },


        /**
         * 修正 css 键值
         * @param {String} key css 键
         * @param {*} [val] css 值
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
            val = String(val).trim();

            var important = null;

            if (REG_IMPORTANT.test(val)) {
                important = 'important';
                val = val.replace(REG_IMPORTANT, '');
            }

            if (REG_TRANSFORM.test(key)) {
                val = key + '(' + val + ')';
                key = 'transform';
            }

            return {
                key: compatible.css3(_toSepString(key)),
                val: _toCssVal(key, val),
                important: important
            };
        },


        /**
         * 设置、获取元素的样式
         * @param {HTMLElement|Node} ele 元素
         * @param {String/Object/Array} key 样式属性、样式键值对、样式属性数组，
         *                                     样式属性可以写成`width::after`（伪元素的width）或`width`（实际元素的width）
         * @param {String|Number} [val] 样式属性值
         * @returns {*}
         *
         * @example
         * // set
         * attribute.css(ele, 'width', 100);
         * attribute.css(ele, 'width', 100);
         * attribute.css(ele, {
         *    width: 100,
         *    height: '200px !important'
         * });
         *
         * // get
         * attribute.css(ele, 'width');
         * attribute.css(ele, 'width::after');
         * attribute.css(ele, ['width','height']);
         */
        css: function (ele, key, val) {
            if (!ele || ele.nodeType !== 1 || !key) {
                return;
            }

            var the = this;

            return _getSet(arguments, {
                get: function (key) {
                    var temp = key.split('::');
                    var pseudo = temp.length === 1 ? null : temp[temp.length - 1];

                    key = temp[0];
                    pseudo = pseudo ? pseudo : null;
                    return getComputedStyle(ele, pseudo).getPropertyValue(_toSepString(key));
                },
                set: function (key, val) {
                    key = key.split('::')[0];

                    var fix = the.fixCss(key, val);

                    // ele.style[fix.key] = fix.val;
                    // 样式名, 样式值, 优先级
                    // object.setProperty (propertyName, propertyValue, priority);
                    ele.style.setProperty(fix.key, fix.val, fix.important);
                }
            });
        },


        /**
         * 设置、获取元素的滚动条高度
         * @param ele {HTMLElement|Node|window|document} 元素
         * @param [top] {Number} 高度
         * @returns {number|*}
         *
         * @example
         * // get
         * attribute.scrollTop(ele);
         *
         * // set
         * attribute.scrollTop(ele, 100);
         */
        scrollTop: function (ele, top) {
            if (top === undefined) {
                return _isDispute(ele) ? Math.abs(document.body.scrollTop, document.documentElement.scrollTop) : ele.scrollTop;
            }

            if (_isDispute(ele)) {
                document.body.scrollTop = top;
                document.documentElement.scrollTop = top;
            } else {
                ele.scrollTop = top;
            }
        },


        /**
         * 设置、获取元素的滚动条左距离
         * @param ele {HTMLElement|Node|window|document} 元素
         * @param [left] {Number} 高度
         * @returns {number|*}
         *
         * @example
         * // get
         * attribute.scrollLeft(ele);
         *
         * // set
         * attribute.scrollLeft(ele, 100);
         */
        scrollLeft: function (ele, left) {
            if (left === undefined) {
                return _isDispute(ele) ? Math.abs(document.body.scrollLeft, document.documentElement.scrollLeft) : ele.scrollLeft;
            }

            if (_isDispute(ele)) {
                document.body.scrollLeft = left;
                document.documentElement.scrollLeft = left;
            } else {
                ele.scrollLeft = left;
            }
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
        data: function (ele, key, val) {
            if (!ele || ele.nodeType !== 1 || !key) {
                return;
            }

            return _getSet(arguments, {
                get: function (key) {
                    var ret = ele.dataset[_toHumpString(key)];

                    try {
                        return JSON.parse(ret);
                    } catch (err) {
                        return ret;
                    }
                },
                set: function (key, val) {
                    if (typeis(val) === 'object') {
                        try {
                            val = JSON.stringify(val);
                        } catch (err) {
                            val = '';
                        }
                    }
                    ele.dataset[_toHumpString(key)] = val;
                }
            });
        },


        /**
         * 设置、获取元素的innerHTML
         * @param {HTMLElement} ele 元素
         * @param {String}      [html] html字符串
         * @returns {String|undefined}
         *
         * @example
         * // set
         * attribute.html(ele, 'html');
         *
         * // get
         * attribute.html(ele);
         */
        html: function (ele, html) {
            if (!ele || ele.nodeType !== 1) {
                return;
            }

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
         * @returns {String|undefined}
         *
         * @example
         * // set
         * attribute.text(ele, 'html');
         *
         * // get
         * attribute.text(ele);
         */
        text: function (ele, text) {
            if (!ele || ele.nodeType !== 1) {
                return;
            }

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
         * @returns {undefined}
         *
         * @example
         * attribute.addClass(ele, 'class');
         * attribute.addClass(ele, 'class1 class2');
         */
        addClass: function (ele, className) {
            if (!ele || ele.nodeType !== 1) {
                return;
            }

            _class(ele, 0, className);
        },


        /**
         * 移除元素的className
         * @param {HTMLElement} ele 元素
         * @param {String} [className] 多个className使用空格分开，留空表示移除所有className
         * @returns {undefined}
         *
         * @example
         * // remove all className
         * attribute.removeClass(ele);
         * attribute.removeClass(ele, 'class');
         * attribute.removeClass(ele, 'class1 class2');
         */
        removeClass: function (ele, className) {
            if (!ele || ele.nodeType !== 1) {
                return;
            }

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
            if (!ele || ele.nodeType !== 1) {
                return !1;
            }

            return _class(ele, 2, className);
        },

        /**
         * 获得某元素的状况，可能值为`show`或`hide`
         * @param {HTMLElement|Node} ele 元素
         * @param {String} [state] 设置状态值，`show`或者`hide`
         * @returns {String|Array} 获取值为`show`或`hide`，设置时返回改变过的 dom 数组
         */
        state: function (ele, state) {
            var nowState;
            var temp;
            var ret = [];
            var key = 'display';
            var none = 'none';
            var block = 'block';

            // get
            if (!state) {
                if (!ele || ele.nodeType !== 1) {
                    return 'hide';
                }

                // 本身就是隐藏的
                if (this.css(ele, key) === none) {
                    return 'hide';
                }

                while ((temp = selector.parent(ele)) && temp.length) {
                    ele = temp[0];

                    if (this.css(ele, key) === none) {
                        return 'hide';
                    }
                }

                return 'show';
            }

            // set
            nowState = this.state(ele);

            if (nowState === state || !ele || ele.nodeType !== 1) {
                return ret;
            }

            if (nowState === 'show') {
                ele.style.display = none;
            } else {
                while (this.state(ele) !== state) {
                    if (this.css(ele, key) === none) {
                        this.css(ele, key, block);
                        ret.push(ele);
                    }

                    if ((temp = selector.parent(ele)) && temp.length) {
                        ele = temp[0];
                    }
                }
            }

            return ret;
        },


        /**
         * 获取、设置元素距离文档边缘的 top 距离
         * @param {Element} ele
         * @param {Number} [val] 距离值
         * @returns {Number|undefined|*}
         *
         * @example
         * // set
         * position.top(ele, 100);
         *
         * // get
         * position.top(ele);
         */
        top: function () {
            return _middleware('top', arguments);
        },


        /**
         * 获取、设置元素距离文档边缘的 left 距离
         * @param {Element} ele
         * @param {Number} [val] 距离值
         * @returns {Number|undefined|*}
         *
         * @example
         * // set
         * position.left(ele, 100);
         *
         * // get
         * position.left(ele);
         */
        left: function () {
            return _middleware('left', arguments);
        },


        /**
         * 获取、设置元素的占位宽度
         * content-box: cssWidth + padding + border
         * border-box:  cssWidth
         * @param {Element} ele
         * @param {Number} [val] 宽度值
         * @returns {Number|undefined|*}
         *
         * @example
         * // set
         * position.width(ele, 100);
         *
         * // get
         * position.width(ele);
         */
        outerWidth: function () {
            return _middleware('width', arguments);
        },


        innerWidth: function () {
            return _middleware('width', arguments, innerWidth);
        },

        width: function () {
            return _middleware('width', arguments, width);
        },


        /**
         * 获取、设置元素的占位高度
         * content-box: cssHeight + padding + border
         * border-box:  cssHeight
         * @param {Element} ele
         * @param {Number} [val] 高度值
         * @returns {Number|undefined|*}
         *
         * @example
         * // set
         * position.height(ele, 100);
         *
         * // get
         * position.height(ele);
         */
        outerHeight: function () {
            return _middleware('height', arguments);
        },
        innerHeight: function () {
            return _middleware('height', arguments, innerHeight);
        },
        height: function () {
            return _middleware('height', arguments, height);
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
        return regHump.test(string) ?
            string :
            string.replace(regSep, '').replace(regSplit, function ($0) {
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
        if (!REG_PX.test(key)) {
            return val;
        }

        val += '';

        if (regNum.test(val)) {
            return val.replace(regEndPoint, '') + 'px';
        }

        return val;
    }


    /**
     * 是否为有争议的 ele
     * @param ele
     * @returns {boolean}
     * @private
     */
    function _isDispute(ele) {
        return ele === window || ele === document || ele === document.body || ele === document.documentElement;
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
        var arg0Type = typeis(args[0]);
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
            dato.each(args[0], function (key, val) {
                getSet.set(key, val);
            });
        }
        // .fn(ele, ['name', 'id']);
        else if (argsLength === 1 && arg0Type === 'array' && argumentsSetLength === 2) {
            dato.each(args[0], function (index, key) {
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

        if (typeis(ele) !== 'element') {
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
                dato.each(classNames, function (index, klass) {
                    if (klass) {
                        classList.add(klass);
                    }
                });
                break;

            // removeClass
            case 1:
                if (classNames && classNames.length) {
                    dato.each(classNames, function (index, klass) {
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


    /**
     * 中间件
     * @param {String} key 求值类型
     * @param {Array} args 参数数组
     * @param {Array} extraKey 额外附加
     * @returns {Number|undefined|*}
     * @private
     */
    function _middleware(key, args, extraKey) {
        var ele;
        var eleType;
        var argsLength = args.length;
        var extraVal = 0;

        if (argsLength) {
            ele = args[0];
            eleType = typeis(ele);

            if (extraKey && eleType === 'element') {
                dato.each(extraKey, function (i, key) {
                    extraVal += dato.parseFloat(attribute.css(ele, key), 0);
                });
            }

            // 切换显隐
            return _swap(ele, function () {
                // get
                if (argsLength === 1) {
                    switch (eleType) {
                        case 'element':
                            return ele.getBoundingClientRect()[key] - extraVal;

                        case 'window':
                            return window['inner' + (key === 'width' ? 'Width' : 'Height')];

                        case 'document':
                            return document.documentElement.getBoundingClientRect()[key];
                    }
                }
                // set
                else if (argsLength === 2 && eleType === 'element' && typeis(args[1]) === 'number') {
                    _setBoundingClientRect(ele, key, args[1] + extraVal);
                }
            });
        }
    }


    /**
     * 设置元素的位置
     * @param {Element} ele 元素
     * @param {String} key 键名
     * @param {Number} val 键值
     * @private
     */
    function _setBoundingClientRect(ele, key, val) {
        var elePos = attribute.css(ele, 'position');
        var rect;
        var now;
        var width;
        var height;
        var deleta;
        var css;

        // 绝对定位的元素，先设置其 top、left值
        if (elePos === 'absolute') {
            attribute.css(ele, {
                top: ele.offsetTop,
                left: ele.offsetLeft
            });
        }

        rect = ele.getBoundingClientRect();
        now = rect[key];
        width = rect.width;
        height = rect.height;
        deleta = val - now;

        if (attribute.css(ele, 'position') === 'static' && key !== 'width' && key !== 'height') {
            css = dato.parseFloat(attribute.css(ele, 'margin-' + key), 0);
            attribute.css(ele, 'margin-' + key, css + deleta);
        } else {
            css = dato.parseFloat(attribute.css(ele, key), 0);
            attribute.css(ele, key, css + deleta);
        }
    }

    /**
     * 切换显隐状态来计算元素尺寸
     * @param {HTMLElement} ele 元素
     * @param {Function} doWhat 做
     * @private
     */
    function _swap(ele, doWhat) {
        var eles;
        var ret;

        if (attribute.state(ele) === 'show') {
            return doWhat(ele);
        } else {
            eles = attribute.state(ele, 'show');

            ret = doWhat(ele);

            dato.each(eles, function (index, ele) {
                ele.style.display = '';
            });

            return ret;
        }
    }
});