/*!
 * date polyfill
 * @author ydr.me
 * @create 2015-07-15 19:47
 */


define(function (require, exports, module) {
    /**
     * @module polyfill/date
     */

    'use strict';
// ES5 15.9.4.4 Date.now ( )
// From https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Date/now
    if (!Date.now) {
        Date.now = function now() {
            return Number(new Date());
        };
    }

});