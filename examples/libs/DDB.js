define(function (require) {
    'use strict';

    var DDB = require('/src/libs/DDB.js');
    var random = require('/src/utils/random.js');
    var data = {
        name: '云淡然',
        loves: []
    };
    var $data = document.getElementById('data');
    var $demo = document.getElementById('demo');
    var $btn = document.getElementById('btn');
    var $btn2 = document.getElementById('btn2');
    var $btn3 = document.getElementById('btn3');
    var $btn4 = document.getElementById('btn4');
    var ddb;

    $data.innerHTML = JSON.stringify(data);
    document.getElementById('temp').innerText = $demo.innerHTML.trim();

    $btn.onclick = function () {
        this.disabled = true;
        $btn2.disabled = false;
        $btn3.disabled = false;
        $btn4.disabled = false;

        // 实例化一个DDB（DOM-DATA-BINDING）
        ddb = new DDB($demo, data);

        // 数据发生变化回调
        ddb.on('change', function (data) {
            $data.innerHTML = JSON.stringify(data, null, 4);
        });
    };

    $btn2.onclick = function () {
        // 手动更新数据
        ddb.update(function (data, next) {
            data.loves[0] = '随机爱好' + random.string();
            next();
        });
    };

    $btn3.onclick = function () {
        // 手动更新数据
        ddb.update(function (data, next) {
            var max = data.loves.length;
            var pos = _random(0, max);

            data.loves.splice(pos, 0, '随机爱好' + random.string());
            next();
        });
    };

    $btn4.onclick = function () {
        // 手动更新数据
        ddb.update(function (data, next) {
            var max = data.loves.length;
            var pos;

            if (max > 0) {
                pos = _random(0, max);
                data.loves.splice(pos, 1);
            }

            next();
        });
    };


    /**
     * 随机数
     * @param min
     * @param max
     * @returns {number|*}
     * @private
     */
    function _random(min, max) {
        return Math.floor(Math.random() * (max - 1) + min);
    }
});