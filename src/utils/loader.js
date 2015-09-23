/*!
 * 加载器
 * @author ydr.me
 * @create 2015-08-05 09:48
 */


define(function (require, exports, module) {
    /**
     * @module utils/loader
     * @requires utils/typeis
     * @requires utils/controller
     */

    'use strict';

    var win = window;
    var doc = document;
    var REG_LOAD_COMPLETE = /loaded|complete/;
    var typeis = require('./typeis.js');
    var controller = require('./controller.js');
    var load = function (tagName, url, callback) {
        var node = tagName === 'img' ? new Image() : doc.createElement(tagName);
        var onready = function (eve) {
            var err = null;

            if (eve && eve.type === 'error') {
                err = new Error('load error');
            }

            if (typeis.function(callback)) {
                callback.call(node, err);
            }
        };

        switch (tagName) {
            case 'script':
                node.async = true;
                node.src = url;
                break;

            case 'link':
                node.rel = 'stylesheet';
                node.href = url;
                break;

            case 'img':
                node.src = url;
                break;
        }


        if ('onload' in node) {
            node.onload = node.onerror = onready;
        } else {
            node.onreadystatechange = function (eve) {
                if (REG_LOAD_COMPLETE.test(node.readyState)) {
                    eve = eve || win.event;
                    onready(eve);
                }
            };
        }

        if (tagName !== 'img') {
            doc.body.appendChild(node);
        }

        if (tagName === 'img' && node.complete) {
            controller.nextTick(function () {
                onready();
                node.onload = node.onerror = node.onreadystatechange = null;
            });
        }
    };

    /**
     * 加载脚本文件
     * @param url {String} 文件地址
     * @param [callback] {Function} 完毕回调
     */
    exports.js = function (url, callback) {
        load('script', url, callback);
    };


    /**
     * 加载样式文件
     * @param url {String} 文件地址
     * @param [callback] {Function} 完毕回调
     */
    exports.css = function (url, callback) {
        load('link', url, callback);
    };


    /**
     * 加载图片文件
     * @param url {String} 图片文件
     * @param [callback] {Function} 完毕回调
     */
    exports.img = function (url, callback) {
        load('img', url, callback);
    };
});