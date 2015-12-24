/**
 * Created by cloudcome on 15/12/22.
 */

(function () {
    'use strict';

    var domainLength = 4;
    var domainSuffix = '.com';

    //==================
    var token = 'check-web-hichina-com%3Anq5mtl9fubcat4xzy2svmjb0k1gpvegw';
    var isg2 = 'AlhY2y6LMYU1Ve4gzjaC-SzLqIzqILzL';
    var url = 'http://pandavip.www.net.cn/check/checkdomain?token=' + token + '&isg2=' + isg2;
    var random = function (min, max) {
        return min + Math.floor(Math.random() * (max - min));
    };
    var word = 'abcdefghijklmnopqrstuvwxyz1234567890-'; //
    var max = word.length - 1;
    var __tt__ = 0;
    var map = {};
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
        if (window.__bb__) {
            return;
        }

        __tt__ = setTimeout(function () {
            var i = domainLength;
            var w = '';
            while (i--) {
                w += word[random(0, max)];
            }
            getScript(url + '&callback=__aa__&_=' + Date.now() + '&domain=' + w + domainSuffix, next);
        }, random(500, 3000));
    };
    var __rr__ = [];
    var __aa__ = function (json) {
        console.log(json);
        json.module = json.module || [];
        if (json.module.length === 1) {
            var module0 = json.module[0];
            if (!/exists/i.test(module0.reason) && !map[module0.name]) {
                __rr__.push(module0.name);
                map[module0.name] = true;
            }
        }
    };

    next();
    window.__tt__ = __tt__;
    window.__rr__ = __rr__;
    window.__aa__ = __aa__;
    window.__bb__ = false;
}());

