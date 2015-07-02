/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-07-02 15:01
 */


define(function (require, exports, module) {
    /**
     * @module parent/validation
     */

    'use strict';

    var Validation = require('../../src/ui/validation/index.js');
    var validation = new Validation('#form');
    var alert = require('../../src/widgets/alert.js');

    validation.on('error', function (err) {
        alert(err);
    });

    validation.on('success', function () {
        alert('验证通过');
    });
});