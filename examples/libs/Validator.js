define(function (require) {
    'use strict';

    var Validator = require('/src/libs/Validator.js');
    var selector = require('/src/core/dom/selector.js');
    var modification = require('/src/core/dom/modification.js');
    var v1 = new Validator();
    var $username = document.getElementById('username');
    var $password = document.getElementById('password');
    var $email = document.getElementById('email');
    var $url = document.getElementById('url');
    var $number = document.getElementById('number');
    var $submit = document.getElementById('submit');
    var $msg = document.getElementById('msg');

    v1.pushRule({
        name: 'username',
        type: 'string',
        alias: '用户名',
        required: true,
        minLength: 4,
        maxLength: 12,
        regexp: /^[a-z]\w{3,11}$/
    });

    v1.pushRule({
        name: 'password',
        type: 'string',
        alias: '密码',
        required: true,
        minLength: 4,
        maxLength: 12
    });

    v1.pushRule({
        name: 'email',
        type: 'email',
        alias: '邮箱',
        required: true,
        maxLength: 255
    });

    v1.pushRule({
        name: 'url',
        type: 'url',
        alias: '网址',
        required: true,
        maxLength: 255
    });

    v1.pushRule({
        name: 'number',
        type: 'number',
        alias: '年龄',
        required: true,
        min: 18,
        max: 60,
        onbefore: function (val) {
            val = parseInt(val, 10);
            if (isNaN(val)) {
                val = 0;
            }

            return val;
        },
        onafter: function (err, val) {
            return val += err ? -1 : 1;
        }
    });


    _validatOne($username);
    _validatOne($password);
    _validatOne($email);
    _validatOne($url);
    _validatOne($number);


    $submit.onclick = function () {
        var data = {
            username: $username.value,
            password: $password.value,
            email: $email.value,
            url: $url.value,
            number: $number.value
        };

        v1.validateAll(data, function (errs) {
            var lis = '';
            var i;

            if (errs) {
                for (i in errs) {
                    if (errs.hasOwnProperty(i)) {
                        lis += '<li>' + i + ': ' + errs[i].message + '</li>';
                    }
                }
                $msg.innerHTML = lis;
            } else {
                $msg.innerHTML = '<li>全部验证通过</li>';
            }
        });
    };


    /**
     * 验证单个输入框
     * @param $input
     * @private
     */
    function _validatOne($input) {
        var name = $input.name;

        $input.oninput = $input.onchange = $input.onblur = function () {
            var data = {};

            data[name] = $input.value;

            v1.validateOne(data, function (err, data) {
                var msg;
                if (err) {
                    msg = err.message;
                } else {
                    msg = '输入正确';
                }

                console.log(data);

                _showMsg($input, msg);
            });
        };
    }


    /**
     * 显示输入框消息
     * @param $input
     * @param msg
     * @private
     */
    function _showMsg($input, msg) {
        var $parent = selector.closest($input, 'li')[0];
        var $msg = selector.query('.msg', $parent);

        if (!$msg.length) {
            $msg = modification.parse('<p class="msg"></p>')[0];
            modification.insert($msg, $parent, 'beforeend');
        } else {
            $msg = $msg[0];
        }

        $msg.innerHTML = msg;
    }
});