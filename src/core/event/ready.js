/*!
 * ready.js
 * @author ydr.me
 * @create 2014-10-02 15:11
 */


define(function (require, exports, module) {
    /**
     * @module core/event/ready
     * @require core/event/base
     * @require util/data
     */
    'use strict';

    var event = require('./base.js');
    var data = require('../../util/data.js');
    var callbacks = [];
    var isReady;

    /**
     * 文档准备完毕后回到
     * @param {Function} callback 回调
     */
    module.exports = function (callback) {
        if(document.readyState === 'complete' || isReady){
            callback();
        }else if(data.type(callback) === 'function'){
            callbacks.push(callback);
        }
    }


    event.on(document, 'DOMContentLoaded', function () {
        isReady = 1;

        data.each(callbacks, function(index, callback){
            callback();
        });

        callbacks = [];
    });
});