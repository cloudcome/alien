/*!
 * object polyfill
 * @author ydr.me
 * @create 2015-07-15 19:50
 */


define(function (require, exports, module) {
    /**
     * @module polyfill/object
     */

    'use strict';

    // ES5 15.2.3.14 Object.keys ( O )
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
    if (!Object.keys) {
        Object.keys = function (o) {
            if (o !== Object(o)) {
                throw TypeError('Object.keys called on non-object');
            }
            var ret = [], p;
            for (p in o) {
                if (Object.prototype.hasOwnProperty.call(o, p)) {
                    ret.push(p);
                }
            }
            return ret;
        };
    }


    // ES5 15.2.3.2 Object.getPrototypeOf ( O )
// From http://ejohn.org/blog/objectgetprototypeof/
// NOTE: won't work for typical function T() {}; T.prototype = {}; new T; case
// since the constructor property is destroyed.
    if (!Object.getPrototypeOf) {
        Object.getPrototypeOf = function (o) {
            if (o !== Object(o)) {
                throw TypeError("Object.getPrototypeOf called on non-object");
            }
            return o.__proto__ || o.constructor.prototype || Object.prototype;
        };
    }
});