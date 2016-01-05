/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-11-15 13:11
 */


define(function (require) {
    'use strict';

    var typeis = require('../../src/utils/typeis.js');
    var dato = require('../../src/utils/dato.js');

    var list = [
        ['A', 'B'],
        ['甲', '乙'],
        ['1', '2']
    ];

    /**
     * 修饰键组合
     * @param list
     * @returns {Array}
     */
    var combinate = function (list) {
        var ret = [];

        dato.each(list[0], function (i, item) {
            dato.each(list[1], function (j, child) {
                dato.each(list[2], function (k, child2) {
                    ret.push([item, child, child2]);
                });
            });
        });

        return ret;
    };

    console.log(combinate(list).join('\n'));

    window.typeis = typeis;
});