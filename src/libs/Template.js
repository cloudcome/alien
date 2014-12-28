/*!
 * Template.js
 * @author ydr.me
 * @create 2014-10-09 18:35
 */


define(function (require, exports, module) {
    /**
     * @module libs/Template
     * @requires util/dato
     * @requires util/typeis
     * @requires util/class
     */
    'use strict';

    var dato = require('../util/dato.js');
    var typeis = require('../util/typeis.js');
    var klass = require('../util/class.js');
    var regStringWrap = /([\\"])/g;
    var regBreakLineMac = /\n/g;
    var regBreakLineWin = /\r/g;
    var regVar = /^(=)?\s*([^|]+?)(\|.*)?$/;
    var regFilter = /^(.*?)(\s*:\s*(.+)\s*)?$/;
    var regIf = /^((else\s+)?if)\s+(.*)$/;
    var regSpace = /\s+/g;
    var regList = /^list\s+\b([^,]*)\b\s+as\s+\b([^,]*)\b(\s*,\s*\b([^,]*))?$/;
    var regComments = /<!--[\s\S]*?-->/g;
    var escapes = [
        {
            reg: /</g,
            rep: '&#60;'
        },
        {
            reg: />/g,
            rep: '&#62;'
        },
        {
            reg: /"/g,
            rep: '&#34;'
        },
        {
            reg: /'/g,
            rep: '&#39;'
        },
        {
            reg: /&/g,
            rep: '&#38;'
        }
    ];
    var openTag = '{{';
    var closeTag = '}}';
    var defaults = {
        compress: true
    };
    var filters = {};
    var Template = klass.create({
        STATIC: {
            /**
             * 默认配置
             * @type {Object}
             * @static
             */
            defaults: defaults,


            /**
             * 静态过滤方法
             * @type {Object}
             * @static
             */
            filters: filters,


            /**
             * 添加过滤方法
             * @param {String} name 过滤方法名称
             * @param {Function} callback 方法
             * @param {Boolean} [isOverride=false] 是否强制覆盖，默认 false
             * @static
             */
            addFilter: function (name, callback, isOverride) {
                if (typeis(name) !== 'string') {
                    throw new Error('filter name must be a string');
                }

                // 未设置覆盖 && 已经覆盖
                if (!isOverride && filters[name]) {
                    throw new Error('override a exist filter');
                }

                if (typeis(callback) !== 'function') {
                    throw new Error('filter callback must be a function');
                }

                filters[name] = callback;
            },


            /**
             * 获取过滤方法
             * @param {String} [name] 获取过滤方法的名称，为空表示获取全部过滤方法
             * @returns {Function|Object} 放回过滤方法或过滤方法的集合
             * @static
             */
            getFilter: function (name) {
                if (!name) {
                    return filters;
                }

                if (typeis(name) === 'string') {
                    return filters[name];
                }
            }
        },


        /**
         * 构造函数
         * @constructor
         * @param tmplate {String} 模板内容
         * @param [options] {Object} 模板配置
         */
        constructor: function (tmplate, options) {
            this._options = dato.extend(!0, {}, defaults, options);
            this._init(tmplate);
        },


        /**
         * 初始化一个模板引擎
         * @param {String} template 模板字符串
         * @returns {Template}
         * @private
         */
        _init: function (template) {
            var the = this;
            //var options = the._options;
            var _var = 'alienTemplateOutput_' + Date.now();
            var fnStr = 'var ' + _var + '="";';
            var output = [];
            var parseTimes = 0;
            // 是否进入忽略状态，true=进入，false=退出
            var inIgnore = false;
            // 是否进入表达式
            var inExp = false;

            the._template = {
                escape: _escape,
                filters: {}
            };
            the._useFilters = {};

            template.split(openTag).forEach(function (value, times) {
                var array = value.split(closeTag);
                var $0 = array[0];
                var $1 = array[1];
                var parseVar;
                var isEndIgnore;

                parseTimes++;

                // 1个开始符
                if (array.length === 1) {
                    // 多个连续开始符号
                    if (!$0 || $0 === '{') {
                        if (inIgnore) {
                            output.push(_var + '+=' + the._lineWrap(openTag) + ';');
                        }
                    }
                    // 忽略开始
                    else if ($0.slice(-1) === '\\') {
                        output.push(_var + '+=' + the._lineWrap($0.slice(0, -1) + openTag) + ';');
                        inIgnore = true;
                        parseTimes--;
                    }
                    else {
                        if ((parseTimes % 2) === 0) {
                            throw new Error('find unclose tag ' + openTag);
                        }

                        inIgnore = false;
                        inExp = true;
                        output.push(_var + '+=' + the._lineWrap($0) + ';');
                    }
                }
                // 1个结束符
                else if (array.length === 2) {
                    $0 = $0.trim();
                    inExp = false;
                    isEndIgnore = $1.slice(-1) === '\\';

                    // 忽略结束
                    if (inIgnore) {
                        output.push(
                            _var +
                            '+=' + the._lineWrap((times > 1 ? openTag : '') +
                                $0 + closeTag +
                                (isEndIgnore ? $1.slice(0, -1) : $1)
                            ) +
                            ';');
                        inIgnore = false;

                        // 下一次忽略
                        if (isEndIgnore) {
                            inIgnore = true;
                            parseTimes--;
                        }

                        return;
                    }

                    // 下一次忽略
                    if (isEndIgnore) {
                        inIgnore = true;
                        parseTimes--;
                        $1 = $1.slice(0, -1);
                    }

                    $1 = the._lineWrap($1);

                    // if abc
                    if ($0.indexOf('if ') === 0) {
                        output.push(the._parseIfAndElseIf($0) + _var + '+=' + $1 + ';');
                    }
                    // else if abc
                    else if ($0.indexOf('else if ') === 0) {
                        output.push('}' + the._parseIfAndElseIf($0) + _var + '+=' + $1 + ';');
                    }
                    // else
                    else if ($0 === 'else') {
                        output.push('}else{' + _var + '+=' + $1 + ';');
                    }
                    // /if
                    else if ($0 === '/if') {
                        output.push('}' + _var + '+=' + $1 + ';');
                    }
                    // list list as key,val
                    // list list as val
                    else if ($0.indexOf('list ') === 0) {
                        output.push(the._parseList($0) + _var + '+=' + $1 + ';');
                    }
                    // /list
                    else if ($0 === '/list') {
                        output.push('}' + _var + '+=' + $1 + ';');
                    }
                    // var
                    else {
                        parseVar = the._parseVar($0);

                        if (parseVar) {
                            output.push(_var + '+=' + the._parseVar($0) + '+' + $1 + ';');
                        }
                    }

                }
                // 多个结束符
                else {
                    output.push(_var + '+=' + the._lineWrap(value) + ';');
                    inExp = false;
                    inIgnore = false;
                }
            });

            fnStr += output.join('') + 'return ' + _var;
            the._fn = fnStr;

            return the;
        },


        /**
         * 渲染数据
         * @param {Object} data 数据
         * @returns {String} 返回渲染后的数据
         *
         * @example
         * tp.render(data);
         */
        render: function (data) {
            var the = this;
            var _var = 'alienTemplateData_' + Date.now();
            var vars = [];
            var fn;
            var existFilters = dato.extend(!0, {}, filters, the._template.filters);
            var self = dato.extend(!0, {}, {
                escape: _escape,
                filters: existFilters
            });
            var ret;

            dato.each(data, function (key) {
                vars.push('var ' + key + '=' + _var + '["' + key + '"];');
            });

            dato.each(the._useFilters, function (filter) {
                if (!existFilters[filter]) {
                    throw new Error('can not found filter ' + filter);
                }
            });

            try {
                fn = new Function(_var, 'try{' + vars.join('') + this._fn + '}catch(err){return err.message;}');
            } catch (err) {
                fn = function () {
                    return err;
                };
            }

            try {
                ret = fn.call(self, data);
            } catch (err) {
                ret = err.message;
            }

            return String(ret);
        },


        /**
         * 添加过滤函数，默认无任何过滤函数
         * @param {String} name 过滤函数名称
         * @param {Function} callback 过滤方法
         * @param {Boolean} [isOverride=false] 覆盖实例的过滤方法，默认为false
         *
         * @example
         * tp.addFilter('test', function(val, arg1, arg2){
         *     // code
         *     // 规范定义，第1个参数为上一步的值
         *     // 后续参数自定义个数
         * });
         */
        addFilter: function (name, callback, isOverride) {
            var instanceFilters = this._template.filters;

            if (typeis(name) !== 'string') {
                throw new Error('filter name must be a string');
            }

            // 未设置覆盖 && 已经覆盖
            if (!isOverride && instanceFilters[name]) {
                throw new Error('override a exist instance filter');
            }

            if (typeis(callback) !== 'function') {
                throw new Error('filter callback must be a function');
            }

            instanceFilters[name] = callback;
        },

        /**
         * 获取过滤函数
         * @param {String} [name] 过滤函数名称，name为空时返回所有过滤方法
         * @returns {Function|Object}
         *
         * @example
         * tp.getFilter();
         * // => return all filters Object
         *
         * tp.getFilter('test');
         * // => return test filter function
         */
        getFilter: function (name) {
            return typeis(name) === 'string' ?
                this._template.filters[name] :
                this._template.filters;
        },


        /**
         * 解析变量
         * @param str
         * @returns {string}
         * @private
         */
        _parseVar: function (str) {
            var the = this;
            var matches = str.trim().match(regVar);
            var filters;

            if (!matches) {
                return '';
            }

            var exp = matches[2];

            // name || "123"
            if (matches[3] && matches[3].slice(0, 2) === '||') {
                //return ret + '?' + matches[2] + ':' + matches[3].slice(2) + ')';
                exp = 'typeof(' + exp + ')!=="undefined"?' + exp + ':' + matches[3].slice(2);
            } else if (matches[3] && matches[3].slice(0, 1) === '|') {
                filters = matches[3].split('|');
                filters.shift();
                filters.forEach(function (filter) {
                    var matches = filter.match(regFilter);
                    var args;
                    var name;

                    if (!matches) {
                        throw new Error('parse error ' + filter);
                    }

                    name = matches[1];

                    the._useFilters[name] = false;

                    args = exp + (matches[3] ? ',' + matches[3] : '');
                    exp = 'this.filters.' + name + '(' + args + ')';
                });
            }

            var isEscape = matches[1] !== '=';

            return (isEscape ? 'this.escape(' : '(') +
                exp + ')';
        },


        /**
         * 解析条件判断
         * @param str
         * @returns {string}
         * @private
         */
        _parseIfAndElseIf: function (str) {
            var matches = str.trim().match(regIf);

            if (!matches) {
                throw new Error('parse error ' + str);
            }

            return matches[1] + '(' + matches[3] + '){';
        },


        /**
         * 解析列表
         * @param str
         * @returns {string}
         * @private
         */
        _parseList: function (str) {
            var matches = str.trim().match(regList);
            var parse;


            if (!matches) {
                throw new Error('parse error ' + str);
            }

            parse = {
                list: matches[1] || '',
                key: matches[4] ? matches[2] : '$index',
                val: matches[4] ? matches[4] : matches[2]
            };

            return 'for(var ' + parse.key + ' in ' + parse.list + '){var ' +
                parse.val + '=' + parse.list + '[' + parse.key + '];';
        },


        /**
         * 行包裹，删除多余空白、注释，替换换行符、双引号
         * @param str
         * @returns {string}
         * @private
         */
        _lineWrap: function (str) {
            var optioons = this._options;

            str = str.replace(regStringWrap, '\\$1');
            str = optioons.compress ?
                str.replace(regSpace, ' ').replace(regComments, '')
                    .replace(regBreakLineMac, '').replace(regBreakLineWin, '') :
                str.replace(regBreakLineMac, '\\n').replace(regBreakLineWin, '\\r');

            return '"' + str + '"';
        }
    });


    /**
     * 模板引擎<br>
     * <b>注意点：不能在模板表达式里出现开始或结束符，否则会解析错误</b><br>
     * 1. 编码输出变量<br>
     * {{data.name}}<br>
     * 2. 取消编码输出变量<br>
     * {{=data.name}}<br>
     * 3. 判断语句（<code>if</code>）<br>
     * {{if data.name1}}<br>
     * {{else if data.name2}}<br>
     * {{else}}<br>
     * {{/if}}<br>
     * 4. 循环语句（<code>list</code>）<br>
     * {{list list as key,val}}<br>
     * {{/list}}<br>
     * {{list list as val}}<br>
     * {{/list}}<br>
     * 5. 过滤（<code>|</code>）<br>
     * 第1个参数实际为过滤函数的第2个函数，这个需要过滤函数扩展的时候明白，详细参考下文的addFilter<br>
     * {{data.name|filter1|filter2:"def"|filter3:"def","ghi"}}<br>
     * 6. 反斜杠转义，原样输出<br>
     * \{{}} => {{}}<br>
     *
     * @param {Object} [options] 配置
     * @param {Boolean} [options.compress=true] 是否压缩，默认为 true
     * @constructor
     *
     * @example
     * var tpl = new Template('{{name}}');
     * tpl.render({name: 'yundanran'});
     * // => 'yundanran'
     */
    module.exports = Template;


    /**
     * HTML 编码
     * @param str
     * @returns {*}
     * @private
     */
    function _escape(str) {
        str = String(str);

        dato.each(escapes, function (index, obj) {
            str = str.replace(obj.reg, obj.rep);
        });

        return str;
    }
});
