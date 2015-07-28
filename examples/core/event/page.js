/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-28 10:48
 */


define(function (require, exports, module) {
    /**
     * @module parent/page
     */

    'use strict';

    var event = require('../../../src/core/event/page.js');
    var modification = require('../../../src/core/dom/modification.js');
    var ret = document.getElementById('ret');

    event.on(window, 'pageshow', function () {
        modification.insert('<p>onpageshow ' + Date.now() + '</p>', ret);
    });

    event.on(window, 'pageshow', function () {
        modification.insert('<p>onpagehide ' + Date.now() + '</p>', ret);
    });
});