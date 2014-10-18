/*!
 * DDB.js
 * @author ydr.me
 * @create 2014-10-18 12:12
 */


define(function (require, exports, module) {
    /**
     * DOM-DATA-Binding
     * @module libs/DDB
     */
    'use strict';

    var klass = require('../util/class.js');
    var utilData = require('../util/data.js');
    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var key = 'alien-libs-DDB';
    var index = 1;
    var DDB = klass.create({
        STATIC:{},
        constructor: function (ele, data) {
            var the = this;

            ele = selector.query(ele);

            if(!ele.length){
                throw new Error('data binding must have an element');
            }

            the._ele = ele[0];
            the._data = data || {};
            the._init();
        },
        _init: function () {
            var the = this;

            the._parse();
        },
        _parse: function () {
            var the = this;
            var nodes = selector.contents(the._ele);

            utilData.each(nodes, function (index, node) {
                // ele
                if(node.nodeType === 1){
                    node[key+'-html'] = '';
                }
                // #text
                else if(node.nodeType === 3){

                }
            });
        }
    });


    module.exports = DDB;
});