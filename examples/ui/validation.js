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

    validation.addRule('username', function (val, done) {
        done(/c/i.test(val) ? null : '${path}必须包含“c”哦，呵呵，这个是实例脚本加进去的自定义验证');
    });

    validation.on('invalid', function (err, $input) {
        alert($input.name + ':' + err.message);
    });

    validation.on('success', function () {
        alert(JSON.stringify(this.getData()));
        alert('验证通过');
    });

    document.getElementById('submit').onclick = function () {
        validation.validate();
    };
});