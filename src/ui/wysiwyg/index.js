/**
 * 可写内容区域的操作
 * @link https://github.com/wysiwygjs/wysiwyg.js/blob/master/src/wysiwyg.js
 * @author ydr.me
 * @create 2015-12-24 16:32
 */


define(function (require, exports, module) {
    'use strict';

    var w = window;
    var d = document;
    var ui = require('../index.js');
    var allocation = require('../../utils/allocation.js');
    var controller = require('../../utils/controller.js');
    var typeis = require('../../utils/typeis.js');
    var dato = require('../../utils/dato.js');
    var random = require('../../utils/random.js');
    var event = require('../../core/event/base.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var rangy = require('../../3rd/rangy/core.js');
    window.rangy = rangy;
    require('../../3rd/rangy/save-restore-selection.js')(rangy);

    var REG_BLOCK_TAG = /^h[1-6]|div|p$/i;
    var supportWindowGetSelection = !!w.getSelection;
    var supportDocumentSelection = !!d.selection;
    var namespace = 'donkey-ui-wysiwyg';
    var defaults = {};
    var Wysiwyg = ui.create({
        constructor: function ($wysiwyg, options) {
            var the = this;

            the._eWysiwyg = selector.query($wysiwyg)[0];
            the._options = dato.extend({}, defaults, options);
            the._lastSavedSelection = null;
            the._trailingDiv = null;
            the._initEvent();
        },


        _initEvent: function () {
            var the = this;

            event.on(the._eWysiwyg, the._event1 = 'focus blur mousedown selectstart selectchange selectend', the._on1 = controller.debounce(function (eve) {
                the.emit('selectionChange');
            }));

            event.on(the._eWysiwyg, the._event2 = 'input change', the._on2 = controller.debounce(function (eve) {
                the.emit('contentChange');
            }));
        },


        _IEtrailingDIV: function () {
            var the = this;
            var node_wysiwyg = the._eWysiwyg;

            // Detect IE - http://stackoverflow.com/questions/17907445/how-to-detect-ie11
            if (document.all || !!w.MSInputMethodContext) {
                var trailingDiv = the._trailingDiv = document.createElement('DIV');
                node_wysiwyg.appendChild(trailingDiv);
            }
        },


        //_restoreSelection: function () {
        //    var the = this;
        //
        //    if (!the._lastSavedSelection) {
        //        return;
        //    }
        //
        //    if (supportWindowGetSelection) {
        //        var sel = w.getSelection();
        //        sel.removeAllRanges();
        //        sel.addRange(the._lastSavedSelection);
        //    } else if (supportDocumentSelection) {
        //        the._lastSavedSelection.select();
        //    }
        //},


        /**
         * @link http://stackoverflow.com/questions/2234979/how-to-check-in-javascript-if-one-element-is-a-child-of-another
         * @param ancestor
         * @param descendant
         * @returns {boolean}
         */
        _isOrContainsNode: function (ancestor, descendant) {
            var node = descendant;
            while (node) {
                if (node === ancestor) {
                    return true;
                }

                node = node.parentNode;
            }
            return false;
        },


        _selectionInside: function (force) {
            var the = this;
            var sel;
            var range;
            var containerNode = the._eWysiwyg;

            // selection inside editor?
            if (supportWindowGetSelection) {
                sel = w.getSelection();
                if (the._isOrContainsNode(containerNode, sel.anchorNode) &&
                    the._isOrContainsNode(containerNode, sel.focusNode)) {
                    return true;
                }
                // selection at least partly outside editor
                if (!force) {
                    return false;
                }
                // force selection to editor
                range = document.createRange();
                range.selectNodeContents(containerNode);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            } else if (supportDocumentSelection) {
                sel = document.selection;

                // e.g. an image selected
                if (sel.type === 'Control') {
                    // http://msdn.microsoft.com/en-us/library/ie/hh826021%28v=vs.85%29.aspx
                    range = sel.createRange();
                    // test only the first element
                    if (range.length !== 0 && the._isOrContainsNode(containerNode, range(0))) {
                        return true;
                    }
                } else {
                    // Range of container
                    // http://stackoverflow.com/questions/12243898/how-to-select-all-text-in-contenteditable-div
                    var rangeContainer = document.body.createTextRange();
                    rangeContainer.moveToElementText(containerNode);
                    // Compare with selection range
                    range = sel.createRange();
                    if (rangeContainer.inRange(range)) {
                        return true;
                    }
                }

                // selection at least partly outside editor
                if (!force) {
                    return false;
                }
                // force selection to editor
                // http://stackoverflow.com/questions/12243898/how-to-select-all-text-in-contenteditable-div
                range = document.body.createTextRange();
                range.moveToElementText(containerNode);
                range.setEndPoint('StartToEnd', range); // collapse
                range.select();
            }
            return true;
        },


        /**
         * @link http://stackoverflow.com/questions/8513368/collapse-selection-to-start-of-selection-not-div
         */
        _collapseSelectionEnd: function () {
            var sel;
            if (supportWindowGetSelection) {
                sel = w.getSelection();
                if (!sel.isCollapsed) {
                    // Form-submits via Enter throw 'NS_ERROR_FAILURE' on Firefox 34
                    try {
                        sel.collapseToEnd();
                    } catch (e) {
                        // ignore
                    }
                }
            } else if (supportDocumentSelection) {
                sel = document.selection;

                if (sel.type !== 'Control') {
                    var range = sel.createRange();
                    range.collapse(false);
                    range.select();
                }
            }
        },


        // Command structure
        _callUpdates: function (selectionDestroyed) {
            var the = this;

            // Remove IE11 workaround
            if (the._trailingDiv) {
                the._eWysiwyg.removeChild(the._trailingDiv);
                the._trailingDiv = null;
            }

            // handle saved selection
            if (selectionDestroyed) {
                the._collapseSelectionEnd();
                // selection destroyed
                the._lastSavedSelection = null;
            } else {
                the.restoreSelection();
            }
        },


        /**
         * @link https://developer.mozilla.org/en-US/docs/Web/API/document.execCommand
         * @link http://www.quirksmode.org/dom/execCommand.html
         * @param command
         * @param param
         * @param forceSelection
         * @private
         */
        _exec: function (command, param, forceSelection) {
            var the = this;

            // give selection to contenteditable element
            the.restoreSelection();

            // tried to avoid forcing focus(), but ... - https://github.com/wysiwygjs/wysiwyg.js/issues/51
            the._eWysiwyg.focus();

            // returns 'selection inside editor'
            if (!the._selectionInside(forceSelection)) {
                return false;
            }

            // for webkit, mozilla, opera
            if (supportWindowGetSelection) {
                // Buggy, call within 'try/catch'
                try {
                    if (document.queryCommandSupported && !document.queryCommandSupported(command)) {
                        return false;
                    }

                    return document.execCommand(command, false, param);
                } catch (e) {
                    // ignore
                }
            }
            // for IE
            else if (supportDocumentSelection) {
                var sel = document.selection;
                if (sel.type !== 'None') {
                    var range = sel.createRange();
                    // Buggy, call within 'try/catch'
                    try {
                        if (!range.queryCommandEnabled(command)) {
                            return false;
                        }

                        return range._exec(command, false, param);
                    } catch (e) {
                        // ignore
                    }
                }
            }
            return false;
        },


        /**
         * 当前位置粘贴 html
         * @link http://stackoverflow.com/questions/6690752/insert-html-at-caret-in-a-contenteditable-div/6691294#6691294
         * @link http://stackoverflow.com/questions/4823691/insert-an-html-element-in-a-contenteditable-element
         * @link http://stackoverflow.com/questions/6139107/programatically-select-text-in-a-contenteditable-html-element
         * @param html
         */
        _pasteHtmlAtCaret: function (html) {
            var the = this;
            var sel;
            var range;
            var containerNode = the._eWysiwyg;

            if (supportWindowGetSelection) {
                // IE9 and non-IE
                sel = w.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    // Range.createContextualFragment() would be useful here but is
                    // only relatively recently standardized and is not supported in
                    // some browsers (IE9, for one)
                    var el = document.createElement('div');
                    el.innerHTML = html;
                    var frag = document.createDocumentFragment(), node, lastNode;
                    while ((node = el.firstChild)) {
                        lastNode = frag.appendChild(node);
                    }
                    if (the._isOrContainsNode(containerNode, range.commonAncestorContainer)) {
                        range.deleteContents();
                        range.insertNode(frag);
                    }
                    else {
                        containerNode.appendChild(frag);
                    }
                    // Preserve the selection
                    if (lastNode) {
                        range = range.cloneRange();
                        range.setStartAfter(lastNode);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            } else if (supportDocumentSelection) {
                // IE <= 8
                sel = document.selection;
                if (sel.type !== 'Control') {
                    var originalRange = sel.createRange();
                    originalRange.collapse(true);
                    range = sel.createRange();
                    if (the._isOrContainsNode(containerNode, range.parentElement())) {
                        range.pasteHTML(html);
                    }
                    // simply append to Editor
                    else {
                        var textRange = document.body.createTextRange();
                        textRange.moveToElementText(containerNode);
                        textRange.collapse(false);
                        textRange.select();
                        textRange.pasteHTML(html);
                    }

                    // Preserve the selection
                    range = sel.createRange();
                    range.setEndPoint('StartToEnd', originalRange);
                    range.select();
                }
            }
        },

        _getSelectionCollapsed: function () {
            var the = this;
            var containerNode = the._eWysiwyg;
            var sel;

            if (supportWindowGetSelection) {
                sel = w.getSelection();

                return !!sel.isCollapsed;
            } else if (supportDocumentSelection) {
                sel = document.selection;

                if (sel.type === 'Text') {
                    var range = document.selection.createRange();
                    var textrange = document.body.createTextRange();
                    textrange.moveToElementText(containerNode);
                    textrange.setEndPoint('EndToStart', range);
                    return range.htmlText.length === 0;
                }

                // e.g. an image selected
                if (sel.type === 'Control') {
                    return false;
                }

                // sel.type == 'None' -> collapsed selection
            }

            return true;
        },


        // http://stackoverflow.com/questions/4652734/return-html-from-a-user-selected-text/4652824#4652824
        _getSelectionHtml: function () {
            var the = this;
            var sel;

            if (the._getSelectionCollapsed()) {
                return null;
            }

            if (supportWindowGetSelection) {
                sel = w.getSelection();
                if (sel.rangeCount) {
                    var container = document.createElement('div'),
                        len = sel.rangeCount;
                    for (var i = 0; i < len; ++i) {
                        var contents = sel.getRangeAt(i).cloneContents();
                        container.appendChild(contents);
                    }
                    return container.innerHTML;
                }
            } else if (supportDocumentSelection) {
                sel = document.selection;
                if (sel.type === 'Text') {
                    var range = sel.createRange();
                    return range.htmlText;
                }
            }
            return null;
        },


        ///**
        // * @link http://stackoverflow.com/questions/15157435/get-last-character-before-caret-position-in-javascript
        // * @link http://stackoverflow.com/questions/11247737/how-can-i-get-the-word-that-the-caret-is-upon-inside-a-contenteditable-div
        // * @param preceding
        // * @param following
        // * @private
        // */
        //_expandSelectionCaret: function (preceding, following) {
        //    var sel;
        //    var range;
        //    var i = 0;
        //
        //    if (supportWindowGetSelection) {
        //        sel = w.getSelection();
        //        if (sel.modify) {
        //            for (i = 0; i < preceding; ++i) {
        //                sel.modify('extend', 'backward', 'character');
        //            }
        //            for (i = 0; i < following; ++i) {
        //                sel.modify('extend', 'forward', 'character');
        //            }
        //        }
        //        else {
        //            // not so easy if the steps would cover multiple nodes ...
        //            range = sel.getRangeAt(0);
        //            range.setStart(range.startContainer, range.startOffset - preceding);
        //            range.setEnd(range.endContainer, range.endOffset + following);
        //            sel.removeAllRanges();
        //            sel.addRange(range);
        //        }
        //    }
        //    else if (supportDocumentSelection) {
        //        sel = document.selection;
        //        if (sel.type !== 'Control') {
        //            range = sel.createRange();
        //            range.collapse(true);
        //            range.moveStart('character', -preceding);
        //            range.moveEnd('character', following);
        //            range.select();
        //        }
        //    }
        //},


        /**
         * 保存选区
         * @private
         */
        _saveRange: function () {
            var sel = rangy.getSelection();
            // 缓存下这些变量，因为 replace 之后 selection 会变化
            var anchorNode = sel.anchorNode;
            var anchorOffset = sel.anchorOffset;
            var focusNode = sel.focusNode;
            var focusOffset = sel.focusOffset;

            this._lastRange = {
                an: anchorNode,
                ao: anchorOffset,
                fn: focusNode,
                fo: focusOffset
            };
        },


        /**
         * 恢复选区
         * @private
         */
        _restoreRange: function () {
            var lastRng = this._lastRange;
            var rng = rangy.createRange();
            rng.setStart(lastRng.an, lastRng.ao);
            rng.setEnd(lastRng.fn, lastRng.fo);

            var sel = rangy.getSelection();
            sel.setSingleRange(rng);
        },


        /**
         * 获取最近的父级块状元素
         * @returns {Object}
         */
        _getClosestBlock: function () {
            var the = this;
            var focusNode = the.isFocus();

            if (!focusNode) {
                return null;
            }

            var checkNode = focusNode;
            while (checkNode !== the._eWysiwyg) {
                var tagName = checkNode.tagName;
                if (REG_BLOCK_TAG.test(tagName)) {
                    return checkNode;
                }
                checkNode = checkNode.parentNode;
            }

            return null;
        },


        // ====================================
        // =============[ public ]=============
        // ====================================


        /**
         * 获取 HTML
         * @returns {*}
         */
        getHTML: function () {
            return this._eWysiwyg.innerHTML;
        },


        /**
         * 获取文本
         * @returns {*|string|string}
         */
        getText: function () {
            return this._eWysiwyg.innerText || this._eWysiwyg.textContent;
        },


        /**
         * 设置 HTML
         * @param html
         * @returns {Wysiwyg}
         */
        setHTML: function (html) {
            var the = this;

            the._eWysiwyg.innerHTML = html || '<br>';
            the._callUpdates(true); // selection destroyed
            return the;
        },


        /**
         * 获取当前选中的 HTML
         * @returns {*}
         */
        getSelectedHTML: function () {
            var the = this;
            the.restoreSelection();

            if (!the._selectionInside()) {
                return null;
            }

            return the._getSelectionHtml();
        },


        /**
         * 选择节点
         * @param node
         * @returns {Wysiwyg}
         */
        select: function (node) {
            var the = this;
            var sel = rangy.getSelection();
            var rng = rangy.createRange();

            rng.selectNode(node);
            sel.setSingleRange(rng);
            return the;
        },


        /**
         * 编辑器可写
         * @returns {Wysiwyg}
         */
        enable: function () {
            var the = this;
            the._eWysiwyg.setAttribute('contentEditable', 'true'); // IE7 is case sensitive
            the.emit('selectionChange');
            return the;
        },


        /**
         * 编辑器不可写
         * @returns {Wysiwyg}
         */
        disable: function () {
            var the = this;
            the._eWysiwyg.removeAttribute('contentEditable');
            the.emit('selectionChange');
            return the;
        },


        /**
         * 聚焦
         * @param [end=true] {Boolean} 是否聚焦的末尾
         * @returns {Wysiwyg}
         */
        focus: function (end) {
            var the = this;
            the._eWysiwyg.focus();
            if (end !== false) {
                controller.nextFrame(function () {
                    var sel = rangy.getSelection();
                    var rng = rangy.createRange();

                    rng.selectNodeContents(the._eWysiwyg);
                    rng.collapse(false);
                    sel.setSingleRange(rng);
                    the.saveSelection();
                    the.emit('selectionChange');
                });
            }
            the.emit('selectionChange');
            return the;
        },


        /**
         * 是否聚焦
         * @returns {boolean}
         */
        isFocus: function () {
            var the = this;
            var sel = rangy.getSelection();

            if (!sel.rangeCount) {
                return false;
            }

            var focusNode = sel.focusNode;
            var checkNode = focusNode;

            while (checkNode && checkNode !== d) {
                if (checkNode === the._eWysiwyg) {
                    return focusNode;
                }

                checkNode = checkNode.parentNode;
            }

            return false;
        },


        /**
         * 聚焦
         * @returns {Wysiwyg}
         */
        blur: function () {
            var the = this;
            the._eWysiwyg.blur();
            the.emit('selectionChange');
            return the;
        },


        ///**
        // * 释放选区
        // * @returns {Wysiwyg}
        // */
        //collapseSelection: function () {
        //    var the = this;
        //    the._collapseSelectionEnd();
        //    the._lastSavedSelection = null; // selection destroyed
        //    return the;
        //},


        ///**
        // * 扩大选区
        // * @param preceding {Number} 选区之前长度
        // * @param following {Number} 选区之后长度
        // * @returns {Wysiwyg}
        // */
        //expandSelection: function (preceding, following) {
        //    var the = this;
        //
        //    the.restoreSelection();
        //    if (!the._selectionInside()) {
        //        return the;
        //    }
        //
        //    the._expandSelectionCaret(preceding, following);
        //    the.saveSelection();
        //    return the;
        //},


        /**
         * 保存选区
         * @returns {*}
         */
        saveSelection: function () {
            var the = this;
            //var sel;
            //
            //if (supportWindowGetSelection) {
            //    sel = w.getSelection();
            //    if (sel.rangeCount > 0) {
            //        the._lastSavedSelection = sel.getRangeAt(0);
            //    }
            //} else if (supportDocumentSelection) {
            //    sel = document.selection;
            //    the._lastSavedSelection = sel.createRange();
            //} else {
            //    the._lastSavedSelection = null;
            //}

            the._lastSavedSelection = rangy.saveSelection();
            return the;
        },


        /**
         * 恢复选区
         * @param [preserveDirection=true] {Boolean} 保留方向
         * @returns {Wysiwyg}
         */
        restoreSelection: function (preserveDirection) {
            var the = this;
            //var range = the._lastSavedSelection;
            //
            //if (!range) {
            //    return the;
            //}
            //
            //if (supportWindowGetSelection) {
            //    var sel = w.getSelection();
            //    sel.removeAllRanges();
            //    sel.addRange(range);
            //} else if (supportDocumentSelection && range.select) { // IE
            //    range.select();
            //}

            if (the._lastSavedSelection) {
                rangy.restoreSelection(the._lastSavedSelection, preserveDirection !== false);
                the._lastSavedSelection = null;
            }

            return the;
        },


        /**
         * 包裹当前选区
         * @link http://stackoverflow.com/a/19987884
         * @param tagName
         * @param attributes
         * @returns {Wysiwyg}
         */
        wrap: function (tagName, attributes) {
            var the = this;
            the.restoreSelection();
            var sel = rangy.getSelection();
            var rng = sel.getRangeAt(0);
            the.saveSelection();
            var collapsed = rng.collapsed;
            var url = genId();

            tagName = tagName.toUpperCase();
            the.createLink(url);

            var eLinks = selector.query('a', the._eWysiwyg);
            var eLink = selector.filter(eLinks, function () {
                return attribute.attr(this, 'href') === url;
            })[0];

            if (!eLink) {
                return the;
            }

            if (tagName !== 'A') {
                the._saveRange();
                eLink = modification.replace(eLink, tagName, attributes);
                the._restoreRange();
            }

            if (collapsed) {
                if (tagName === 'A') {
                    attribute.html(eLink, attributes.title || attributes.href);
                }

                rng = rangy.createRange();
                rng.setStartAfter(eLink);
                sel.setSingleRange(rng);
                the.saveSelection();
                the.emit('selectionChange');
            }

            eLink.id = url;
            attribute.attr(eLink, attributes);

            return the;
        },


        /**
         * 替换块级标签
         * @param tagName
         * @param [attributes]
         * @returns {Wysiwyg}
         */
        replace: function (tagName, attributes) {
            var the = this;
            the.restoreSelection();
            var blockEle = the._getClosestBlock();

            if (blockEle) {
                the._saveRange();
                attributes = attributes || {};
                attributes.id = attributes.id || genId();
                modification.replace(blockEle, tagName, attributes);
                the._restoreRange();
            }

            return the;
        },


        /**
         * 插入元素
         * @param tagName
         * @param [attributes]
         * @param [focus]
         * @returns {Wysiwyg}
         */
        insert: function (tagName, attributes, focus) {
            var args = allocation.args(arguments);
            var the = this;
            var id = genId();
            var html = '<' + tagName + ' id="' + id + '">';

            the.insertHTML(html);
            var ele = selector.query('#' + id)[0];

            if (!ele) {
                return the;
            }

            var lastArg = args[args.length - 1];

            if (typeis.Boolean(lastArg)) {
                focus = lastArg;
                attributes = {};
            }

            // focus
            if (focus !== false) {
                var sel = rangy.getSelection();
                var rng = rangy.createRange();

                rng.setStart(ele, 0);
                rng.setEnd(ele, 0);
                rng.collapse();
                sel.setSingleRange(rng);
                the.saveSelection();
                the.emit('selectionChange');
            }

            attribute.attr(ele, attributes);
        },


        /**
         * 加粗
         * @returns {Wysiwyg}
         */
        bold: function () {
            var the = this;

            the._exec('bold');
            the._callUpdates();
            return the;
        },


        /**
         * 斜体
         * @returns {Wysiwyg}
         */
        italic: function () {
            var the = this;
            the._exec('italic');
            the._callUpdates();
            return the;
        },


        /**
         * 下划线
         * @returns {Wysiwyg}
         */
        underline: function () {
            var the = this;
            the._exec('underline');
            the._callUpdates();
            return the;
        },


        /**
         * 删除线
         * @returns {Wysiwyg}
         */
        strikethrough: function () {
            var the = this;
            the._exec('strikethrough');
            the._callUpdates();
            return the;
        },


        /**
         * 前景色
         * @param color
         * @returns {Wysiwyg}
         */
        foreColor: function (color) {
            var the = this;
            the._exec('foreColor', color);
            the._callUpdates();
            return the;
        },


        /**
         * 背景色
         * @param color
         * @returns {Wysiwyg}
         */
        backColor: function (color) {
            var the = this;
            // @link http://stackoverflow.com/questions/2756931/highlight-the-text-of-the-dom-range-element
            if (!the._exec('hiliteColor', color)) {
                // some browsers apply 'backColor' to the whole block
                the._exec('backColor', color);
            }
            the._callUpdates();
            return the;
        },


        /**
         * 字体名称
         * @param fontName
         * @returns {Wysiwyg}
         */
        fontName: function (fontName) {
            var the = this;
            the._exec('fontName', fontName);
            the._callUpdates();
            return the;
        },


        /**
         * 字体大小
         * @param fontSize
         * @returns {Wysiwyg}
         */
        fontSize: function (fontSize) {
            var the = this;
            the._exec('fontSize', fontSize);
            the._callUpdates();
            return the;
        },


        /**
         * 上标
         * @returns {Wysiwyg}
         */
        subscript: function () {
            var the = this;
            the._exec('subscript');
            the._callUpdates();
            return the;
        },


        /**
         * 下标
         * @returns {Wysiwyg}
         */
        superscript: function () {
            var the = this;
            the._exec('superscript');
            the._callUpdates();
            return the;
        },


        /**
         * 左对齐
         * @returns {Wysiwyg}
         */
        justifyLeft: function () {
            var the = this;
            the._IEtrailingDIV();
            the._exec('justifyLeft');
            the._callUpdates();
            return the;
        },


        /**
         * 居中对齐
         * @returns {Wysiwyg}
         */
        justifyCenter: function () {
            var the = this;
            the._IEtrailingDIV();
            the._exec('justifyCenter');
            the._callUpdates();
            return the;
        },


        /**
         * 右对齐
         * @returns {Wysiwyg}
         */
        justifyRight: function () {
            var the = this;
            the._IEtrailingDIV();
            the._exec('justifyRight');
            the._callUpdates();
            return the;
        },


        /**
         * 两边对齐
         * @returns {Wysiwyg}
         */
        justifyFull: function () {
            var the = this;
            the._IEtrailingDIV();
            the._exec('justifyFull');
            the._callUpdates();
            return the;
        },


        /**
         * 格式化
         * @param tagname
         * @returns {*}
         */
        format: function (tagname) {
            var the = this;
            the._IEtrailingDIV();
            the._exec('formatBlock', tagname);
            the._callUpdates();
            return the;
        },


        /**
         * 移除格式化
         * @returns {Wysiwyg}
         */
        removeFormat: function () {
            var the = this;
            the._exec('removeFormat');
            the._exec('unlink');
            the._callUpdates();
            return the;
        },


        /**
         * 增加缩进
         * @returns {Wysiwyg}
         */
        indent: function () {
            var the = this;
            the._IEtrailingDIV();
            the._exec('indent');
            the._callUpdates();
            return the;
        },


        /**
         * 减少缩进
         * @returns {Wysiwyg}
         */
        outdent: function () {
            var the = this;
            the._IEtrailingDIV();
            the._exec('outdent');
            the._callUpdates();
            return the;
        },


        /**
         * 插入链接
         * @param url
         * @returns {Wysiwyg}
         */
        createLink: function (url) {
            var the = this;
            the._exec('createLink', url);
            the._callUpdates(true); // selection destroyed
            return the;
        },


        /**
         * 插入链接
         * @returns {Wysiwyg}
         */
        unlink: function () {
            var the = this;
            the._exec('unlink');
            the._callUpdates();
            return the;
        },


        /**
         * 插入图片
         * @param url
         * @returns {Wysiwyg}
         */
        insertImage: function (url) {
            var the = this;
            the._exec('insertImage', url, true);
            the._callUpdates(true); // selection destroyed
            return the;
        },


        /**
         * 插入 html
         * @link https://github.com/jakiestfu/Medium.js/blob/master/src/Medium/Injector.js#L61
         * @param html {String} 插入的 HTML
         * @param [select=false] {Boolean} 是否选中插入的内容
         * @returns {Wysiwyg}
         */
        insertHTML: function (html, select) {
            var the = this;
            //var sel;
            //var range;
            //
            //if (supportWindowGetSelection) {
            //    sel = w.getSelection();
            //    if (sel.getRangeAt && sel.rangeCount) {
            //        range = sel.getRangeAt(0);
            //        range.deleteContents();
            //
            //        // Range.createContextualFragment() would be useful here but is
            //        // only relatively recently standardized and is not supported in
            //        // some browsers (IE9, for one)
            //        var el = d.createElement('div');
            //        el.innerHTML = html;
            //        var frag = d.createDocumentFragment(), node, lastNode;
            //        while ((node = el.firstChild)) {
            //            lastNode = frag.appendChild(node);
            //        }
            //        var firstNode = frag.firstChild;
            //        range.insertNode(frag);
            //
            //        // Preserve the selection
            //        if (lastNode) {
            //            range = range.cloneRange();
            //            range.setStartAfter(lastNode);
            //            if (select) {
            //                range.setStartBefore(firstNode);
            //            } else {
            //                range.collapse(true);
            //            }
            //            sel.removeAllRanges();
            //            sel.addRange(range);
            //        }
            //    }
            //} else if (supportDocumentSelection) {
            //    sel = document.selection;
            //
            //    if (sel && sel.type !== 'Control') {
            //        // IE < 9
            //        var originalRange = sel.createRange();
            //        originalRange.collapse(true);
            //        sel.createRange().pasteHTML(html);
            //        if (select) {
            //            range = sel.createRange();
            //            range.setEndPoint("StartToStart", originalRange);
            //            range.select();
            //        }
            //    }
            //}

            //if(supportWindowGetSelection){
            //    sel = w.getSelection();
            //    if (sel.getRangeAt && sel.rangeCount) {
            //
            //    }
            //}

            if (!the._exec('insertHTML', html, true)) {
                // IE 11 still does not support 'insertHTML'
                the.restoreSelection();
                the._selectionInside(true);
                the._pasteHtmlAtCaret(html);
            }
            the._callUpdates(true); // selection destroyed
            return the;
        },


        /**
         * 插入有序列表
         * @returns {Wysiwyg}
         */
        insertOrderedList: function () {
            var the = this;
            the._IEtrailingDIV();
            the._exec('insertOrderedList');
            the._callUpdates();
            return the;
        },


        /**
         * 插入无须列表
         * @returns {Wysiwyg}
         */
        insertUnorderedList: function () {
            var the = this;
            the._IEtrailingDIV();
            the._exec('insertUnorderedList');
            the._callUpdates();
            return the;
        },


        /**
         * 判断命令状态
         * @param command
         * @returns {*}
         */
        isState: function (command) {
            try {
                return document.queryCommandState(command);
            } catch (err) {
                return false;
            }
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            event.un(the._eWysiwyg, the._event1, the._on1);
            event.un(the._eWysiwyg, the._event2, the._on2);
        }
    });

    /**
     * 生成随机 ID
     * @returns {string}
     */
    function genId() {
        return namespace + random.guid();
    }

    Wysiwyg.defaults = defaults;
    module.exports = Wysiwyg;
});
