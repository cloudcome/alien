(function () {
    'use strict';

    var domainLength = 4;
    var domainSuffix = '.com';

    //==================
    window.__token__ = 'check-web-hichina-com%3Aze2eyynbju2iuyfiwo1ne8rvm7r249fv';
    window.__isg2__ = 'AlhY2y6LMYU1Ve4gzjaC-SzLqIzqILzL';

    var random = function (min, max) {
        return min + Math.floor(Math.random() * (max - min));
    };
    var word = 'abcdefghijklmnopqrstuvwxyz';//'1234567890-'; //
    var max = word.length - 1;
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

        window.__tt__ = setTimeout(function () {
            var i = domainLength;
            var w = '';
            while (i--) {
                w += word[random(0, max)];
            }

            var url = 'http://pandavip.www.net.cn/check/checkdomain?' +
                'token=' + window.__token__ +
                '&isg2=' + window.__isg2__;

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
    window.__rr__ = __rr__;
    window.__aa__ = __aa__;
    window.__bb__ = false;
}());

