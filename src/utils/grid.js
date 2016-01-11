/**
 * 网格
 * @author ydr.me
 * @create 2016-01-04 20:09
 */


define(function (require, exports, module) {
    /**
     * @module utils/grid
     */

    'use strict';

    var flexible = window.flexible;

    if (!flexible) {
        throw 'markGrid reuqire flexible';
    }

    // 默认方式：[__A__A__A__]
    // 靠边方式：[A____A____A]

    /**
     * 均匀分隔排列
     * @param options {Object} 配置
     * @param options.columns {Number} 列数量
     * @param options.containerWidth {Number} 容器宽度，单位 px
     * @param options.itemWidth {Number} 项目的宽度，单位 px
     * @param [options.itemSelector="li"] {String} 项目选择器
     * @param [options.itemAside=false] {Boolean} 项目是否靠边
     * @param [options.desginWidth=640] {Number} 设计宽度
     * @param [options.className] {String} 容器添加的 className，否则添加自动 className
     * @returns {{css: string, className: string, blankWidth: number, gapWidth: number, desginWidth: number, dpr: number}}
     */
    exports.make = function (options) {
        var containerWidth = options.containerWidth;
        var className = options.className || 'grid-' + Date.now();
        var itemWidth = options.itemWidth;
        var columns = options.columns;
        var itemSelector = options.itemSelector || 'li';
        var itemAside = options.itemAside;
        var desginWidth = options.desginWidth || 640;
        var dpr = options.dpr || flexible.dpr;
        var contentWidth = itemWidth * columns;
        var blankWidth = containerWidth - contentWidth;
        var gapWidth = blankWidth / (options.columns + (itemAside ? -1 : 1));
        var css = '.' + className + ':after{' +
                /**/'content:"";' +
                /**/'display:table;' +
                /**/'clear:both;' +
            '}' +
                // 每一项都有宽度和左边距
            '.' + className + '>' + itemSelector + '{' +
                /**/'float:left;' +
                /**/'width:' + flexible.px2rem(itemWidth, desginWidth, dpr) + 'rem;' +
                /**/'margin-left:' + flexible.px2rem(gapWidth, desginWidth, dpr) + 'rem;' +
            '}';

        if (itemAside) {
            // 每一行最后一个项目没有左边距
            css += '.' + className + '>' + itemSelector + ':nth-child(' + columns + 'n+1){' +
                    /**/'margin-left:0;' +
                '}';
        }

        return {
            css: css,
            className: className,
            blankWidth: blankWidth,
            gapWidth: gapWidth,
            desginWidth: desginWidth,
            dpr: dpr
        };
    };
});