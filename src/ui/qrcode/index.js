/*!
 * qrcode
 * @author ydr.me
 * @create 2015-07-01 14:33
 */


define(function (require, exports, module) {
    /**
     * @module ui/qrcode/
     * @requires core/dom/selector
     * @requires core/dom/modification
     * @requires libs/qrcode
     * @requires utils/dato
     * @requires utils/typeis
     * @requires ui/
     */

    'use strict';

    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var Qrcode = require('../../libs/qrcode.js');
    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var ui = require('../');
    var canvas = modification.create('canvas');
    var supportCanvas = 'getContext' in canvas;
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var supportSVG = !!(document.createElementNS && document.createElementNS(SVG_NS, 'svg').createSVGRect);
    var supports = {
        0: supportCanvas,
        1: supportSVG,
        2: true
    };
    var supportList = ['canvas', 'svg', 'table'];
    //var qrcodeCache = {};
    var defaults = {
        size: 255,
        // canvas > svg > table
        type: 'canvas',
        // 纠错级别，可取0、1、2、3，数字越大说明所需纠错级别越大
        correctLevel: 3,
        background: '#fff',
        foreground: '#000'
    };
    var QrcodeUI = ui.create({
        constructor: function ($parent, options) {
            var the = this;

            the._$parent = selector.query($parent)[0];
            the._options = dato.extend({}, defaults, options);
            the.destroyed = false;
        },

        render: function (text) {
            var the = this;
            var options = the._options;
            var typeIndex = supportList.indexOf(options.type);
            var $ret;

            the.qrCodeAlg = new Qrcode(text, options.correctLevel);

            if (typeIndex > -1 && supports[typeIndex]) {
                $ret = the['_render' + typeIndex]();
            } else if (typeIndex === -1) {
                typeIndex = 0;
            }

            if (!$ret) {
                dato.each(supportList, function (index, bool) {
                    if (index === typeIndex && bool) {
                        return false;
                    }

                    typeIndex++;
                });

                if (typeIndex > 2) {
                    typeIndex = 2;
                }

                $ret = the['_render' + typeIndex]();
            }

            the._$parent.innerHTML = '';

            if (typeis.string($ret)) {
                the._$parent.innerHTML = $ret;
            } else {
                modification.insert($ret, the._$parent);
            }
        },


        /**
         * 0: canvas 渲染
         * @returns {Node}
         * @private
         */
        _render0: function () {
            var the = this;
            var options = the._options;
            //创建canvas节点
            var canvas = modification.create('canvas', {
                width: options.size,
                height: options.size
            });
            var ctx = canvas.getContext('2d');

            //计算每个点的长宽
            var tileW = (options.size / the.qrCodeAlg.getModuleCount()).toPrecision(4);
            var tileH = options.size / the.qrCodeAlg.getModuleCount().toPrecision(4);

            //绘制
            for (var row = 0; row < the.qrCodeAlg.getModuleCount(); row++) {
                for (var col = 0; col < the.qrCodeAlg.getModuleCount(); col++) {
                    ctx.fillStyle = the.qrCodeAlg.modules[row][col] ? options.foreground : options.background;
                    var w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
                    var h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
                    ctx.fillRect(Math.round(col * tileW), Math.round(row * tileH), w, h);
                }
            }

            //返回绘制的节点
            return canvas;
        },


        /**
         * 1: svg 渲染
         * @returns {string}
         * @private
         */
        _render1: function () {
            var the = this;
            var options = the._options;
            var x, dx, y, dy,
                moduleCount = the.qrCodeAlg.getModuleCount(),
                scale = options.size / options.size,
                svg = '<svg xmlns="http://www.w3.org/2000/svg" ' +
                    'width="' + options.size + 'px" height="' + options.size + 'px" ' +
                    'viewbox="0 0 ' + moduleCount * 10 + ' ' + moduleCount * 10 * scale + '">',
                rectHead = '<path ',
                foreRect = ' style="stroke-width:0.5;stroke:' + options.foreground +
                    ';fill:' + options.foreground + ';"></path>',
                backRect = ' style="stroke-width:0.5;stroke:' + options.background +
                    ';fill:' + options.background + ';"></path>';

            // draw in the svg
            for (var row = 0; row < moduleCount; row++) {
                for (var col = 0; col < moduleCount; col++) {
                    x = col * 10;
                    y = row * 10 * scale;
                    dx = (col + 1) * 10;
                    dy = (row + 1) * 10 * scale;

                    svg += rectHead + 'd="M ' + x + ',' + y + ' L ' + dx + ',' + y + ' L ' + dx + ',' + dy + ' L ' + x + ',' + dy + ' Z"';

                    svg += the.qrCodeAlg.modules[row][col] ? foreRect : backRect;
                }
            }

            svg += '</svg>';

            return svg;
        },


        /**
         * 2 table 渲染
         * @returns {string}
         * @private
         */
        _render2: function () {
            //创建table节点
            var s = [];
            var foreTd;
            var backTd;
            var l;
            var the = this;
            var options = the._options;

            s.push('<table style="border:0px; margin:0px; padding:0px; border-collapse:collapse; background-color: ' +
                options.background +
                ';">');
            // 计算每个节点的长宽；取整，防止点之间出现分离
            var  caculateW;
            var caculateH;
            var tileW;
            var tileH;

            tileW = caculateW = Math.floor(options.size / the.qrCodeAlg.getModuleCount());
            tileH = caculateH = Math.floor(options.size / the.qrCodeAlg.getModuleCount());

            if (caculateW <= 0) {
                if (the.qrCodeAlg.getModuleCount() < 80) {
                    tileW = 2;
                } else {
                    tileW = 1;
                }
            }
            if (caculateH <= 0) {
                if (the.qrCodeAlg.getModuleCount() < 80) {
                    tileH = 2;
                } else {
                    tileH = 1;
                }
            }

            // 绘制二维码
            foreTd = '<td style="border:0px; margin:0px; padding:0px; width:' + tileW + 'px; background-color: ' + options.foreground + '"></td>',
                backTd = '<td style="border:0px; margin:0px; padding:0px; width:' + tileW + 'px; background-color: ' + options.background + '"></td>',
                l = the.qrCodeAlg.getModuleCount();

            for (var row = 0; row < l; row++) {
                s.push('<tr style="border:0px; margin:0px; padding:0px; height: ' + tileH + 'px">');
                for (var col = 0; col < l; col++) {
                    s.push(the.qrCodeAlg.modules[row][col] ? foreTd : backTd);
                }
                s.push('</tr>');
            }
            s.push('</table>');

            return s.join('');
        },

        destroy: function () {
            var the = this;

            if (the.destroyed) {
                return;
            }

            the.destroyed = true;
        }
    });

    QrcodeUI.defaults = defaults;
    /**
     * @todo 二维码不正确
     * @todo table 样式抽出来
     * @type {Constructor}
     */
    module.exports = QrcodeUI;
});