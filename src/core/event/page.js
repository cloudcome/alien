/*!
 * pageshow/pagehide 的兼容
 * @author ydr.me
 * @create 2015-07-27 09:47
 */


define(function (require, exports, module) {
    /**
     * @module core/event/page
     * @requires core/event/base
     */

    'use strict';

    //http://www.w3.org/TR/page-visibility/
    //
    //event visibilitychange
    //document.visibilityState = "hidden/visible/prerender/unloaded"
    //document.hidden = true/false
    //
    //compatiable
    //document event focusin focusout
    //window pageshow pagehide focus blur

    var win = window;
    var doc = win.document;
    var event = require('./base.js');
    var isShow = true;
    var onshow = function (eve) {
        if (!isShow) {
            isShow = !isShow;
            event.dispatch(win, 'pageshow', eve);
        }
    };
    var onhide = function (eve) {
        if (isShow) {
            isShow = !isShow;
            event.dispatch(win, 'pagehide', eve);
        }
    };

    event.on(win, 'pageshow focus', onshow);
    //event.on(doc, 'focusin', onshow);
    event.on(win, 'pagehide blur', onhide);
    //event.on(doc, 'focusout', onhide);
    event.on(doc, 'visibilitychange', function (eve) {
        if (doc.hidden) {
            onhide(eve);
        } else {
            onshow(eve);
        }
    });

    module.exports = event;
});