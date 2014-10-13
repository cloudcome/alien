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

    /**
     * 参考自腾讯的 ArtTemplate
     * {{data}}
     *
     * {{each list as key,val}}
     * {{/each}}
     *
     * {{each list as val}}
     * {{/each}}
     *
     * {{if abc}}
     * {{else if def}}
     * {{else}}
     * {{/if}}
     */

    var data = require('../util/data.js');
    var klass = require('../util/class.js');
    var regStringWrap = /([\\"])/g;
    var regBreakline1 = /\n/g;
    var regBreakline2 = /\r/g;
    var regVar = /((?:[^'"])\b[a-z])/ig;
    var regEachKeyVal = /\b[^,]+\b(\s*,\s*(\b[^,]+))?/;
    var defaults = {
        openTag: '{{',
        closeTag: '}}'
    };
    var Template = klass.create({
        STATIC: {
            defaults: defaults
        },
        constructor: function (options) {
            this._options = data.extend(!0, {}, defaults, options);
        },
        init: function (template) {
            var the = this;
            var options = the._options;
            var fn = '"use strict";var o="";';
            var output = [];

            template.split(options.openTag).forEach(function (value) {
                var array = value.split(options.closeTag);
                var $0 = array[0];
                var $1 = array[1];
                var each;

                // my name is
                // 0 my name is
                if (array.length === 1) {
                    output.push('o+=' + _stringWrap($0) + ';');
                }
                // name}}, I love
                // 0 name
                // 1 , I love
                else {
                    $0 = $0.trim();
                    $1 = _stringWrap($1);

                    // if abc
                    if ($0.indexOf('if ') === 0) {
                        output.push('if(' + _varWrap($0.slice(3))+ '){o+=' + $1 + ';');
                    }
                    // else if abc
                    else if ($0.indexOf('else if ') === 0) {
                        output.push('}else if(' + _varWrap($0.slice(8)) + '){o+=' + $1 + ';');
                    }
                    // else
                    else if ($0.indexOf('else') === 0) {
                        output.push('}else{o+=' + $1 + ';');
                    }
                    // /if
                    else if ($0.indexOf('/if') === 0) {
                        output.push('}');
                    }
                    // each list as key,val
                    // each list as val
                    else if ($0.indexOf('each ') === 0) {

                    }
                    // /each
                    else if ($0.indexOf('/each') === 0) {

                    }
                    // var
                    else {
                        output.push('o+=data.' + $0 + '+' + $1 + ';');
                    }
                }
            });

            fn += output.join('') +'return o';

            return new Function('data', fn);
        }
    });


    module.exports = Template;


    /**
     * 包装字符串
     * @param {String} data 数据
     * @returns {string}
     * @private
     */
    function _stringWrap(data) {
        return '"' + data.replace(regStringWrap, '\\$1')
            .replace(regBreakline1, '\\n')
            .replace(regBreakline2, '\\r') + '"';
    }


    /**
     * 变量包裹
     * @param data
     * @returns {string}
     * @private
     * @TODO 要区别开关键词、保留词
     */
    function _varWrap(data) {
        return data.replace(regVar, 'data.$1');
    }


    function _getEachKeyVal(data) {
        var matches = data.slice(4).match(regEachKeyVal);
        // key,val
        if(matches[1]){

        }
        // val
        else{

        }
    }


});
