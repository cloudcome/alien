/*!
 * 图片上传
 * @author ydr.me
 * @create 2014-12-23 13:56
 */


define(function (require, exports, module) {
    'use strict';

    var ui = require('../index.js');
    var compatible = require('../../core/navigator/compatible.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/base.js');
    var typeis = require('../../utils/typeis.js');
    var dato = require('../../utils/dato.js');
    var canvas = modification.create('canvas');
    var canvasImg = require('../../canvas/img.js');
    var canvasContent = require('../../canvas/content.js');
    var xhr = require('../../core/communication/xhr.js');
    var Dialog = require('../../ui/dialog/');
    var Imgclip = require('../../ui/img-clip/');
    var Template = require('../../libs/template.js');
    var template = require('./template.html', 'html');
    var style = require('./style.css', 'css');
    var tpl = new Template(template);
    var URL = window[compatible.html5('URL', window)];
    var alienKey = 'alien-ui-upload';
    var defaults = {
        isClip: true,
        minWidth: 200,
        minHeight: 200,
        accept: 'image/png,image/jpg,image/jpeg,image/gif,image/bmp',
        ratio: 1,
        // image 图片质量
        quality: 1,
        ajax: {
            // xhr options 都可以传进来
            url: '',
            method: 'put',
            headers: {},
            body: {},
            fileKey: 'file'
        }
    };
    var Upload = ui.create({
        constructor: function (options) {
            var the = this;

            the._options = dato.extend(true, {}, defaults, options);
            the.destroyed = false;
            the._isChoosed = false;
            the._isReady = false;
            the.className = 'img-upload';
            the._initNode();
            the._applyOptions();
            the._initEvent();
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;
            var dialogHTML = tpl.render(options);
            var $dialog = modification.parse(dialogHTML)[0];

            modification.insert($dialog, document.body, 'beforeend');
            the._$dialog = $dialog;
            the._dialog = new Dialog(the._$dialog, {
                width: 'auto'
            });

            var nodes = selector.query('.j-flag', $dialog);

            the._$file = nodes[0];
            the._$imageWrap = nodes[1];
            the._$cancel = nodes[2];
            the._$submit = nodes[3];
        },


        /**
         * 应用配置
         * @private
         */
        _applyOptions: function () {
            var the = this;
            var options = the._options;

            the._dialog.setTitle((options.isClip ? '裁剪并' : '') + '上传图片');
            the._$submit.innerHTML = the._submitHTML = (options.isClip ? '裁剪并' : '确认') + '上传图片';
            the._setChoosed(false);
            the._resetFile();

            if (the._imgclip) {
                the._imgclip.destroy();
                the._imgclip = null;
            }
        },


        /**
         * 重置 input:file
         * @private
         */
        _resetFile: function () {
            var the = this;

            if (!the._$file.files) {
                return;
            }

            var options = the._options;
            var $newFile = modification.create('input', {
                type: 'file',
                accept: options.accept,
                'class': alienKey + '-file'
            });

            modification.insert($newFile, the._$file, 'afterend');
            modification.remove(the._$file);
            the._$file = $newFile;
        },


        /**
         * 设置是否选择了图片
         * @param boolean
         * @private
         */
        _setChoosed: function (boolean) {
            var the = this;

            if (the._isChoosed === boolean) {
                return;
            }

            the._isChoosed = boolean;
            attribute[(boolean ? 'add' : 'remove') + 'Class'](the._$dialog, alienKey + '-choosed');

            if (!boolean) {
                the._setReady(boolean);
            }
        },


        /**
         * 设置是否可以准备上传了
         * @param boolean
         * @private
         */
        _setReady: function (boolean) {
            var the = this;

            if (the._isReady === boolean) {
                return;
            }

            the._isReady = boolean;
            attribute[(boolean ? 'add' : 'remove') + 'Class'](the._$dialog, alienKey + '-ready');
            the._dialog.resize();
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;

            the._dialog.on('beforeopen', function () {
                the._applyOptions();
            });

            the._dialog.on('close', function () {
                if (the._xhr) {
                    the._xhr.abort();
                }
            });

            // 选择图片
            event.on(the._$dialog, 'change', '.' + alienKey + '-file', function (eve) {
                var file;

                if (this.files && this.files.length) {
                    file = this.files[0];

                    if (this.accept.indexOf(file.type) > -1) {
                        /**
                         * 选择图片
                         * @event choose
                         * @param eve
                         */
                        the.emit('choose', eve);
                        the._setChoosed(true);
                        the._renderImg(file);
                    } else {
                        /**
                         * 错误文件类型
                         * @event error
                         * @param Error
                         */
                        the.emit('error', new Error('只能选择图片文件！'));
                    }
                }
            });


            // 取消选择
            event.on(the._$cancel, 'click', function () {
                if (the._isUpload) {
                    return;
                }

                the._applyOptions();
                the._dialog.resize();
                /**
                 * 取消选择图片
                 * @event cancel
                 */
                the.emit('cancel');
            });


            // 点击上传
            event.on(the._$submit, 'click', function () {
                if (the._isUpload) {
                    return;
                }

                /**
                 * 上传图片
                 * @event upload
                 */
                if (the.emit('upload') === false) {
                    return;
                }

                the.upload();
            });


            // 拖拽、粘贴
            event.on(document, 'dragenter dragover', the._ondrag.bind(the));
            event.on(document, 'drop', the._ondrop.bind(the));
            event.on(document, 'paste', the._onpaste.bind(the));
        },


        /**
         * 上传文件
         */
        upload: function () {
            var the = this;
            var options = the._options;

            if (the._isUpload) {
                return;
            }

            if (options.isClip) {
                the._toBlob(function (blob) {
                    the._toUpload(blob);
                });
            } else {
                the._toUpload(the._file);
            }
        },


        /**
         * 拖拽回调
         * @returns {boolean}
         * @private
         */
        _ondrag: function () {
            var the = this;

            if (the._dialog._window.visible) {
                return false;
            }
        },


        /**
         * 释放回调
         * @private
         */
        _ondrop: function (eve) {
            var the = this;

            if (the._dialog._window.visible) {
                the._parseImgList(eve, eve.dataTransfer && eve.dataTransfer.items);
                return false;
            }
        },


        /**
         * 粘贴回调
         * @private
         */
        _onpaste: function (eve) {
            var the = this;

            if (the._dialog._window.visible) {
                the._parseImgList(eve, eve.clipboardData && eve.clipboardData.items);
                return false;
            }
        },


        /**
         * 解析图片列表
         * @param eve
         * @param items
         * @private
         */
        _parseImgList: function (eve, items) {
            var the = this;
            var options = the._options;
            var fileAFile = null;

            dato.each(items, function (index, item) {
                var file;

                if (options.accept.indexOf(item.type) > -1 && item.kind === 'file') {
                    file = item.getAsFile();

                    if (file && file.size > 0) {
                        fileAFile = file;

                        return false;
                    }
                }
            });


            if (fileAFile) {
                the._setChoosed(true);
                the._renderImg(fileAFile);
            }
        },


        /**
         * 渲染图片
         * @param file
         * @private
         */
        _renderImg: function (file) {
            var the = this;
            var src = URL.createObjectURL(file);
            var $img = modification.create('img', {
                src: src
            });
            var options = the._options;

            $img.onload = function () {
                the._dialog.resize();
            };
            the._$imageWrap.innerHTML = '';
            modification.insert($img, the._$imageWrap, 'beforeend');

            if (the._imgclip) {
                the._imgclip.destroy();
            }

            if (options.isClip) {
                the._imgclip = new Imgclip($img, the._options)
                    .on('clipend', function (seletion) {
                        the._selection = seletion;
                        the._setReady(true);
                    })
                    .on('error', function (err) {
                        the.emit('error', err);
                    });
            } else {
                the._setReady(true);
            }

            the._file = file;
            the._$img = $img;
        },


        /**
         * 转换为二进制
         * @param callback
         * @private
         */
        _toBlob: function (callback) {
            var the = this;
            var selection = the._selection;

            canvas.width = selection.srcWidth;
            canvas.height = selection.srcHeight;
            canvasImg(canvas, the._$img, {
                srcLeft: selection.srcLeft,
                srcTop: selection.srcTop,
                srcWidth: selection.srcWidth,
                srcHeight: selection.srcHeight
            });
            canvasContent.toBlob(canvas, callback);
        },


        /**
         * 上传
         * @param blob
         * @private
         */
        _toUpload: function (blob) {
            var the = this;
            var options = the._options;
            var fd = new FormData();
            var ajaxOptions = dato.extend({}, options.ajax);

            the._isUpload = true;

            // key, val, name
            fd.append(ajaxOptions.fileKey, blob);

            dato.each(ajaxOptions.body, function (key, val) {
                fd.append(key, val);
            });

            ajaxOptions.body = fd;
            the._xhr = xhr.ajax(ajaxOptions)
                .on('progress', function (eve) {
                    the._$submit.innerHTML = '正在上传 <b>' + eve.alienDetail.percent + '</b>';
                })
                .on('success', function (json) {
                    if (the.emit('success', json) !== false) {
                        the.close();
                    }
                })
                .on('error', function (err) {
                    if (the.emit('error', err) !== false) {
                        the.close();
                    }
                })
                .on('complete', function (err, json) {
                    the.emit('complete', err, json);
                })
                .on('finish', function (err, json) {
                    the.emit('finish', err, json);
                    the._isUpload = false;
                    the._$submit.innerHTML = the._submitHTML;
                });
        },


        /**
         * 打开上传对话框
         */
        open: function () {
            this._dialog.open();
            return this;
        },


        /**
         * 关闭上传的对话框
         */
        close: function () {
            var the = this;

            the._dialog.close();

            return the;
        },


        /**
         * 销毁实例
         * @param callback
         */
        destroy: function (callback) {
            var the = this;

            if (the.destroyed) {
                return;
            }

            the.destroyed = true;
            event.un(the._$dialog, 'change');
            event.un(the._$cancel, 'click');
            event.un(the._$submit, 'click');
            event.un(document, 'dragenter dragover', the._ondrag);
            event.un(document, 'drop', the._ondrop);
            event.un(document, 'paste', the._onpaste);
            the._applyOptions();
            the._dialog.destroy(callback);
        }
    });

    Upload.defaults = defaults;
    ui.importStyle(style);
    module.exports = Upload;
});