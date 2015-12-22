/*!
 * 多级数据联动
 * @author ydr.me
 * @create 2015-07-04 23:11
 */


define(function (require, exports, module) {
    /**
     * @module ui/linkage/
     * @requires utils/dato
     * @requires utils/howdo
     * @requires utils/typeis
     * @requires utils/controller
     * @requires ui/
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/event/base
     * @requires core/communication/xhr
     */

    'use strict';

    var dato = require('../../utils/dato.js');
    var howdo = require('../../utils/howdo.js');
    var typeis = require('../../utils/typeis.js');
    var controller = require('../../utils/controller.js');
    var ui = require('../index.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/base.js');
    var xhr = require('../../core/communication/xhr.js');
    var namespace = 'alien-ui-linkage';
    var defaults = {
        // 数据的 text 键名
        textName: 'text',
        // 数据的 value 键名
        valueName: 'value',
        // 请求数据的键名
        queryName: 'parent',
        // 级联长度
        length: 3,
        // 获取级联数据的 urls
        // 执行普通的 get 请求
        urls: [],
        // select 选择器，默认为父级下的前几个
        selectSelectors: [],
        cache: true,
        placeholder: {
            text: '请选择',
            value: ''
        },
        // 隐藏空 select
        hideEmpty: false,
        // 不可用空 select
        disabledEmpty: true,
        // 数据过滤器
        filter: null
    };
    var Linkage = ui.create({
        constructor: function ($parent, options) {
            var the = this;

            the._$screen = selector.query($parent)[0];
            the._options = dato.extend({}, defaults, options);
            the._length = the._options.urls.length || the._options.length;
            the._hasPlaceholder = the._options.placeholder && the._options.placeholder.text;
            the._defaultVal = the._hasPlaceholder ? the._options.placeholder.value : '';
            the._values = [];
            // 缓存，支持重写
            the.cache = {};
            the._changeIndex = -1;
            the.destroyed = false;
            the.className = 'linkage';
            the._initNode();
            the._initEvent();
            // 初始加载第一级
            the.change(0);
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;

            the._$selects = [];

            if (options.selectSelectors.length) {
                dato.each(options.selectSelectors, function (index, sel) {
                    the._$selects.push(selector.query(sel, the._$screen)[0]);
                });
            } else {
                the._$selects = selector.query('select', the._$screen);
            }

            dato.repeat(the._length, function (index) {
                the._$selects[index][namespace + 'index'] = index;
            });
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            //var options = the._options;

            // 获取到了列表数据
            dato.repeat(the._length, function (index) {
                event.on(the._$selects[index], 'change', the._onchange = function () {
                    var self = this;
                    var index = self[namespace + 'index'];
                    var value = self.value;
                    var nextIndex = index + 1;

                    the._values[index] = value;
                    the._changeIndex = index;
                    the.emit('change', index, value);

                    if (nextIndex < the._length) {
                        the._cleanValues(nextIndex);
                        the.change(nextIndex);
                    }
                });
            });
        },


        /**
         * 改变级联选择
         * @param index
         * @param callback
         * @returns {Linkage}
         */
        change: function (index, callback) {
            var the = this;

            the._getData(index, function (err, list) {
                if (!err) {
                    the._renderList(index, list);

                    if (typeis.function(callback)) {
                        callback.call(the);
                    }
                }
            });

            return the;
        },


        /**
         * 手动设置级联值
         * @param values {Array} 手动值
         * @returns {Linkage}
         */
        setValue: function (values) {
            var the = this;

            the._xhr.abort();
            the._unChangeNext = true;
            howdo.each(values, function (index, value, next) {
                the._values[index] = value + '';
                the.change(index, next);
            }).follow(function () {
                the._unChangeNext = false;
            });

            return the;
        },


        /**
         * 获得当前选中的值
         * @returns {Array}
         */
        getValue: function () {
            return this._values;
        },


        /**
         * 获取 select
         * @param index {Number} 索引值
         * @returns {*}
         */
        getSelect: function (index) {
            return this._$selects[index];
        },


        /**
         * 获取级联数据
         * @param index {Number} 当前级联索引值
         * @param callback {Function} 回调
         * @private
         */
        _getData: function (index, callback) {
            var the = this;
            var options = the._options;
            var prevIndex = index - 1;
            var prevValue = prevIndex > -1 ? the._values[prevIndex] : the._defaultVal;

            // 上一步没有值
            if (index && !prevValue) {
                the._values[index] = the._defaultVal;
                return callback(null, []);
            }

            // 有缓存值
            if (index && the.cache[prevIndex]) {
                var cacheList = the.cache[prevIndex][prevValue];

                if (cacheList) {
                    return callback(null, cacheList.slice(the._hasPlaceholder ? 1 : 0));
                }
            }

            the.emit('beforedata', index);

            var query = {};

            query[options.queryName] = index > 0 ? prevValue : '';
            the._xhr = xhr.get(options.urls[index], query).on('success', function (list) {
                the.emit('afterdata', list);
                callback(null, typeis.function(options.filter) ? options.filter(list) : list);
            }).on('error', function (err) {
                the.emit('error', err);
                callback(err);
            });
        },


        /**
         * 清除当前及后续的值
         * @param index
         * @private
         */
        _cleanValues: function (index) {
            var the = this;
            var options = the._options;

            dato.repeat(the._length, function (_index) {
                if (_index >= index) {
                    the._values[_index] = the._defaultVal;
                }
            });
        },


        /**
         * 渲染 select option
         * @param index {Number} 渲染的 select 索引值
         * @param list {Array} 渲染的数据列表
         * @returns {string}
         * @private
         */
        _renderList: function (index, list) {
            var the = this;
            var options = the._options;
            var selectOptions = '';

            the.emit('beforerender', index);

            var selectedValue = the._values[index];
            var isFind = false;

            if (list) {
                if (index && options.cache) {
                    var prevIndex = index - 1;
                    var prevValue = the._values[prevIndex];

                    if(prevValue){
                        // 上一个选中的子级
                        the.cache[prevIndex] = the.cache[prevIndex] || {};
                        the.cache[prevIndex][prevValue] = list;
                    }
                }
            } else {
                list = [];
            }

            if (the._hasPlaceholder) {
                list.unshift(options.placeholder);
            }

            dato.each(list, function (i, item) {
                var text = item[options.textName];
                var value = item[options.valueName] + '';
                var isSelected = !!selectedValue && selectedValue === value;

                if (isSelected) {
                    isFind = true;
                }

                selectOptions += '<option value="' + value + '"' +
                    (isSelected ? ' selected' : '') +
                    '>' + text + '</option>';
            });

            if (!isFind) {
                the._values[index] = the._defaultVal;
            }

            var $select = the._$selects[index];
            var hasNoValue = !list.length || the._hasPlaceholder && list.length === 1;

            if (hasNoValue) {
                if (options.disabledEmpty) {
                    attribute.prop($select, 'disabled', true);
                }

                if (options.hideEmpty) {
                    attribute.css($select, 'display', 'none');
                }
            } else {
                if (options.disabledEmpty) {
                    attribute.prop($select, 'disabled', false);
                }

                if (options.hideEmpty) {
                    attribute.css($select, 'display', '');
                }
            }

            attribute.html($select, selectOptions);
            the.emit('change', index, selectedValue);

            if (!the._unChangeNext) {
                var  nextIndex = index + 1;
                if (nextIndex < the._length) {
                    the._cleanValues(nextIndex);
                    the.change(nextIndex);
                }
            }

            the.emit('afterrender', index);
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            if (the.destroyed) {
                return;
            }

            the.destroyed = true;
            dato.repeat(the._length, function (index) {
                event.un(the._$selects[index], 'change', the._onchange);
            });
        }
    });

    Linkage.defaults = defaults;
    module.exports = Linkage;
});