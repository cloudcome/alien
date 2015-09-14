/*!
 * localstorage
 * @author ydr.me
 * @create 2015-02-02 15:17
 */


define(function (require, exports, module) {
    /**
     * @module core/navigator/storage
     * @requires utils/allocation
     * @requires utils/dato
     */
    'use strict';

    var storage = require('./_storage.js');

    storage(window.localStorage, exports);
});