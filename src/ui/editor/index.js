/*!
 * 新版 markdown 编辑器
 * @author ydr.me
 * @create 2015-04-03 02:32:10
 */


define(function (require, exports, module) {
    'use strict';

    /**
     * @module ui/editor/
     * @requires 3rd/codemirror/mode/gfm
     * @requires 3rd/codemirror/addon/display/fullscreen
     * @requires 3rd/codemirror/addon/display/placeholder
     * @requires 3rd/codemirror/marked
     * @requires ui/
     * @requires ui/dialog/
     * @requires code/dom/selector
     * @requires code/dom/attribute
     * @requires code/dom/modification
     * @requires code/event/base
     * @requires utils/controller
     * @requires utils/date
     * @requires utils/dato
     * @requires utils/typeis
     * @requires libs/template
     */

    var CodeMirror = require('../../3rd/codemirror/mode/gfm.js');
    var codeMirrorGoLineUp = CodeMirror.commands.goLineUp;
    var codeMirrorGoLineDown = CodeMirror.commands.goLineDown;
    var codeMirrorNewlineAndIndent = CodeMirror.commands.newlineAndIndent;
    //require('../../3rd/codemirror/addon/display/fullscreen.js');
    require('../../3rd/codemirror/addon/display/placeholder.js');
    //require('../../3rd/codemirror/addon/selection/active-line.js');
    var marked = require('../../3rd/marked.js');
    var ui = require('../');
    var confirm = require('../../widgets/confirm.js');
    var Dialog = require('../dialog/');
    var CtrlList = require('../ctrl-list/');
    var AutoHeight = require('../auto-height/');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/base.js');
    var controller = require('../../utils/controller.js');
    var date = require('../../utils/date.js');
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var string = require('../../utils/string.js');
    var selection = require('../../utils/selection.js');
    var Template = require('../../libs/template.js');
    var template = require('./template.html', 'html');
    var tpl = new Template(template);
    var style = require('./style.css', 'css');
    var alert = require('../../widgets/alert.js');
    var alienClass = 'alien-ui-editor';
    var alienIndex = 0;
    var RE_IMG_TYPE = /^image\//;
    //var alienIndex = 0;
    var win = window;
    var doc = win.document;
    var localStorage = win.localStorage;
    var pathname = location.pathname;
    var $html = doc.documentElement;
    var markedRender = new marked.Renderer();
    var noop = function () {
        // ignore
    };
    var isMobile = 'ontouchend' in doc;
    var defaults = {
        // 手动设置 ID
        id: '',
        addClass: '',
        previewClass: '',
        // 是否自动适配移动端，将富文本替换为 textarea
        isAdaptMobile: true,
        // tab 长度
        tabSize: 4,
        // 是否允许备份
        canBackup: true,
        // 最小检查同步本地的内容的相差长度
        checkLength: 3,
        minHeight: 200,
        // 上传操作
        // uploadCallback 约定：
        // arg0: err 对象
        // arg1: 进度回调
        // arg2: list 上传成功JSON数组对象
        // [{url:'1.jpg',width:100,height:100}]
        uploadCallback: null
    };
    var Editor = ui.create({
        constructor: function ($ele, options) {
            var the = this;
            the._isMac = CodeMirror.keyMap.default === CodeMirror.keyMap.macDefault;
            the._id = alienIndex++;
            the._$ele = selector.query($ele)[0];
            the._options = dato.extend({}, defaults, options);
            the.className = 'editor';
            the._calStoreId();

            if (isMobile && the._options.isAdaptMobile) {
                the._adaptMobile = true;
                the._ctrlList = null;
                the._$editor = modification.wrap(the._$ele, '<div class="' + alienClass + '"/>')[0];
                the._autoHeight = new AutoHeight(the._$ele);
            } else {
                the._editor = CodeMirror.fromTextArea(the._$ele, {
                    mode: 'gfm',
                    lineNumbers: false,
                    theme: "fed",
                    autoCloseBrackets: true,
                    autoCloseTags: true,
                    dragDrop: false,
                    foldGutter: false,
                    indentWithTabs: true,
                    lineWrapping: true,
                    matchBrackets: true,
                    readOnly: false,
                    showTrailingSpace: true,
                    styleActiveLine: true,
                    styleSelectedText: true,
                    tabSize: the._options.tabSize
                });
                the._$wrapper = the._editor.getWrapperElement();
                the._$scroller = the._editor.getScrollerElement();
                the._$textarea = the._editor.display.input.textarea;
                the._$code = selector.query('.CodeMirror-code', the._$scroller)[0];
                the._$input = modification.wrap(the._$wrapper, '<div class="' + alienClass + '-input"/>')[0];
                the._$editor = modification.wrap(the._$input, '<div class="' + alienClass + '"/>')[0];
                the._$editor.id = alienClass + '-' + the._id;
                the._$output = modification.create('div', {
                    'class': alienClass + '-output ' + options.previewClass
                });
                modification.insert(the._$output, the._$editor);
                attribute.addClass(the._$editor, alienClass + ' ' + the._options.addClass);
                attribute.css(the._$scroller, 'min-height', the._options.minHeight);
                the._ctrlList = new CtrlList([], {
                    maxHeight: 200,
                    offset: {
                        left: 20,
                        top: 10
                    }
                });
                the._isFullScreen = false;
                the._isPreview = false;
                the._atList = [];
            }

            the.destroyed = false;
            the._initEvent();

            if (the._options.canBackup) {
                controller.nextTick(the._initValue.bind(the));
            }
        },


        /**
         * 设置编辑器内容
         * @param value {String} 设置内容
         * @returns {Editor}
         */
        setValue: function (value) {
            var the = this;

            the._$ele.value = value;

            if (the._adaptMobile) {
                the._autoHeight.resize();
            }else{
                the._editor.setValue(value);
                the._$ele.value = value;
                the._editor.refresh();
            }

            return the;
        },


        /**
         * 初始化内容
         * @private
         */
        _initValue: function () {
            var the = this;
            var local = the._getLocal();
            var minTime = 24 * 60 * 60 * 1000;
            var deltaTime = Date.now() - local.ver;
            var humanTime = date.from(local.ver);
            var nowVal = the._$ele.value;
            var nowLen = nowVal.length;
            var storeVal = local.val;
            var storeLen = storeVal.length;

            // 1天之内的本地记录 && 内容部分不一致
            if (deltaTime < minTime && Math.abs(nowLen - storeLen) >= the._options.checkLength) {
                confirm('本地缓存内容与当前不一致。' +
                    '<br>缓存时间为：<b>' + humanTime + '</b>。' +
                    '<br>本地缓存内容长度为：<b>' + storeLen + '</b>。' +
                    '<br>当前内容长度为：<b>' + nowLen + '</b>。' +
                    '<br>是否恢复？')
                    .on('sure', function () {
                        if (!the._adaptMobile) {
                            controller.nextTick(function () {
                                try {
                                    the._editor.setCursor(local.cur);
                                } catch (err) {
                                    // ignore
                                }
                            });
                        }

                        the.setValue(storeVal);

                        /**
                         * 编辑器内容变化之后
                         * @event change
                         * @param value {String} 变化之后的内容
                         */
                        the.emit('change', storeVal);

                    }).on('cancel', function () {
                        the._saveLocal();
                    });
            }
        },


        /**
         * 计算备份ID
         * @private
         */
        _calStoreId: function () {
            var the = this;

            if (the._options.id) {
                the._storeId = the._options.id;
                return;
            }

            var $ele = the._$ele;
            var atts = $ele.attributes;
            var attrList = [];
            var id = $ele.id;

            the._storeId = alienClass;

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

            return ret || {ver: 0, val: ''};
        },

        /**
         * 写入本地备份
         * @private
         */
        _saveLocal: function () {
            var the = this;

            try {
                localStorage.setItem(the._storeId, JSON.stringify({
                    val: the._$ele.value,
                    ver: Date.now(),
                    cur: the._adaptMobile ? 0 : the._editor.getCursor()
                }));
            } catch (err) {
                // ignore
            }
        },


        /**
         * 清除本地备份记录
         */
        clearStore: function () {
            var the = this;

            win.localStorage.setItem(the._storeId, '');

            return the;
        },


        /**
         * 替换当前选中的文本，如果没有选中，则插入
         * @param value {String} 替换文本
         */
        replace: function (value) {
            var the = this;

            if (the._adaptMobile) {
                return the;
            }

            the._editor.focus();
            the._editor.replaceSelection(value);
            the._editor.refresh();

            return the;
        },


        /**
         * 包裹当前选中的文本
         * @param value {String} 包裹文本
         */
        wrap: function (value) {
            var the = this;

            if (the._adaptMobile) {
                return the;
            }

            the._editor.focus();

            var cursor = the._editor.getCursor();
            var raw = the._editor.getSelection();

            the._editor.replaceSelection(value + raw + value);

            if (!raw) {
                the._editor.setCursor(cursor.line, cursor.ch + value.length);
            }

            the._editor.refresh();
            return the;
        },


        /**
         * 事件初始化
         * @private
         */
        _initEvent: function () {
            var the = this;

            // 修改设置时
            the.on('setoptions', function (options) {
                if (the._storeId !== options.id) {
                    the._storeId = options.id;
                }
            });

            if (the._adaptMobile) {
                // change
                event.on(the._$ele, 'change input', function () {
                    /**
                     * 编辑器内容变化之后
                     * @event change
                     * @param value {String} 变化之后的内容
                     */
                    the.emit('change', the._$ele.value);
                    the._saveLocal();
                });

                event.on(the._$ele, 'cmd+return ctrl+return', function () {
                    /**
                     * 提交
                     * @event submit
                     * @params value {String} markdown 编辑器内容
                     */
                    the.emit('submit', the._$ele.value);
                });

                return;
            }

            // 切换全屏
            var toggleFullScreen = function () {
                if (the._isPreview) {
                    togglePreview();
                }

                controller.nextTick(function () {
                    the._isFullScreen = !the._isFullScreen;
                    the.emit('fullscreen', the._isFullScreen);
                    attribute[(the._isFullScreen ? 'add' : 'remove') + 'Class'](the._$editor, alienClass + '-fullscreen');
                    attribute.css(the._$editor, 'z-index', the._isFullScreen ? ui.getZindex() : '');
                    attribute.css($html, 'overflow', the._isFullScreen ? 'hidden' : '');

                    if (the._isFullScreen) {
                        the._lastStyle = the._$wrapper.style;
                        attribute.css(the._$wrapper, {
                            width: '',
                            height: 'auto'
                        });
                    } else {
                        the._$wrapper.style.width = the._lastStyle.width;
                        the._$wrapper.style.height = the._lastStyle.height;
                    }

                    the._editor.refresh();
                });

            };
            // 切换双屏预览
            var togglePreview = function () {
                if (the._isFullScreen) {
                    toggleFullScreen();
                }

                controller.nextTick(function () {
                    the._isPreview = !the._isPreview;
                    the.emit('preview', the._isPreview);
                    attribute.css(the._$editor, 'z-index', the._isPreview ? ui.getZindex() : '');
                    attribute[(the._isPreview ? 'add' : 'remove') + 'Class'](the._$editor, alienClass + '-preview');
                    attribute.css($html, 'overflow', the._isPreview ? 'hidden' : '');

                    if (the._isPreview) {
                        syncMarked();
                    }

                    the._editor.refresh();
                });
            };
            var syncMarked = function () {
                the._$output.innerHTML = marked(the._$ele.value, {renderer: markedRender});
            };

            // `code`
            the._addKeyMap(null, '`', function () {
                var raw = the._editor.getSelection();

                if (raw) {
                    the.wrap('`');
                } else {
                    the.replace('`');
                }
            });

            // ctrlList 打开
            the._ctrlList.on('open', function () {
                the._isAt = true;
                the._searchLength = 0;
            });

            // ctrlList 关闭
            the._ctrlList.on('close', function () {
                the._isAt = false;
                CodeMirror.commands.goLineUp = codeMirrorGoLineUp;
                CodeMirror.commands.goLineDown = codeMirrorGoLineDown;
                CodeMirror.commands.newlineAndIndent = codeMirrorNewlineAndIndent;
                dato.repeat(the._searchLength, function () {
                    the._editor.execCommand('delCharBefore')
                });
            });

            // 选择
            the._ctrlList.on('sure', function (choose) {
                the.replace(choose.value + ' ');
            });

            // @
            the._addKeyMap('shift', '2', function () {
                the.replace('@');

                if (!the._atList.length) {
                    return;
                }

                if (!the._isAt) {
                    CodeMirror.commands.goLineUp = noop;
                    CodeMirror.commands.goLineDown = noop;
                    CodeMirror.commands.newlineAndIndent = noop;
                    the._isAt = true;

                    var offset = selection.getOffset(the._$code);

                    offset.width = offset.height = 1;
                    offset.left += attribute.left(the._$editor);
                    offset.top += attribute.top(the._$editor);
                    the._ctrlList.update(the._atList).open(offset);
                }
            });

            // 退格
            event.on(the._$textarea, 'backspace', function () {
                the._ctrlList.close();
            });

            // 监听输入
            event.on(the._$textarea, 'input', function () {
                var value = this.value;

                if (!value) {
                    return;
                }

                var searchList = [];
                var reg = new RegExp(string.escapeRegExp(value), 'i');

                the._searchLength++;
                the._atList.forEach(function (item) {
                    if (reg.test(item.text)) {
                        searchList.push(item);
                    }
                });
                the._ctrlList.update(searchList);
            });

            // **blod**
            the._addKeyMap('ctrl', 'B', function () {
                the.wrap('**');
            });

            // _italic_
            the._addKeyMap('ctrl', 'I', function () {
                the.wrap('_');
            });

            // cmd + return
            the._addKeyMap('ctrl', 'Enter', function () {
                /**
                 * 提交
                 * @event submit
                 * @params value {String} markdown 编辑器内容
                 */
                the.emit('submit', the._editor.getValue());
            });


            // fullScreen
            the._addKeyMap('ctrl', 'F11', toggleFullScreen);


            // preview
            the._addKeyMap('ctrl', 'F12', togglePreview);


            // change
            the._editor.on('change', function () {
                var syncMarkedOnChange = controller.debounce(function () {
                    if (the._isPreview) {
                        syncMarked();
                    }
                });

                the._$ele.value = the._editor.getValue();
                /**
                 * 编辑器内容变化之后
                 * @event change
                 * @param value {String} 变化之后的内容
                 */
                the.emit('change', the._$ele.value);
                the._saveLocal();
                syncMarkedOnChange();
            });

            // 同步滚动
            event.on(the._$scroller, 'scroll', the._onscroll = function () {
                the._$output.scrollTop = (the._$output.scrollHeight - the._$output.offsetHeight) * the._$scroller.scrollTop / (the._$scroller.scrollHeight - the._$scroller.offsetHeight);
            });

            // cursor
            the._editor.on('cursorActivity', the._saveLocal.bind(the));


            event.on(the._$wrapper, 'dragenter dragover', the._ondrag.bind(the));
            event.on(the._$wrapper, 'drop', the._ondrop.bind(the));
            event.on(the._$wrapper, 'paste', the._onpaste.bind(the));
            event.on(the._$wrapper, 'click', the._onclick.bind(the));
        },


        /**
         * 设置 at 列表
         * @param list {Array} 列表
         * @returns {Editor}
         */
        setAtList: function (list) {
            var the = this;

            if (the._adaptMobile) {
                return the;
            }

            the._atList = list;
            return the;
        },


        /**
         * 拖拽回调
         * @private
         */
        _ondrag: function (eve) {
            return false;
        },


        /**
         * 释放回调
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
         * 单击编辑器
         * @private
         */
        _onclick: function () {
            var the = this;

            if (!the._editor.hasFocus()) {
                the._editor.focus();
            }
        },


        /**
         * 解析拖拽、粘贴里的图片信息
         * @param eve
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
                            url: win.URL.createObjectURL(item.getAsFile()),
                            file: file
                        });
                    }
                }
            });

            if (the._uploadList.length) {
                eve.preventDefault();
                the._uploadDialog();
            } else if (eve.dataTransfer && eve.dataTransfer.files && eve.dataTransfer.files.length ||
                eve.clipboardData && eve.clipboardData.files && eve.clipboardData.files.length) {
                eve.preventDefault();

                return alert('请拖拽或粘贴图片文件');
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
            var options = the._options;

            if (typeis(options.uploadCallback) !== 'function') {
                return alert('尚未配置上传回调');
            }

            if (the._dialog) {
                the._dialog.destroy();
                modification.remove(the._$dialog);
                the._dialog = null;
            }

            $dialog = modification.parse(tpl.render(dt))[0];
            modification.insert($dialog, doc.body, 'beforeend');
            the._$dialog = $dialog;
            the._dialog = new Dialog($dialog, {
                title: '上传' + the._uploadList.length + '张图片（0%）',
                hideClose: true
            }).open();
            the._doUpload();
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

                if (err) {
                    alert(err.message).on('close', function () {
                        the.uploadDestroy();
                    });
                    return;
                }

                dato.each(list, function (index, img) {
                    // 预加载
                    var _img = new Image();

                    _img.src = img.url;
                    html.push('![](' + img.url +
                        (typeis.undefined(img.width) ? '' : ' =' + img.width + 'x' + img.height) + ')');
                });

                the.replace(html.join(' '));
                the.uploadDestroy();
            };

            the._options.uploadCallback.call(the, list, onprogress, ondone);
        },


        /**
         * 销毁上传实例
         * @private
         */
        uploadDestroy: function () {
            var the = this;

            if (the._adaptMobile) {
                return the;
            }

            the._dialog.destroy(function () {
                modification.remove(the._$dialog);
                the._editor.focus();
            });
        },


        /**
         * 添加事件回调
         * @param extraKey
         * @param mainKey
         * @param callback
         * @private
         */
        _addKeyMap: function (extraKey, mainKey, callback) {
            var the = this;
            var ctrl = the._isMac ? 'Cmd-' : 'Ctrl-';
            var map = {};

            switch (extraKey) {
                case null:
                    map[mainKey] = callback;
                    break;

                case 'shift':
                    map['Shift-' + mainKey] = callback;
                    break;

                case 'ctrl':
                    map[ctrl + mainKey] = callback;
                    break;
            }

            the._editor.addKeyMap(map);
        },


        /**
         * 获取内容
         * @returns {*}
         */
        getValue: function () {
            var the = this;

            return the._adaptMobile ? the._$ele.value : the._editor.getValue();
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

            if (the._adaptMobile) {
                modification.unwrap(the._$ele, 'div');
            } else {
                event.un(the._$scroller, 'scroll', the._onscroll);
                event.un(the._$wrapper, 'input', the._oninput);
                event.un(the._$wrapper, 'dragenter dragover', the._ondrag);
                event.un(the._$wrapper, 'drop', the._ondrop);
                event.un(the._$wrapper, 'paste', the._onpaste);
                this._editor.toTextArea();
            }
        }
    });

    Editor.defaults = defaults;
    require('../../core/event/hotkey.js');
    markedRender.image = require('./marked-render-image.js');
    markedRender.table = require('./marked-render-table.js');
    ui.importStyle(style);
    module.exports = Editor;
});
