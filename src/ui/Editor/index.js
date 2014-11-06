/*!
 * 编辑器
 * @author ydr.me
 * @create 2014-11-06 11:07
 */


define(function (require, exports, module) {
    /**
     * @module ui/Editor/index
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires util/selection
     */
    'use strict';

    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/base.js');
    var editor = require('./editor.js');
    var data = require('../../util/data.js');
    var klass = require('../../util/class.js');
    var Emitter = require('../../libs/Emitter.js');
    //var alienClass = 'alien-ui-editor';
    var alienIndex = 0;
    var defaults = {
        // tab 长度
        tabSize: 4,
        // 历史长度
        historyLength: 20
    };
    var pathname = location.pathname;
    var Editor = klass.create({
        STATIC: {
            defaults: defaults
        },


        /**
         * 构造函数
         * @param ele
         * @param options
         */
        constructor: function (ele, options) {
            var the = this;

            the._$ele = selector.query(ele);

            if (!the._$ele.length) {
                throw new Error('instance element is empty');
            }

            the._id = alienIndex++;

            the._$ele = the._$ele[0];
            Emitter.apply(the, arguments);
            the._options = data.extend(true, {}, defaults, options);
            the._init();
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;

            the._calStoreId();
            if (!the._$ele.value) {
                the._getLocal();
                editor.focusEnd(the._$ele);
            }

            the._timerId = 0;
            the._history = [the._$ele.value];
            the._historyIndex = -1;
            the._selection = [0, 0];
            the._on();
        },


        /**
         * 计算备份ID
         * @private
         */
        _calStoreId: function () {
            var the = this;
            var $ele = the._$ele;
            var atts = $ele.attributes;
            var attrList = [];

            data.each(atts, function (i, attr) {
                attrList.push(attr.name + '=' + attr.value);
            });

            the._storeId = pathname +
            '<' + the._$ele.tagName + '>#' +
            the._$ele.id + '.' +
            the._$ele.className +
            '[' + attrList.join(';') + ']';
        },


        /**
         * 读取本地备份
         * @private
         */
        _getLocal: function () {
            this._$ele.value = window.localStorage.getItem(this._storeId) || '';
        },


        /**
         * 写入本地备份
         * @private
         */
        _saveLocal: function () {
            window.localStorage.setItem(this._storeId, this._$ele.value);
        },


        /**
         * 事件监听
         * @private
         */
        _on: function () {
            var the = this;
            var $ele = the._$ele;

            //每 10 秒自动保存一次到本地
            //the._timerId = setInterval(the._saveLocal.bind(the), 10000);

            event.on($ele, 'keydown', the._onkeydown.bind(the));
            event.on($ele, 'input', the._oninput.bind(the));
        },


        /**
         * 按键回调
         * @param eve
         * @private
         */
        _onkeydown: function (eve) {
            var the = this;
            var options = the._options;
            var $ele = the._$ele;
            var keyCode = eve.keyCode;
            var isShift = eve.shiftKey;
            var isCtrl = eve.ctrlKey;

            // shift + tab
            if (isShift && keyCode === 9) {
                editor.shiftTab($ele, options.tabSize);
                the._pushHistory();
                eve.preventDefault();
            }
            // tab
            else if (keyCode === 9) {
                editor.insert($ele, editor.repeatString(' ', options.tabSize));
                the._pushHistory();
                eve.preventDefault();
            }
            // ctrl + z
            else if (isCtrl && keyCode === 90) {
                the._savePos();
                the._historyIndex = the._historyIndex === -1 ?
                    (the._history.length >= 2 ? the._history.length - 2 : 0) :
                    (the._historyIndex >= 1 ? the._historyIndex - 1 : 0);
                $ele.value = the._history.length > 1 ? the._history[the._historyIndex] : '';
                the._restorePos();
                eve.preventDefault();
            }
            // ctrl + r
            else if (isCtrl && keyCode === 82) {
                if (the._history.length > the._historyIndex + 1) {
                    the._savePos();
                    the._historyIndex += 1;
                    $ele.value = the._history[the._historyIndex];
                    the._restorePos();
                }

                eve.preventDefault();
            }
        },


        /**
         * 输入回调
         * @private
         */
        _oninput: function () {
            var the = this;

            the._pushHistory();
            // 历史记录点复位
            the._historyIndex = -1;
        },


        /**
         * 取消事件监听
         * @private
         */
        _un: function () {
            var the = this;
            var $ele = the._$ele;

            event.un($ele, 'keydown', the._onkeydown);
            event.un($ele, 'keydown', the._onkeydown);
        },


        /**
         * 历史入栈
         * @private
         */
        _pushHistory: function () {
            var the = this;
            var options = the._options;
            var history = the._history;

            if (history.length >= options.historyLength) {
                the._shiftHistory();
            }

            history.push(the._$ele.value);
            the._saveLocal();
        },


        /**
         * 历史出栈
         * @private
         */
        _shiftHistory: function () {
            this._history.shift();
        },


        /**
         * 保存光标记录
         * @private
         */
        _savePos: function () {
            var the = this;
            var $ele = the._$ele;
            the._selection = editor.getPos($ele);
        },


        /**
         * 恢复光标记录
         * @private
         */
        _restorePos: function () {
            var the = this;
            var $ele = the._$ele;

            editor.setPos($ele, the._selection[0], the._selection[1]);
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            the._un();
        },


        /**
         * 清除本地备份记录
         */
        clearStore: function () {
            window.localStorage.setItem(this._storeId, '');
        }
    }, Emitter);


    /**
     * 实例化一个 markdown 文本编辑器
     * @param $ele {HTMLTextAreaElement} 文本域输入框
     * @param [options] {Object} 配置
     * @param [options.tabSize=4] {Number} tab长度，默认为4个空格
     * @param [options.historyLength=20] {Number} 历史长度，默认为20
     *
     * @example
     * // 推荐使用ID来标识文本域输入框，因为会根据id来保存文本内容到本地的，当多个编辑器在同一个页面时尤为重要
     * var editor = new Editor('#id');
     */
    module.exports = Editor;
});