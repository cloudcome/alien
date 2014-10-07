/*!
 * style.js
 * @author ydr.me
 * @create 2014-10-06 16:11
 */


define(function (require) {
    /**
     * @module ui/scrollbar/style
     */
    'use strict';

    var modification = require('../../core/dom/modification.js');
    var duration = 456;
    var style =
        // 包裹
        '.alien-ui-scrollbar{position:relative;overflow:hidden}' +
        '.alien-ui-scrollbar *{-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box}' +
        // 内容
        '.alien-ui-scrollbar-body{position:relative;top:0;left:0}' +
        // 滑道
        '.alien-ui-scrollbar-track{position:absolute;bottom:0;right:0;border-width:0;border-style:solid;border-color:rgba(255,255,255,0);background:rgba(255,255,255,0);-webkit-transition-duration:' + duration + 'ms;-moz-transition-duration:' + duration + 'ms;transition-duration:' + duration + 'ms;-webkit-transition-property:background;-moz-transition-property:background;transition-property:background}' +
        '.alien-ui-scrollbar-track-x{left:0;height:13px;border-top-width:1px}' +
        '.alien-ui-scrollbar-track-y{top:0;width:13px;border-left-width:1px}' +
        '.alien-ui-scrollbar-track:hover{border-color:#ccc;background:#f5f5f5}' +
        '.alien-ui-scrollbar-track-x:hover{box-shadow:inset 0 1px 5px #C2BDBD}' +
        '.alien-ui-scrollbar-track-y:hover{box-shadow:inset 1px 0 5px #C2BDBD}' +
        // 滑块
        '.alien-ui-scrollbar-thumb{position:absolute;background:rgba(0,0,0,.2);border-radius:10px;margin-top:3px;margin-left:3px;-webkit-transition-duration:' + duration + 'ms;-moz-transition-duration:' + duration + 'ms;transition-duration:' + duration + 'ms;-webkit-transition-property:background;-moz-transition-property:background;transition-property:background}' +
        '.alien-ui-scrollbar-thumb-x{width:100%;height:8px;left:0}' +
        '.alien-ui-scrollbar-thumb-y{width:8px;height:100%;top:0}' +
        '.alien-ui-scrollbar-thumb:hover,.alien-ui-scrollbar-thumb-active{background:rgba(0,0,0,.6)}';

    modification.importStyle(style);
});