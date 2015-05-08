/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-01-04 21:43
 */


define(function (require, exports, module) {
    /**
     * @module ui/Viewer/
     * @requires ui//
     * @requires ui/Dialog/
     * @requires core/dom/selector
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/event/base
     * @requires libs/Template
     * @requires utils/dato
     * @requires utils/howdo
     */
    'use strict';


    var ui = require('../');
    var Scrollbar = require('../Scrollbar/');
    var Mask = require('../Mask/');
    var Window = require('../Window/index.js');
    var selector = require('../../core/dom/selector.js');
    var attribute = require('../../core/dom/attribute.js');
    var modification = require('../../core/dom/modification.js');
    var event = require('../../core/event/touch.js');
    var Template = require('../../libs/Template.js');
    var templateWrap = require('html!./wrap.html');
    var templateLoading = require('html!./loading.html');
    var template = require('./template.html', 'html');
    var style = require('css!./style.css');
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var controller = require('../../utils/controller.js');
    var howdo = require('../../utils/howdo.js');
    var tplWrap = new Template(templateWrap);
    var tplLoading = new Template(templateLoading);
    var tpl = new Template(template);
    var win = window;
    var alienClass = 'alien-ui-imgview';
    var noop = function () {
        // ignore
    };
    var defaults = {
        minWidth: 100,
        minHeight: 100,
        loading: {
            src: 'http://s.ydr.me/p/i/loading-128.gif',
            width: 64,
            height: 64
        },
        maskStyle: {
            background: 'rgba(0,0,0,.8)'
        },
        thumbnailSize: {
            width: 100,
            height: 100,
            lineHeight: 100
        }
    };
    var Imgview = ui.create(function (options) {
        var the = this;

        the._options = dato.extend(true, {}, defaults, options);
        the._init();
    });

    Imgview.defaults = defaults;

    Imgview.implement({

        /**
         * 初始化
         * @private
         */
        _init: function () {
            var the = this;

            the._initData();
            the._initNode();
            the._initEvent();

            return the;
        },


        /**
         * 初始化数据
         * @private
         */
        _initData: function () {
            var the = this;

            the._list = [];
            the._index = 0;
        },


        /**
         * 初始化节点
         * @private
         */
        _initNode: function () {
            var the = this;
            var options = the._options;

            the._mask = new Mask(window, {
                style: options.maskStyle
            });
            the._window = new Window(null, {
                width: '100%',
                height: '100%',
                top: 0
            });
            the._$window = the._window.getNode();
            the._$window.innerHTML = tpl.render({
                list: the._list
            });

            var nodes = selector.query('.j-flag', the._$window);

            the._$body = nodes[0];
            the._$prevOne = nodes[1];
            the._$nextOne = nodes[2];
            the._$navList = nodes[3];
            the._$prevNav = nodes[4];
            the._$nextNav = nodes[5];
            the._$close = nodes[6];
        },


        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var the = this;
            var onclose = function () {
                the._window.close(function () {
                    the._mask.close();
                });

                return false;
            };

            //// 单击背景
            //the._mask.on('hit', onclose);
            //
            //// 按 esc
            //the._mask.on('esc', onclose);

            // 打开
            the._window.on('open', function () {
                the._show();
            });

            event.on(window, 'resize', the._onresize = controller.debounce(function () {
                the._window.resize();
            }));

            //// 上一张
            //event.on(the._$prev, 'click', function () {
            //    var length = the._list.length;
            //
            //    if (length > 1 && the._index > 0) {
            //        the._index--;
            //        the._show();
            //    }
            //});
            //
            //// 下一张
            //event.on(the._$next, 'click', function () {
            //    var length = the._list.length;
            //
            //    if (length > 1 && the._index < length - 1) {
            //        the._index++;
            //        the._show();
            //    }
            //});s
        },


        /**
         * 加载图片
         * @param src {String} 图片地址
         * @param [callback] {Function} 加载之后
         * @private
         */
        _load: function (src, callback) {
            var img = new Image();
            var index = this._index;

            img.src = src;
            callback = callback || noop;

            if (img.complete) {
                callback(null, {
                    index: index,
                    src: src,
                    width: img.width,
                    height: img.height
                });
            } else {
                img.onload = function () {
                    callback(null, {
                        index: index,
                        src: src,
                        width: img.width,
                        height: img.height
                    });
                };
                img.onerror = callback;
            }
        },


        /**
         * 渲染导航
         * @private
         */
        _renderNav: function () {
            var the = this;
            var html = '';
            var className = alienClass + '-nav-item';

            the._list.forEach(function (item, index) {
                html += '<div class="' + className + '" data-index="' + index + '" style="background-image:url(' + item.thumbnail + ')"></div>';
            });

            the._$navList.innerHTML = html;

            var $itemlist = selector.query('.' + className, the._$navList);

            $itemlist.forEach(function ($item) {
                attribute.style($item, the._options.thumbnailSize);
            });

            attribute.width(the._$navList, dato.parseFloat(the._options.thumbnailSize.width) * the._list.length);
        },


        /**
         * 展示
         * @private
         */
        _show: function () {
            var the = this;

            the._renderNav();

            //attribute.addClass(the._$ele, alienClass + '-isloading');
            //the._ctrl();
            //the._load(the._list[the._index], function (err, info) {
            //    if (err) {
            //        /**
            //         * 图片加载出现错误
            //         * @event error
            //         * @param error {Error} 错误对象
            //         */
            //        return the.emit('error', err);
            //    }
            //
            //    if (the._index === info.index) {
            //        var width = Math.min(info.width, attribute.width(window) - 20);
            //        var ratio = info.width / info.height;
            //        var height = width / ratio;
            //
            //        the._window.setOptions({
            //            width: width,
            //            height: height
            //        });
            //        the._window.resize(function () {
            //            var $img = modification.create('img', info);
            //
            //            the._$mainParent.innerHTML = '';
            //            modification.insert($img, the._$mainParent, 'beforeend');
            //            attribute.removeClass(the._$ele, alienClass + '-isloading');
            //            the._scrollbar.resize();
            //        });
            //    }
            //});
        },


        /**
         * 打开图片查看器
         * @param list {Array} 图片列表
         * @param [index=0] {Number} 打开时显示的图片索引
         *
         * @example
         * 数组： ['原始图']
         *
         * 也可以使用 [{
         *    thumbnail: '缩略图',
         *    original: '原始图'
         * }]
         */
        open: function (list, index) {
            var the = this;
            //var options = the._options;

            list = list.map(function (item) {
                if (typeis.string(item)) {
                    return {
                        thumbnail: item,
                        original: item
                    };
                }

                return item;
            });

            the._list = list;
            the._index = index || 0;
            the._mask.open();
            the._window.open();

            return the;
        },


        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            the._window.destroy(function () {
                modification.remove(the._$ele);
            });
            event.un(the._$prev, 'click');
            event.un(the._$next, 'click');
        }
    });

    modification.importStyle(style);
    module.exports = Imgview;
});