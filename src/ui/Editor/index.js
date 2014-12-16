/*!
 * 编辑器
 * @todo 支持图片拖拽、粘贴上传
 * @author ydr.me
 * @create 2014-11-06 11:07
 */


define(function (require, exports, module) {
    /**
     * @module ui/Editor/index
     * @requires ui/generator
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires core/dom/attribute
     * @requires core/event/base
     * @requires ui/Editor/editor
     * @requires util/dato
     * @requires util/typeis
     * @requires util/date
     * @requires util/random
     * @requires ui/Scrollbar/index
     * @requires ui/Dialog/index
     * @requires ui/Msg/index
     * @requires libs/Template
     */
    'use strict';

    var generator = require('../generator.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/base.js');
    var editor = require('./editor.js');
    var dato = require('../../util/dato.js');
    var typeis = require('../../util/typeis.js');
    var date = require('../../util/date.js');
    var random = require('../../util/random.js');
    var Scrollbar = require('../Scrollbar/index.js');
    var Dialog = require('../Dialog/index.js');
    var Msg = require('../Msg/index.js');
    var Template = require('../../libs/Template.js');
    var template = require('html!./template.html');
    var tpl = new Template(template);
    var style = require('css!./style.css');
    var alienClass = 'alien-ui-editor';
    var RE_IMG_TYPE = /^image\//;
    var alienIndex = 0;
    var localStorage = window.localStorage;
    var pathname = location.pathname;
    var defaults = {
        width: '100%',
        height: 300,
        // tab 长度
        tabSize: 4,
        // 历史长度
        historyLength: 20,
        // 上传操作
        // uploadCallback 约定：
        // arg0: err 对象
        // arg1: 进度回调
        // arg2: list 上传成功JSON数组对象
        // [{url:'1.jpg',width:100,height:100}]
        uploadCallback: null
    };
    var Editor = generator({
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
            the._options = dato.extend(true, {}, defaults, options);
            the._init();
        },


        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;
            var options = the._options;

            the._calStoreId();
            attribute.css(the._$ele, {
                border: 0,
                width: options.width,
                height: options.height,
                padding: 10,
                margin: 0
            });
            attribute.addClass(the._$ele, alienClass + '-textarea');
            modification.wrap(the._$ele, '<div class="' + alienClass +
            '"><div class="' + alienClass + '-inner"></div></div>');
            the._$wrap = selector.closest(the._$ele, '.' + alienClass)[0];
            the._scrollbar = new Scrollbar(the._$ele);
            the._uploadList = [];
            the._history = [the._$ele.value];
            the._historyIndex = -1;
            the._on();
            the._isFullscreen = false;
            the._initVal();

            return the;
        },


        /**
         * 初始化编辑框内容
         * @private
         */
        _initVal: function () {
            var the = this;
            var local = the._getLocal();
            var minTime = 24 * 60 * 60 * 1000;
            var deltaTime = Date.now() - local.ver;
            var humanTime = date.from(local.ver);
            var done = function _done() {
                the._scrollbar.update();
                editor.focusEnd(the._$ele);
                the._savePos();
            };

            // 1天之内的本地记录 && 内容不一致
            if (deltaTime < minTime && local.val !== the._$ele.value) {
                new Msg({
                    content: '是否恢复本地的历史记录？<br>本地记录时间为：<b>' + humanTime + '</b>。',
                    buttons: ['确定', '取消']
                })
                    .on('close', function (index) {
                        if (index === 0) {
                            the._$ele.value = local.val;
                        } else {
                            the._saveLocal();
                        }
                        done();
                    });
            } else {
                done();
            }
        },


        /**
         * 切换编辑器的全屏模式
         */
        toggleFullscreen: function () {
            var the = this;
            var options = the._options;

            if (the._isFullscreen) {
                the._isFullscreen = false;
                attribute.css(document.body, 'overflow', '');
                attribute.removeClass(the._$wrap, alienClass + '-fullscreen');
                the._scrollbar.resize({
                    width: options.width,
                    height: options.height
                });
            } else {
                the._isFullscreen = true;
                attribute.css(document.body, 'overflow', 'hidden');
                attribute.addClass(the._$wrap, alienClass + '-fullscreen');
                the._scrollbar.resize({
                    width: attribute.innerWidth(window),
                    height: attribute.innerHeight(window)
                });
            }
        },


        /**
         * 上传对话框
         * @private
         */
        _uploadDialog: function () {
            var the = this;
            var dt = {
                id: the._id,
                uploads: the._uploadList
            };
            var $dialog;
            var imgLoad = function () {
                event.un($dialog, 'load');

                if (the._dialog) {
                    the._dialog.position();
                }
            };
            var options = the._options;

            if (typeis(options.uploadCallback) !== 'function') {
                return new Msg({
                    content: '尚未配置上传回调'
                });
            }

            if (the._dialog) {
                the._dialog.destroy();
                modification.remove(the._$dialog);
                the._dialog = null;
            }

            the._savePos();
            $dialog = modification.parse(tpl.render(dt))[0];
            event.on($dialog, 'load', 'img', imgLoad);
            modification.insert($dialog, document.body, 'beforeend');
            the._$dialog = $dialog;
            the._dialog = new Dialog('#' + alienClass + '-upload-' + the._id, {
                width: 500,
                title: '上传' + the._uploadList.length + '张图片（0%）',
                hideClose: true
            }).open();
            the._$dialog = $dialog;
            the._doUpload();
        },


        /**
         * 销毁上传实例
         * @private
         */
        _uploadDestroy: function () {
            var the = this;

            the._dialog.destroy(function () {
                modification.remove(the._$dialog);
                the._restorePos();
            });
        },


        /**
         * 上传
         * @private
         */
        _doUpload: function () {
            var the = this;
            var dialog = the._dialog;
            var list = the._uploadList;
            var onprogress = function (percent) {
                dialog.setTitle('上传' + list.length + '张图片（' + percent + '）');
            };
            var ondone = function (err, list) {
                var html = [];
                var msg;

                if (err) {
                    msg = new Msg({
                        content: err.message
                    });
                    msg.on('close', function () {
                        the._uploadDestroy();
                    });
                    return;
                }

                dato.each(list, function (index, img) {
                    html.push('![' + img.name + '](' + img.url + ')');
                });

                the.insert(html = html.join(' '));
                the._selection[1] += html.length;
                the._uploadDestroy();
            };

            the._options.uploadCallback(list, onprogress, ondone);
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
            var id = $ele.id;

            the._storeId = 'alien-ui-editor';

            if (id) {
                the._storeId += pathname + '#' + id;
            } else {
                dato.each(atts, function (i, attr) {
                    attrList.push(attr.name + '=' + attr.value);
                });

                the._storeId += pathname +
                '<' + the._$ele.tagName + '>.' +
                the._$ele.className +
                '[' + attrList.join(';') + ']';
            }
        },


        /**
         * 读取本地备份
         * @private
         */
        _getLocal: function () {
            var the = this;
            var local = localStorage.getItem(the._storeId);
            var ret;

            try {
                ret = JSON.parse(local);
            } catch (err) {
                // ignore
            }

            return ret || {ver: 0};
        },


        /**
         * 写入本地备份
         * @private
         */
        _saveLocal: function () {
            var the = this;

            localStorage.setItem(the._storeId, JSON.stringify({
                val: the._$ele.value,
                ver: Date.now()
            }));
        },


        /**
         * 事件监听
         * @private
         */
        _on: function () {
            var the = this;
            var $ele = the._$ele;

            event.on($ele, 'keydown', the._onkeydown.bind(the));
            event.on($ele, 'input', the._oninput.bind(the));
            event.on($ele, 'drop', the._ondrop.bind(the));
            event.on($ele, 'paste', the._onpaste.bind(the));
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
            var isMetaKey = eve.metaKey;

            // shift + tab
            if (isShift && keyCode === 9) {
                editor.shiftTab($ele, options.tabSize);
                the._pushHistory();
                eve.preventDefault();
            }
            // tab
            else if (keyCode === 9) {
                the.insert(editor.repeatString(' ', options.tabSize));
                the._pushHistory();
                eve.preventDefault();
            }
            // ctrl/meta + z
            else if ((isCtrl || isMetaKey) && keyCode === 90) {
                the._savePos();
                the._historyIndex = the._historyIndex === -1 ?
                    (the._history.length >= 2 ? the._history.length - 2 : 0) :
                    (the._historyIndex >= 1 ? the._historyIndex - 1 : 0);
                $ele.value = the._history.length > 1 ? the._history[the._historyIndex] : '';
                the._restorePos();
                eve.preventDefault();
            }
            // ctrl + r / meta + shift + z
            else if (isCtrl && keyCode === 82 || isMetaKey && isShift && keyCode === 90) {
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
         * 解析拖拽、粘贴里的图片信息
         * @param items
         * @private
         */
        _parseImgList: function (eve, items) {
            var the = this;

            the._uploadList = [];
            dato.each(items, function (index, item) {
                var file;

                if (RE_IMG_TYPE.test(item.type) && item.kind === 'file') {
                    file = item.getAsFile();

                    if (file && file.size > 0) {
                        the._uploadList.push({
                            url: window.URL.createObjectURL(item.getAsFile()),
                            file: item.getAsFile()
                        });
                    }
                }
            });

            if (the._uploadList.length) {
                the._$ele.blur();
                the._uploadDialog();
                eve.preventDefault();
            }
        },


        /**
         * 拖拽回调
         * @private
         */
        _ondrop: function (eve) {
            this._parseImgList(eve, eve.dataTransfer && eve.dataTransfer.items);
        },


        /**
         * 粘贴回调
         * @param eve
         * @private
         */
        _onpaste: function (eve) {
            this._parseImgList(eve, eve.clipboardData && eve.clipboardData.items);
        },


        /**
         * 取消事件监听
         * @private
         */
        _un: function () {
            var the = this;
            var $ele = the._$ele;

            event.un($ele, 'keydown', the._onkeydown);
            event.un($ele, 'input', the._oninput);
            event.un($ele, 'drop', the._ondrop);
            event.un($ele, 'paste', the._onpaste);
        },


        /**
         * 手动设置编辑器内容
         * @param value {String} 待覆盖的字符串
         */
        setContent: function (value) {
            var the = this;
            the._$ele.value = value;
            the._pushHistory();
            the._scrollbar.update();

            return the;
        },


        /**
         * 当前位置插入字符串
         * @param string {String} 待插入字符串
         *
         * @example
         * editor.insert('hehe');
         */
        insert: function (string) {
            var the = this;

            editor.insert(this._$ele, string);
            the._pushHistory();

            return the;
        },


        /**
         * 获得当前编辑器内容
         * @returns {*} {String} 当前编辑器内容
         */
        getContent: function () {
            return this._$ele.value;
        },


        /**
         * 历史入栈
         * @private
         */
        _pushHistory: function () {
            var the = this;
            var options = the._options;
            var history = the._history;
            var now = the._$ele.value;

            // 如果与最后一次相同，则取消入栈历史记录
            if (history.length && history[history.length - 1] === now) {
                return;
            }

            if (history.length >= options.historyLength) {
                the._shiftHistory();
            }

            history.push(now);
            the._saveLocal();
            the.emit('change', now);
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
            the._scrollbar.destroy();
            the._$ele.unwrap('div > div');
        },


        /**
         * 清除本地备份记录
         */
        clearStore: function () {
            var the = this;

            window.localStorage.setItem(the._storeId, '');

            return the;
        }
    });


    modification.importStyle(style);

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