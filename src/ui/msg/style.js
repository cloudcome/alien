/*!
 * style.js
 * @author ydr.me
 * @create 2014-10-04 21:37
 */


define(function (require) {
    /**
     * @module ui/msg/style
     */
    'use strict';

    var style =
        // 包装
        '.alien-ui-msg{box-shadow:0 0 20px #666;border-radius:6px;color:#FFF;overflow:hidden}' +
        // 标题
        '.alien-ui-msg-header{position:relative;font-weight:normal;overflow:hidden}' +
        '.alien-ui-msg-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:10px;font-size:12px;text-align:center;line-height:12px;cursor:move;color:#fff}' +
        '.alien-ui-msg-close{position:absolute;top:0;right:0;color:#eee;width:32px;height:32px;text-align:center;cursor:pointer;font:normal normal normal 30px/32px Arial}' +
        '.alien-ui-msg-close:hover{color:#fff}' +
        '.alien-ui-msg-body{padding:30px;word-break:break-word;line-height:22px;font-size:16px}' +
        // 按钮
        '.alien-ui-msg-buttons{border-top:1px solid;overflow:hidden}' +
        '.alien-ui-msg-button{float:left;width:100%;height:36px;line-height:36px;text-align:center;cursor:pointer;font-size:14px}' +
        '.alien-ui-msg-buttons-horizontal .alien-ui-msg-button{border-left:1px solid;margin-left:-1px}' +
        '.alien-ui-msg-buttons-vertical .alien-ui-msg-button{border-top:1px solid}' +
        '.alien-ui-msg-buttons-2 .alien-ui-msg-button{width:50%}' +
        '.alien-ui-msg-buttons-3 .alien-ui-msg-button{width:33.3333333333%}' +
        '.alien-ui-msg-buttons .alien-ui-msg-button-0{border-top:0;border-left:0;margin-left:0}' +
        // muted
        '.alien-ui-msg-muted{background:#F8F8F8;background:-moz-linear-gradient(#FFF 0, #EEE 100%);background:-webkit-linear-gradient(#FFF 0, #EEE 100%);background:-o-linear-gradient(#FFF 0, #EEE 100%);background:-ms-linear-gradient(#FFF 0, #EEE 100%);background:linear-gradient(#FFF 0, #EEE 100%);color:#666}' +
        '.alien-ui-msg-muted .alien-ui-msg-title{color:#888}' +
        '.alien-ui-msg-muted .alien-ui-msg-close{color:#ccc}' +
        '.alien-ui-msg-muted .alien-ui-msg-close:hover{color:#888}' +
        '.alien-ui-msg-muted .alien-ui-msg-buttons,.alien-ui-msg-muted .alien-ui-msg-button{border-color:#DDD}' +
        '.alien-ui-msg-muted .alien-ui-msg-button:hover{background:#ECECEC}' +
        '.alien-ui-msg-muted .alien-ui-msg-button:active{background:#E2E2E2}' +
        // success
        '.alien-ui-msg-success{text-shadow:0 1px 0 #1B911B;background:#42AF42;background:-moz-linear-gradient(#68D368 0, #419641 100%);background:-webkit-linear-gradient(#68D368 0, #419641 100%);background:-o-linear-gradient(#68D368 0, #419641 100%);background:-ms-linear-gradient(#68D368 0, #419641 100%);background:linear-gradient(#68D368 0, #419641 100%)}' +
        '.alien-ui-msg-success .alien-ui-msg-buttons,.alien-ui-msg-success .alien-ui-msg-button{border-color:#279222}' +
        '.alien-ui-msg-success .alien-ui-msg-button:hover{background:#339B2E}' +
        '.alien-ui-msg-success .alien-ui-msg-button:active{background:#299424}' +
        // info
        '.alien-ui-msg-info{text-shadow:0 1px 0 #2B9DC0;background:#28ABD3;background:-moz-linear-gradient(#6BCDEB 0, #2499BD 100%);background:-webkit-linear-gradient(#6BCDEB 0, #2499BD 100%);background:-o-linear-gradient(#6BCDEB 0, #2499BD 100%);background:-ms-linear-gradient(#6BCDEB 0, #2499BD 100%);background:linear-gradient(#6BCDEB 0, #2499BD 100%)}' +
        '.alien-ui-msg-info .alien-ui-msg-buttons,.alien-ui-msg-info .alien-ui-msg-button{border-color:#218EAF}' +
        '.alien-ui-msg-info .alien-ui-msg-button:hover{background:#2499BD}' +
        '.alien-ui-msg-info .alien-ui-msg-button:active{background:#2396B9}' +
        // warning
        '.alien-ui-msg-warning{text-shadow:0 1px 0 #CC551E;background:#F17840;background:-moz-linear-gradient(#FAB190 0, #DF5B1E 100%);background:-webkit-linear-gradient(#FAB190 0, #DF5B1E 100%);background:-o-linear-gradient(#FAB190 0, #DF5B1E 100%);background:-ms-linear-gradient(#FAB190 0, #DF5B1E 100%);background:linear-gradient(#FAB190 0, #DF5B1E 100%)}' +
        '.alien-ui-msg-warning .alien-ui-msg-buttons,.alien-ui-msg-warning .alien-ui-msg-button{border-color:#D6571C}' +
        '.alien-ui-msg-warning .alien-ui-msg-button:hover{background:#E26023}' +
        '.alien-ui-msg-warning .alien-ui-msg-button:active{background:#D65619}' +
        // error danger
        '.alien-ui-msg-error,.alien-ui-msg-danger{text-shadow:0 1px 0 #8B0A07;background:#D54A46;background:-moz-linear-gradient(#E4635F 0, #c12e2a 100%);background:-webkit-linear-gradient(#E4635F 0, #c12e2a 100%);background:-o-linear-gradient(#E4635F 0, #c12e2a 100%);background:-ms-linear-gradient(#E4635F 0, #c12e2a 100%);background:linear-gradient(#E4635F 0, #c12e2a 100%)}' +
        '.alien-ui-msg-error .alien-ui-msg-buttons,.alien-ui-msg-error .alien-ui-msg-button,.alien-ui-msg-danger .alien-ui-msg-buttons,.alien-ui-msg-danger .alien-ui-msg-button{border-color:#AD2222}' +
        '.alien-ui-msg-error .alien-ui-msg-button:hover,.alien-ui-msg-danger .alien-ui-msg-button:hover{background:#B92C2C}' +
        '.alien-ui-msg-error .alien-ui-msg-button:active,.alien-ui-msg-danger .alien-ui-msg-button:active{background:#B12525}' +
        // inverse
        '.alien-ui-msg-inverse{text-shadow:0 1px 0 #000;background:#6F6F6F;background:-moz-linear-gradient(#9B9B9B 0, #585858 100%);background:-webkit-linear-gradient(#9B9B9B 0, #585858 100%);background:-o-linear-gradient(#9B9B9B 0, #585858 100%);background:-ms-linear-gradient(#9B9B9B 0, #585858 100%);background:linear-gradient(#9B9B9B 0, #585858 100%)}' +
        '.alien-ui-msg-inverse .alien-ui-msg-buttons,.alien-ui-msg-inverse .alien-ui-msg-button{border-color:#505050}' +
        '.alien-ui-msg-inverse .alien-ui-msg-button:hover{background:#555555}' +
        '.alien-ui-msg-inverse .alien-ui-msg-button:active{background:#464646}';
    var modification = require('../../core/dom/modification.js');

    modification.importStyle(style);
});