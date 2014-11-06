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
        _calStoreId: function () {
            var the = this;
            var $ele = the._$ele;
            var atts = $ele.attributes;
            var attrList = [];

            data.each(atts, function (i, attr) {
                attrList.push(attr.name + '=' + attr.value);
            });

            the._storeId =  pathname +
            '<' + the._$ele.tagName + '>#' +
            the._$ele.id + '.' +
            the._$ele.className+
            '[' + attrList.join(';') + ']';
        },
        _getLocal: function () {
            this._$ele.value = window.localStorage.getItem(this._storeId) || '';
        },
        _saveLocal: function () {
            window.localStorage.setItem(this._storeId, this._$ele.value);
        },
        _on: function () {
            var the = this;
            var $ele = the._$ele;

            //每 10 秒自动保存一次到本地
            //the._timerId = setInterval(the._saveLocal.bind(the), 10000);

            event.on($ele, 'keydown', the._onkeydown.bind(the));
            event.on($ele, 'input', the._oninput.bind(the));
        },

        _onkeydown: function (eve) {
            var the = this;
            var options = the._options;
            var $ele = the._$ele;
            var keyCode = eve.keyCode;
            var isShift = eve.shiftKey;
            var isCtrl = eve.ctrlKey;

            console.log(keyCode);

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

        _oninput: function () {
            var the = this;

            the._pushHistory();
            // 历史记录点复位
            the._historyIndex = -1;
        },

        _un: function () {
            var the = this;
            var $ele = the._$ele;

            event.un($ele, 'keydown', the._onkeydown);
            event.un($ele, 'keydown', the._onkeydown);
        },

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
        _shiftHistory: function () {
            this._history.shift();
        },
        _savePos: function () {
            var the = this;
            var $ele = the._$ele;
            the._selection = editor.getPos($ele);
        },
        _restorePos: function () {
            var the = this;
            var $ele = the._$ele;

            editor.setPos($ele, the._selection[0], the._selection[1]);
        },
        destroy: function () {
            var the = this;

            the._un();
        }
    }, Emitter);

    module.exports = Editor;
});