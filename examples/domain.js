/**
 * Created by cloudcome on 15/12/22.
 */

(function () {
    'use strict';

    var url = 'http://pandavip.www.net.cn/check/checkdomain?token=check-web-hichina-com%3Azhp1630b9bsulmm1d2usz4gb4t5j0da7&isg2=Alxc-x997dHJqWqsakLOTcr4rHAOxgD%2F';
    var suffix = '.com';
    var random = function (min, max) {
        return min + Math.floor(Math.random() * (max - min));
    };
    var word = 'abcdefghijklmnopqrstuvwxyz'; // 1234567890-
    var max = word.length - 1;
    var __tt__ = 0;
    var getScript = function (url, callback) {
        var script = document.createElement('script');
        var onload = function () {
            script.onload = script.onerror = null;
            document.body.removeChild(script);
            callback();
        };
        script.src = url;
        script.onload = script.onerror = onload;
        document.body.appendChild(script);
    };
    var next = function () {
        __tt__ = setTimeout(function () {
            var i = 4;
            var w = '';
            while (i--) {
                w += word[random(0, max)];
            }
            getScript(url + '&callback=__aa__&_=' + Date.now() + '&domain=' + w + suffix, next);
        }, random(500, 3000));
    };
    var __rr__ = [];
    var __aa__ = function (json) {
        console.log(json);
        json.module = json.module || [];
        if (json.module.length === 1) {
            var module0 = json.module[0];
            if (!/exists/i.test(module0.reason)) {
                __rr__.push(module0.name);
            }
        }
    };

    next();
    window.__tt__ = __tt__;
    window.__rr__ = __rr__;
    window.__aa__ = __aa__;
}());

