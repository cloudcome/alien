/*!
 * hashbang.js
 * @author ydr.me
 * 2014-09-24 14:50
 */


define(function (require, exports, module) {
    /**
     * @module util/hashbang
     */
    'use strict';

    var regHashbang = /^#![^#]*/;

    module.exports = {
        parse: function parse(hashstring) {
            if(!this.isHashbang(hashstring)){
                return {};
            }


        },
        isHashbang: function isHashbang(hashstring){
            return regHashbang.toString(hashstring);
        }
    };
});