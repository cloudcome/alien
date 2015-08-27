/*!
 * 核心 dom 属性器
 * @author ydr.me
 * 2014-09-16 18:30
 */


define(function (require, exports, module) {
    /**
     * @module core/dom/attribute
     * @requires utils/matrix
     * @requires utils/dato
     * @requires utils/number
     * @requires utils/typeis
     * @requires core/navigator/compatible
     * @requires core/dom/selector
     * @requires core/dom/see
     */
    'use strict';

    var regHump = /-(\w)/g;
    var regSep = /^-+|-+$/g;
    var regSplit = /[A-Z]/g;
    var regSpace = /\s+/;
    var matrix = require('../../utils/matrix.js');
    var dato = require('../../utils/dato.js');
    var number = require('../../utils/number.js');
    var string = require('../../utils/string.js');
    var typeis = require('../../utils/typeis.js');
    var compatible = require('../navigator/compatible.js');
    var selector = require('./selector.js');
    var see = require('./see.js');
    var allocation = require('../../utils/allocation.js');
    var REG_PX = /margin|width|height|padding|top|right|bottom|left|translate|font/i;
    var REG_DEG = /rotate|skew/i;
    var REG_TRANSFORM_WORD = /translate|scale|skew|rotate|matrix|perspective/i;
    var REG_IMPORTANT = /\s!important$/i;
    var REG_TRANSFORM_KEY = /transform/i;
    var REG_PERCENT = /%/;
    // +123.456
    // -123.456
    var regNum = /^[+\-]?\d+(\.\d*)?$/;
    var regEndPoint = /\.$/;
    var innerWidth = ['borderLeftWidth', 'borderRightWidth'];
    var width = innerWidth.concat(['paddingLeft', 'paddingRight']);
    var innerHeight = ['borderTopWidth', 'borderBottomWidth'];
    var height = innerHeight.concat(['paddingTop', 'paddingBottom']);
    var alienKey = '-alien-core-dom-attribute-';
    var win = window;
    var doc = win.document;
    var html = doc.documentElement;
    var body = doc.body;
    var isRelativeToViewport = _isRelativeToViewport();


    /**
     * 设置、获取元素的属性
     * @param {HTMLElement|Node} ele 元素
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
    exports.attr = function (ele, key, val) {
        return _getSet(arguments, {
            get: function (ele, key) {
                if (!typeis.element(ele)) {
                    return;
                }

                return ele.getAttribute(key);
            },
            set: function (ele, key, val) {
                if (!typeis.element(ele)) {
                    return;
                }

                ele.setAttribute(key, val);
            }
        });
    };


    /**
     * 判断元素是否包含某个属性
     * @param {HTMLElement|Node} ele 元素
     * @param {String} key 单个特征
     * @returns {boolean}
     *
     * @example
     * // 判断是否有某个属性
     * attribute.hasAttr(ele, 'href');
     * // => true
     */
    exports.hasAttr = function (ele, key) {
        if (!typeis.element(ele)) {
            return false;
        }

        return ele.hasAttribute(key);
    };


    /**
     * 移除元素的某个属性
     * @param {HTMLElement|Node} ele 元素
     * @param {String} [key] 单个或多个特征属性，为空表示移除所有特征
     *
     * @example
     * // 移除
     * attribute.removeAttr(ele, 'href');
     */
    exports.removeAttr = function (ele, key) {
        if (!ele || ele.nodeType !== 1) {
            return;
        }

        var attrKeys = key ? key.split(regSpace) : ele.attributes;

        dato.each(attrKeys, function (index, key) {
            if (key) {
                ele.removeAttribute(typeis(key) === 'attr' ? key.nodeName : key);
            }
        });
    };


    /**
     * 设置、获取元素的特性
     * @param {HTMLElement|Node} ele 元素
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
    exports.prop = function (ele, key, val) {
        return _getSet(arguments, {
            get: function (ele, key) {
                return ele[key];
            },
            set: function (ele, key, val) {
                ele[key] = val;
            }
        });
    };


    /**
     * 修正 css 键值
     * @param {String} key css 键
     * @param {*} [val] css 值
     * @returns {{key: String, val: *}}
     *
     * @example
     * attribute.fixCss('translateX', 10);
     * // =>
     * // {
     * //    key: 'transform',
     * //    val: 'translateX(10px)',
     * //    imp: false
     * // }
     *
     * attribute.fixCss('marginTop', '10px !important');
     * // =>
     * // {
     * //    key: 'margin-top',
     * //    val: '10px',
     * //    imp: true
     * // }
     */
    exports.fixCss = function (key, val) {
        val = val === null ? '' : String(val).trim();

        var important = null;

        if (REG_IMPORTANT.test(val)) {
            important = 'important';
            val = val.replace(REG_IMPORTANT, '');
        }

        var fixkey = key;
        var fixVal = _toCssVal(key, val);

        if (REG_TRANSFORM_WORD.test(key)) {
            fixkey = 'transform';
            fixVal = key + '(' + fixVal + ')';
        }

        return {
            key: compatible.css3(_toSepString(fixkey)),
            val: compatible.css3(fixVal) || fixVal,
            imp: important
        };
    };


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
    exports.css = exports.style = function (ele, key, val) {
        var transformKey = '';
        var important = '';

        return _getSet(arguments, {
            get: function (ele, key) {
                if (!typeis.element(ele)) {
                    return;
                }

                var temp = key.split('::');
                var pseudo = temp.length === 1 ? null : temp[temp.length - 1];

                key = temp[0];

                if (key && REG_TRANSFORM_WORD.test(key)) {
                    return _toCssVal(key, _getEleTransform(ele, key));
                }

                pseudo = pseudo ? pseudo : null;
                return getComputedStyle(ele, pseudo).getPropertyValue(_toSepString(key));
            },
            set: function (ele, key, val) {
                if (!typeis.element(ele)) {
                    return;
                }

                key = key.split('::', 1)[0];

                var fix = exports.fixCss(key, val);

                if (fix.key && REG_TRANSFORM_KEY.test(fix.key)) {
                    transformKey = fix.key;
                    _setEleTransform(ele, key, val);

                    if (!important && fix.imp) {
                        important = fix.imp;
                    }
                } else {
                    // 样式名, 样式值, 优先级
                    // object.setProperty (propertyName, propertyValue, priority);
                    ele.style.setProperty(fix.key, fix.val, fix.imp);
                }
            },
            onset: function () {
                if (transformKey) {
                    ele.style.setProperty(transformKey, _calEleTransform(ele), important);
                }
            }
        });
    };


    /**
     * 设置元素可见
     * @param $ele
     */
    exports.show = function ($ele) {
        exports.css($ele, 'display', see.getDisplay($ele));
    };


    /**
     * 设置元素不可见
     * @param $ele
     */
    exports.hide = function ($ele) {
        exports.css($ele, 'display', 'none');
    };


    /**
     * 设置、获取元素的滚动条高度
     * @param ele {HTMLElement|Node|Window|Document|Object} 元素
     * @param [top] {Number} 高度
     * @returns {number|undefined}
     *
     * @example
     * // get
     * attribute.scrollTop(ele);
     *
     * // set
     * attribute.scrollTop(ele, 100);
     */
    exports.scrollTop = function (ele, top) {
        ele = selector.query(ele)[0];

        if (typeis.undefined(top)) {
            return _isDispute(ele) ? Math.max(body.scrollTop, html.scrollTop) : ele.scrollTop;
        }

        if (_isDispute(ele)) {
            body.scrollTop = top;
            html.scrollTop = top;
        } else {
            ele.scrollTop = top;
        }
    };


    /**
     * 设置、获取元素的滚动条左距离
     * @param ele {HTMLElement|Node|Window|Document|Object} 元素
     * @param [left] {Number} 高度
     * @returns {number|undefined}
     *
     * @example
     * // get
     * attribute.scrollLeft(ele);
     *
     * // set
     * attribute.scrollLeft(ele, 100);
     */
    exports.scrollLeft = function (ele, left) {
        ele = selector.query(ele)[0];

        if (typeis.undefined(left)) {
            return _isDispute(ele) ? Math.max(body.scrollLeft, html.scrollLeft) : ele.scrollLeft;
        }

        if (_isDispute(ele)) {
            body.scrollLeft = left;
            html.scrollLeft = left;
        } else {
            ele.scrollLeft = left;
        }
    };


    /**
     * 设置、获取元素的数据集
     * @param {Object} ele 元素
     * @param {String/Object/Array} key 数据集键、键值对、键数组
     * @param {String} [val] 数据集值
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
    exports.data = function (ele, key, val) {
        return _getSet(arguments, {
            get: function (ele, key) {
                if (!typeis.element(ele)) {
                    return;
                }

                var dataset = ele.dataset || {};
                var ret = dataset[string.humprize(key)];

                try {
                    ret = JSON.parse(ret);
                } catch (err1) {
                    try {
                        /* jshint evil: true */
                        var fn = new Function('', 'return ' + ret);
                        ret = fn();
                    } catch (err2) {
                        // ignore
                    }
                }

                return ret;
            },
            set: function (ele, key, val) {
                if (!typeis.element(ele)) {
                    return;
                }

                if (typeis(val) === 'object') {
                    try {
                        val = JSON.stringify(val);
                    } catch (err) {
                        val = '';
                    }
                }
                ele.dataset[string.humprize(key)] = val;
            }
        });
    };


    /**
     * 移除元素的数据集
     * @param $ele {HTMLElement|Node} 元素
     * @param key {String} 键
     * @returns {*}
     */
    exports.removeData = function ($ele, key) {
        if (!typeis.element($ele)) {
            return;
        }

        return exports.removeAttr($ele, 'data-' + key);
    };


    /**
     * 设置、获取元素的innerHTML
     * @param {Object} $ele 元素
     * @param {String} [html] html字符串
     * @returns {String|undefined}
     *
     * @example
     * // set
     * attribute.html(ele, 'html');
     *
     * // get
     * attribute.html(ele);
     */
    exports.html = function ($ele, html) {
        return _getSet(arguments, {
            get: function ($ele) {
                if (!typeis.element($ele)) {
                    return;
                }

                return $ele.innerHTML;
            },
            set: function (ele, html) {
                if (!typeis.element(ele)) {
                    return;
                }

                ele.innerHTML = html;
            }
        }, 1);
    };


    /**
     * 设置、获取元素的innerText
     * @param {Object} $ele 元素
     * @param {String} [text]  text字符串
     * @returns {String|undefined}
     *
     * @example
     * // set
     * attribute.text(ele, 'text');
     *
     * // get
     * attribute.text(ele);
     */
    exports.text = function ($ele, text) {
        return _getSet(arguments, {
            get: function ($ele) {
                if (!typeis.element($ele)) {
                    return null;
                }

                return $ele.innerText || $ele.textContent;
            },
            set: function (ele, text) {
                if (!typeis.element(ele)) {
                    return;
                }

                if ('innerText' in ele) {
                    ele.innerText = text;
                } else {
                    ele.textContent = text;
                }
            }
        }, 1);
    };


    /**
     * 添加元素的className
     * @param {Object} ele 元素
     * @param {String} className 多个className使用空格分开
     * @returns {undefined}
     *
     * @example
     * attribute.addClass(ele, 'class');
     * attribute.addClass(ele, 'class1 class2');
     */
    exports.addClass = function (ele, className) {
        var eles = typeis.array(ele) ? ele : [ele];

        dato.each(eles, function (i, ele) {
            _class(ele, 0, className);
        });
    };


    /**
     * 移除元素的className
     * @param {Object|Array} ele 元素
     * @param {String} [className] 多个className使用空格分开，留空表示移除所有className
     * @returns {undefined}
     *
     * @example
     * // remove all className
     * attribute.removeClass(ele);
     * attribute.removeClass(ele, 'class');
     * attribute.removeClass(ele, 'class1 class2');
     */
    exports.removeClass = function (ele, className) {
        var eles = typeis.array(ele) ? ele : [ele];

        dato.each(eles, function (i, ele) {
            _class(ele, 1, className);
        });
    };


    /**
     * 判断元素是否包含某个className
     * @param {HTMLElement|Node} ele 元素
     * @param {String} className 单个className
     * @returns {Boolean}
     *
     * @example
     * attribute.hasClass(ele, 'class');
     */
    exports.hasClass = function (ele, className) {
        return _class(ele, 2, className);
    };


    /**
     * 获取、设置元素距离文档边缘的 top 距离
     * @param {Object} $ele
     * @param {Number} [val] 距离值
     * @returns {Number|undefined|*}
     *
     * @example
     * // set
     * position.top($ele, 100);
     *
     * // get
     * position.top($ele);
     */
    exports.top = function ($ele, val) {
        return _middleware('top', arguments, ['scrollTop']);
    };


    /**
     * 获取、设置元素距离文档边缘的 left 距离
     * @param {Object} $ele
     * @param {Number} [val] 距离值
     * @returns {Number|undefined|*}
     *
     * @example
     * // set
     * position.left($ele, 100);
     *
     * // get
     * position.left($ele);
     */
    exports.left = function ($ele, val) {
        return _middleware('left', arguments, ['scrollLeft']);
    };


    /**
     * 获取、设置元素的占位宽度
     * content + padding + border
     * @param {Object} $ele
     * @param {Number} [val] 宽度值
     * @returns {Number|undefined|*}
     *
     * @example
     * // set
     * position.width($ele, 100);
     *
     * // get
     * position.width($ele);
     */
    exports.outerWidth = function ($ele, val) {
        return _middleware('width', arguments, []);
    };


    /**
     * 获取、设置元素的占位宽度
     * content + padding
     * @param {Object} $ele
     * @param {Number} [val] 宽度值
     * @returns {Number|undefined|*}
     *
     * @example
     * // set
     * position.width($ele, 100);
     *
     * // get
     * position.width($ele);
     */
    exports.innerWidth = function ($ele, val) {
        return _middleware('width', arguments, innerWidth);
    };


    /**
     * 获取、设置元素的占位宽度
     * content
     * @param {Object} $ele
     * @param {Number} [val] 宽度值
     * @returns {Number|undefined|*}
     *
     * @example
     * // set
     * position.width($ele, 100);
     *
     * // get
     * position.width($ele);
     */
    exports.width = function ($ele, val) {
        return _middleware('width', arguments, width);
    };


    /**
     * 获取、设置元素的占位高度
     * content + padding + border
     * @param {Object} $ele
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
    exports.outerHeight = function ($ele, val) {
        return _middleware('height', arguments, []);
    };


    /**
     * 获取、设置元素的占位高度
     * content + padding
     * @param {Object} $ele
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
    exports.innerHeight = function ($ele, val) {
        return _middleware('height', arguments, innerHeight);
    };


    /**
     * 获取、设置元素的占位高度
     * content
     * @param {Object} $ele
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
    exports.height = function ($ele, val) {
        return _middleware('height', arguments, height);
    };


    /**
     * 返回当前文档上处于指定坐标位置最顶层的可见元素,
     * 坐标是相对于包含该文档的浏览器窗口的左上角为原点来计算的,
     * 通常 x 和 y 坐标都应为正数.
     * @param clientX {Number} 元素位置x
     * @param clientY {Number} 元素位置y
     * @returns {HTMLElement}
     * @ref https://github.com/moll/js-element-from-point
     */
    exports.getElementFromPoint = function (clientX, clientY) {
        if (!isRelativeToViewport) {
            clientX += win.pageXOffset;
            clientY += win.pageYOffset;
        }

        return doc.elementFromPoint(clientX, clientY);
    };


    ////////////////////////////////////////////////////////////////////
    ////////////////////////////[ private ]/////////////////////////////
    ////////////////////////////////////////////////////////////////////


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
        val += '';

        if (!REG_PX.test(key) && !REG_DEG.test(key)) {
            return val;
        }

        if (regNum.test(val)) {
            return val.replace(regEndPoint, '') +
                (REG_PX.test(key) ? 'px' : 'deg');
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
        return ele === win || ele === doc || ele === body || ele === html;
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
        var $ele = args[0];

        return allocation.getset({
            get: function (key) {
                return getSet.get($ele, key);
            },
            set: function (key, val) {
                getSet.set($ele, key, val);
            },
            onset: getSet.onset
        }, [].slice.call(args, 1), argumentsSetLength);
    }


    /**
     * 操作元素的className
     * @param {HTMLElement|Node} ele 元素
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
                    if (klass && !_class(ele, 2, klass)) {
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
     * @param {Array} [extraKey] 额外附加
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

            if (ele !== win && ele !== doc && eleType !== 'element') {
                return;
            }

            if (extraKey.length && eleType === 'element') {
                dato.each(extraKey, function (i, key) {
                    extraVal += key.indexOf('scroll') > -1 ?
                        -number.parseFloat(exports[key](window), 0) :
                        number.parseFloat(exports.css(ele, key), 0);
                });
            }

            // 切换显隐
            return see.swap(ele, function () {
                // get
                if (argsLength === 1) {
                    var key2 = /w/.test(key) ? 'Width' : 'Height';
                    switch (eleType) {
                        case 'element':
                            return ele.getBoundingClientRect()[key] - extraVal;

                        case 'window':
                            return window['inner' + key2];

                        case 'document':
                            return Math.max(html['scroll' + key2], html['client' + key2])
                    }
                }
                // set
                else if (argsLength === 2 && eleType === 'element' && typeis(args[1]) === 'number') {
                    _setBoundingClientRect(ele, key, args[1] + extraVal, extraKey[0]);
                }
            });
        }
    }


    /**
     * 设置元素的位置
     * @param {HTMLElement|Node} ele 元素
     * @param {String} key 键名
     * @param {Number} val 键值
     * @param {Number} extraKey 额外的键
     * @private
     */
    function _setBoundingClientRect(ele, key, val, extraKey) {
        var elePos = exports.css(ele, 'position');
        var rect;
        var now;
        var width;
        var height;
        var deleta;
        var css;

        // 绝对定位的元素，先设置其 top、left值
        if (elePos === 'absolute') {
            exports.css(ele, {
                top: ele.offsetTop,
                left: ele.offsetLeft
            });
        }

        rect = ele.getBoundingClientRect();
        now = rect[key];
        width = rect.width;
        height = rect.height;
        deleta = val - now;

        if ((key === 'top' || key === 'left') && extraKey) {
            deleta -= exports[extraKey](ele);
        }

        if (exports.css(ele, 'position') === 'static' && key !== 'width' && key !== 'height') {
            css = number.parseFloat(exports.css(ele, 'margin-' + key), 0);
            exports.css(ele, 'margin-' + key, css + deleta);
        } else {
            css = number.parseFloat(exports.css(ele, key), 0);
            exports.css(ele, key, css + deleta);
        }
    }


    /**
     * 测试是否相对于视口计算
     * @returns {boolean}
     */
    function _isRelativeToViewport() {
        var x = win.pageXOffset ? win.pageXOffset + win.innerWidth - 1 : 0;
        var y = win.pageYOffset ? win.pageYOffset + win.innerHeight - 1 : 0;

        if (!x && !y) {
            return true;
        }

        // Test with a point larger than the viewport. If it returns an element,
        // then that means elementFromPoint takes page coordinates.
        return !doc.elementFromPoint(x, y);
    }


    /**
     * 存储元素的 transform 特征
     * @param ele
     * @param key
     * @param val
     * @private
     */
    function _setEleTransform(ele, key, val) {
        var val2 = val;
        var isPercent = REG_PERCENT.test(val);
        var base;

        // 计算百分比的 translate
        switch (key) {
            case 'translateX':
                base = isPercent ? exports.outerWidth(ele) : 0;
                val2 = number.parseFloat(val, 0);
                val2 = isPercent ? base * val2 / 100 : val2;
                break;

            case 'translateY':
                base = isPercent ? exports.outerHeight(ele) : 0;
                val2 = number.parseFloat(val, 0);
                val2 = isPercent ? base * val2 / 100 : val2;
                break;

            case 'translate':
                _setEleTransform(ele, 'translateX', val);
                _setEleTransform(ele, 'translateY', val);
                return;

            case 'scale':
                // scale 到 0 的时候，会出现矩阵计算错误
                val2 = number.parseFloat(val2, 0);
                val2 = val === 0 ? 0.01 : val2;
                break;
        }

        ele[alienKey + 'transform'] = ele[alienKey + 'transform'] || {};
        ele[alienKey + 'transform'][key] = val2;
    }


    /**
     * 获取元素的 transform 特征
     * @param ele
     * @param key
     * @private
     */
    function _getEleTransform(ele, key) {
        ele[alienKey + 'transform'] = ele[alienKey + 'transform'] || {};
        return ele[alienKey + 'transform'][key];
    }


    /**
     * 综合计算元素的 transform 2d 变换矩阵
     * @param ele
     * @private
     */
    function _calEleTransform(ele) {
        var trans = ele[alienKey + 'transform'] = ele[alienKey + 'transform'] || {};

        return matrix(trans);
    }
});