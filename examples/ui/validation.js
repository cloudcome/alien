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

    validation.addRule('age', function (value) {
        return value > 20;
    }, '${path}怎么能小于20呢，呵呵，这个是实例脚本加进去的自定义验证');

    validation.on('error', function (err, $input) {
        alert(err);
    });

    validation.on('success', function () {
        alert('验证通过');
        console.log(this.getData());
    });

    document.getElementById('dispatch').onclick = function () {
        validation.submit();
    };
});