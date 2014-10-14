/*!
 * Template.js
 * @author ydr.me
 * @create 2014-10-09 18:35
 */


define(function (require, exports, module) {
    /**
     * @module libs/Template
     * @requires util/data
     * @requires util/class
     */
    'use strict';

    var utilData = require('../util/data.js');
    var klass = require('../util/class.js');
    var regStringWrap = /([\\"])/g;
    var regBreakLineMac = /\n/g;
    var regBreakLineWin = /\r/g;
    var regVar = /^(=)?\s*([^|]+?)(\|.*)?$/;
    var regFilter = /^(.*?)(\s*:\s*(.+)\s*)?$/;
    var regIf = /^((else\s+)?if)\s+(.*)$/;
    var regSpace = /\s+/g;
    var regEach = /^each\s+\b([^,]*)\b\s+as\s+\b([^,]*)\b(\s*,\s*\b([^,]*))?$/;
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
    var defaults = {
        openTag: '{{',
        closeTag: '}}',
        compress: !0
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
                if (utilData.type(name) !== 'string') {
                    throw new Error('filter name must be a string');
                }

                // 未设置覆盖 && 已经覆盖
                if (!isOverride && filters[name]) {
                    throw new Error('override a exist filter');
                }

                if (utilData.type(callback) !== 'function') {
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

                if (utilData.type(name) === 'string') {
                    return filters[name];
                }
            }
        },
        constructor: function (options) {
            this._options = utilData.extend(!0, {}, defaults, options);
        },


        /**
         * 初始化一个模板引擎
         * @param {String} template 模板字符串
         * @returns {Template}
         *
         * @example
         * tp.init("{{name}}");
         */
        init: function (template) {
            var the = this;
            var options = the._options;
            var _var = 'alienTemplateOutput_' + Date.now();
            var fnStr = 'var ' + _var + '="";';
            var output = [];
            var parseTimes = 0;

            the._template = {
                escape: _escape,
                filters: {}
            };
            the._useFilters = {};

            template.split(options.openTag).forEach(function (value) {
                var array = value.split(options.closeTag);
                var $0 = array[0];
                var $1 = array[1];
                var each;
                parseTimes++;

                // {{my name is
                // 0 my name is
                if (array.length === 1) {
                    output.push(_var + '+=' + the._lineWrap($0) + ';');
                    if(!(parseTimes%2)){
                        throw new Error('find unclose tag');
                    }
                }
                // name}}, I love
                // 0 name
                // 1 , I love
                else {
                    $0 = $0.trim();
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
                    else if ($0.indexOf('else') === 0) {
                        output.push('}else{' + _var + '+=' + $1 + ';');
                    }
                    // /if
                    else if ($0.indexOf('/if') === 0) {
                        output.push('}' + _var + '+=' + $1 + ';');
                    }
                    // each list as key,val
                    // each list as val
                    else if ($0.indexOf('each ') === 0) {
                        output.push(the._parseEach($0) + _var + '+=' + $1 + ';');
                    }
                    // /each
                    else if ($0.indexOf('/each') === 0) {
                        output.push('}' + _var + '+=' + $1 + ';');
                    }
                    // var
                    else {
                        output.push(_var + '+=' + the._parseVar($0) + '+' + $1 + ';');
                    }
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
            var existFilters = utilData.extend(!0, {}, filters, the._template.filters);
            var self = utilData.extend(!0, {}, {
                escape: _escape,
                filters: existFilters
            });

            utilData.each(data, function (key) {
                vars.push('var ' + key + '=' + _var + '["' + key + '"];');
            });

            utilData.each(the._useFilters, function (filter) {
                if (!existFilters[filter]) {
                    throw new Error('can not found filter ' + filter);
                }
            });

            try {
                fn = new Function(_var, vars.join('') + this._fn);
            } catch (err) {
                fn = function () {
                    return err;
                };
            }

            return fn.call(self, data);
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

            if (utilData.type(name) !== 'string') {
                throw new Error('filter name must be a string');
            }

            // 未设置覆盖 && 已经覆盖
            if (!isOverride && instanceFilters[name]) {
                throw new Error('override a exist instance filter');
            }

            if (utilData.type(callback) !== 'function') {
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
            return utilData.type(name) === 'string' ?
                this._template.filters[name] :
                this._template.filters;
        },
        _parseVar: function (str) {
            var the = this;
            var matches = str.trim().match(regVar);
            var filters;
            var ret;

            if (!matches) {
                throw new Error('parse error ' + str);
            }

            ret = (matches[1] === '=' ? 'this.escape(' : '') +
                matches[2] +
                (matches[1] === '=' ? ')' : '');

            if (!matches[3]) {
                return ret;
            }

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

                the._useFilters[name] = !0;

                args = ret + (matches[3] ? ',' + matches[3] : '');
                ret = 'this.filters.' + name + '(' + args + ')';
            });

            return ret;
        },
        _parseIfAndElseIf: function (str) {
            var matches = str.trim().match(regIf);

            if (!matches) {
                throw new Error('parse error ' + str);
            }

            return matches[1] + '(' + matches[3] + '){';
        },
        _parseEach: function (str) {
            var matches = str.trim().match(regEach);
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
     * 1. 编码输出变量<br>
     * {{data.name}}<br>
     * 2. 取消编码输出变量
     * {{=data.name}}<br>
     * 3. 判断语句（<code>if</code>）<br>
     * {{if data.name1}}<br>
     * {{else if data.name2}}<br>
     * {{else}}<br>
     * {{/if}}<br>
     * 4. 循环语句（<code>each</code>）<br>
     * {{each list as key,val}}<br>
     * {{/each}}<br>
     * {{each list as val}}<br>
     * {{/each}}<br>
     * 5. 过滤（<code>|</code>）<br>
     * {{data.name|filter1|filter2:"def"|filter3:"def","ghi"}}<br>
     *
     * @param {Object} [options] 配置
     * @param {String} [options.openTag="{{"] 开始标记，默认为"{{"
     * @param {String} [options.closeTag="}}"] 结束标记，默认为"}}"
     * @param {Boolean} [options.compress=true] 是否压缩，默认为 true
     * @constructor
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

        utilData.each(escapes, function (index, obj) {
            str = str.replace(obj.reg, obj.rep);
        });

        return str;
    }
});
