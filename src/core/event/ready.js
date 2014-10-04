/*!
 * ready.js
 * @author ydr.me
 * @create 2014-10-02 15:11
 */


define(function (require, exports, module) {
    /**
     * 文档准备完毕后回调
     *
     * @module core/event/ready
     * @requires core/event/base
     * @requires util/data
     */

    'use strict';

    var event = require('./base.js');
    var data = require('../../util/data.js');
    var callbacks = [];
    var isReady;

    /**
     * 监听准备完毕后回调或文档已准备立即回调
     * @param {Function} callback 回调
     * @exports core/event/ready
     *
     * @example
     * var ready = require('/src/event/ready.js');
     * ready(fn);
     */
    module.exports = function (callback) {
        if(document.readyState === 'complete' || isReady){
            callback();
        }else if(data.type(callback) === 'function'){
            callbacks.push(callback);
        }
    };


    event.on(document, 'DOMContentLoaded', function () {
        isReady = 1;

        data.each(callbacks, function(index, callback){
            callback();
        });

        callbacks = [];
    });
});