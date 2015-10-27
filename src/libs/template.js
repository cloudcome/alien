/*!
 * html 字符串模板引擎
 * @author ydr.me
 * @create 2014-10-09 18:35
 * @2015年05月03日00:07:41 增加 {{ignore}}...{{/ignore}} 忽略 parse 区间
 */


define(function (require, exports, module) {
    /**
     * @module libs/template
     * @requires utils/dato
     * @requires utils/typeis
     * @requires utils/random
     * @requires utils/class
     */
    'use strict';

    var dato = require('../utils/dato.js');
    var string = require('../utils/string.js');
    var typeis = require('../utils/typeis.js');
    var random = require('../utils/random.js');
    var klass = require('../utils/class.js');
    var REG_STRING_WRAP = /([\\"])/g;
    var REG_LINES = /[\n\r\t]/g;
    var REG_SPACES = /\s{2,}/g;
    var REG_PRES = /<pre\b.*?>[\s\S]*?<\/pre>/ig;
    var REG_VAR = /^(=)?\s*([^|]+?)(\|.*)?$/;
    var REG_FILTER = /^(.*?)(\s*:\s*(.+)\s*)?$/;
    var REG_IF = /^((else\s+)?if)\s+(.*)$/;
    //var REH_LIST = /^list\s+\b([^,]*)\b\s+as\s+\b([^,]*)\b(\s*,\s*\b([^,]*))?$/;
    var REH_LIST = /^list\s+([^,]*)\s+as\s+([^,]*)(\s*,\s*([^,]*))?$/;
    var REG_ELSE_IF = /^else\s+if\s/;
    var REG_HASH = /^#/;
    var REG_IGNORE = /\{\{ignore}}([\s\S]*?)\{\{\/ignore}}/ig;
    var regLines = [{
        'n': /\n/g,
        'r': /\r/g,
        't': /\t/g
    }];
    var openTag = '{{';
    var closeTag = '}}';
    var configs = {
        /**
         * 是否压缩输出内容
         * @type Boolean
         */
        compress: true,
        /**
         * 是否 debug 模式
         * @type Boolean
         */
        debug: false
    };
    var filters = {};
    var Template = klass.create({
        constructor: function (template, options) {
            this._options = dato.extend(true, {}, configs, options);
            this._init(String(template));
            this.className = 'template';
        },

        /**
         * 生成一个变量
         * @returns {string}
         * @private
         */
        _generatorVar: function () {
            return 'alien_libs_template_' + random.string(20, '0aA');
        },


        /**
         * 初始化一个模板引擎
         * @param {String} template 模板字符串
         * @returns {Template}
         * @private
         */
        _init: function (template) {
            var the = this;
            var _var = the._generatorVar();
            var fnStr = 'var ' + _var + '="";';
            var output = [];
            var parseTimes = 0;
            // 是否进入忽略状态，true=进入，false=退出
            var inIgnore = false;
            // 是否进入表达式
            var inExp = false;

            the._template = {
                escape: string.escapeHTML,
                filters: {}
            };
            the._useFilters = {};

            the._placeholders = {};

            template.replace(REG_IGNORE, function ($0, $1) {
                var key = _generateKey();

                the._placeholders[key] = $1;

                return key;
            }).split(openTag).forEach(function (value, times) {
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
                            output.push(_var + '+=' + _cleanPice(openTag) + ';');
                        }
                    }
                    // 忽略开始
                    else if ($0.slice(-1) === '\\') {
                        output.push(_var + '+=' + _cleanPice($0.slice(0, -1) + openTag) + ';');
                        inIgnore = true;
                        parseTimes--;
                    }
                    else {
                        if ((parseTimes % 2) === 0) {
                            throw new Error('find unclose tag ' + openTag);
                        }

                        inIgnore = false;
                        inExp = true;
                        output.push(_var + '+=' + _cleanPice($0) + ';');
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
                            '+=' + _cleanPice((times > 1 ? openTag : '') +
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

                    $1 = _cleanPice($1);

                    // if abc
                    if (the._hasPrefix($0, 'if')) {
                        output.push(the._parseIfAndElseIf($0) + _var + '+=' + $1 + ';');
                    }
                    // else if abc
                    else if (REG_ELSE_IF.test($0)) {
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
                    else if (the._hasPrefix($0, 'list')) {
                        output.push(the._parseList($0) + _var + '+=' + $1 + ';');
                    }
                    // /list
                    else if ($0 === '/list') {
                        output.push('}, this);' + _var + '+=' + $1 + ';');
                    }
                    // var
                    else if (the._hasPrefix($0, 'var')) {
                        parseVar = the._parseVar($0);

                        if (parseVar) {
                            output.push(parseVar);
                        }
                    }
                    // #
                    else if (REG_HASH.test($0)) {
                        parseVar = the._parseVar($0.replace(REG_HASH, ''));

                        if (parseVar) {
                            output.push(parseVar);
                        }
                    }
                    // exp
                    else {
                        parseVar = the._parseExp($0);

                        if (parseVar) {
                            output.push(_var + '+=' + the._parseExp($0) + '+' + $1 + ';');
                        }
                    }

                }
                // 多个结束符
                else {
                    output.push(_var + '+=' + _cleanPice(value) + ';');
                    inExp = false;
                    inIgnore = false;
                }
            });

            fnStr += output.join('') + 'return ' + _var;
            the._fn = fnStr;

            return the;
        },


        /**
         * 判断是否包含该前缀
         * @param str
         * @param pre
         * @returns {boolean}
         * @private
         */
        _hasPrefix: function (str, pre) {
            return str.indexOf(pre + ' ') === 0;
        },


        /**
         * 渲染数据
         * @param {Object} [data] 数据
         * @returns {String} 返回渲染后的数据
         *
         * @example
         * tp.render(data);
         */
        render: function (data) {
            var the = this;
            var options = the._options;
            var _var = 'alienTemplateData_' + Date.now();
            var vars = [];
            var fn;
            var existFilters = dato.extend(true, {}, filters, the._template.filters);
            var self = dato.extend(true, {}, {
                each: dato.each,
                escape: string.escapeHTML,
                filters: existFilters,
                configs: configs
            });
            var ret;

            data = data || {};
            dato.each(data, function (key) {
                vars.push('var ' + key + '=' + _var + '["' + key + '"];');
            });

            dato.each(the._useFilters, function (filter) {
                if (!existFilters[filter]) {
                    throw new Error('can not found filter ' + filter);
                }
            });

            try {
                /* jshint evil: true */
                fn = new Function(_var, 'try{' + vars.join('') + this._fn + '}catch(err){return this.configs.debug?err.stack || message:"";}');
            } catch (err) {
                fn = function () {
                    return configs.debug ? err.stack || err.message : '';
                };
            }

            try {
                ret = fn.call(self, data);
            } catch (err) {
                ret = configs.debug ? err.stack || err.message : '';
            }


            ret = String(ret);
            ret = options.compress ? _cleanHTML(ret) : ret;

            // 恢复占位
            dato.each(the._placeholders, function (key, val) {
                ret = ret.replace(key, val);
            });

            return ret;
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
         * 解析变量赋值
         * @param str
         * @returns {string}
         * @private
         */
        _parseVar: function (str) {
            return this._parseExp(str, 'var') + ';';
        },


        /**
         * 解析表达式
         * @param str
         * @param [pre]
         * @returns {string}
         * @private
         */
        _parseExp: function (str, pre) {
            var the = this;

            str = str.trim();

            var unEscape = str[0] === '=';
            str = unEscape ? str.substr(1) : str;
            var matches = str.match(REG_VAR);
            var filters;

            if (!matches) {
                return '';
            }

            var exp = matches[2];

            // name || "123"
            if (matches[3] && matches[3].slice(0, 2) === '||') {
                //return ret + '?' + matches[2] + ':' + matches[3].slice(2) + ')';
                //exp = '(typeof(' + exp + ')!=="undefined"&&!!' + exp + ')?' + exp + ':' + matches[3].slice(2);
                exp = matches[2] + matches[3];
            } else if (matches[3] && matches[3].slice(0, 1) === '|') {
                filters = matches[3].split('|');
                filters.shift();
                filters.forEach(function (filter) {
                    var matches = filter.match(REG_FILTER);
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

            if (pre) {
                return exp;
            }

            return (unEscape ?  '(': 'this.escape(') + exp + ')';
        },


        /**
         * 解析条件判断
         * @param str
         * @returns {string}
         * @private
         */
        _parseIfAndElseIf: function (str) {
            var matches = str.trim().match(REG_IF);

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
            var matches = str.trim().match(REH_LIST);
            var parse;
            var randomKey1 = this._generatorVar();
            var randomKey2 = this._generatorVar();
            var randomVal = this._generatorVar();

            if (!matches) {
                throw new Error('parse error ' + str);
            }

            parse = {
                list: matches[1] || '',
                key: matches[4] ? matches[2] : randomKey2,
                val: matches[4] ? matches[4] : matches[2]
            };

            return 'this.each(' + parse.list + ', function(' + randomKey1 + ', ' + randomVal + '){' +
                'var ' + parse.key + ' = ' + randomKey1 + ';' +
                'var ' + parse.val + '=' + randomVal + ';';
        }
    });


    /**
     * 片段处理
     * @param str
     * @returns {string}
     * @private
     */
    function _cleanPice(str) {
        str = str
            .replace(REG_STRING_WRAP, '\\$1');

        dato.each(regLines, function (index, map) {
            var key = Object.keys(map)[0];
            var val = map[key];

            str = str.replace(val, '\\' + key);
        });

        return '"' + str + '"';
    }


    /**
     * 生成随机 42 位的 KEY
     * @returns {string}
     * @private
     */
    function _generateKey() {
        return 'œ' + random.string(40, 'aA0') + 'œ';
    }


    /**
     * 清理 HTML
     * @param code
     * @private
     */
    function _cleanHTML(code) {
        // 保存 <pre>
        var preMap = {};

        code = code.replace(REG_PRES, function ($0) {
            var key = _generateKey();

            preMap[key] = $0;

            return key;
        });


        code = code
            .replace(REG_LINES, '')
            .replace(REG_SPACES, ' ');


        dato.each(preMap, function (key, val) {
            code = code.replace(key, val);
        });

        return code;
    }


    /**
     * 默认配置
     * @type {Object}
     * @static
     */
    Template.configs = configs;


    /**
     * 静态过滤方法
     * @type {Object}
     * @static
     */
    Template.filters = filters;

    /**
     * 设置默认配置
     * @param options
     */
    Template.config = function (options) {
        dato.extend(configs, options);
    };


    /**
     * 添加过滤方法
     * @param {String} name 过滤方法名称
     * @param {Function} callback 方法
     * @param {Boolean} [isOverride=false] 是否强制覆盖，默认 false
     * @static
     */
    Template.addFilter = function (name, callback, isOverride) {
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
    };


    /**
     * 获取过滤方法
     * @param {String} [name] 获取过滤方法的名称，为空表示获取全部过滤方法
     * @returns {Function|Object} 放回过滤方法或过滤方法的集合
     * @static
     */
    Template.getFilter = function (name) {
        if (!name) {
            return filters;
        }

        if (typeis(name) === 'string') {
            return filters[name];
        }
    };


    /**
     * 模板引擎
     *
     * @param {Object} [options] 配置
     * @param {Boolean} [options.cache=true] 是否缓存上次结果
     * @param {Boolean} [options.compress=true] 是否输出压缩内容
     * @param {Boolean} [options.debug=false] 是否输出调试新
     * @constructor
     *
     * @example
     * var tpl = new Template('{{name}}');
     * tpl.render({name: 'yundanran'});
     * // => 'yundanran'
     */
    module.exports = Template;
});
