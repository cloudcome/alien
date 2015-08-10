'use strict';


/**
 * 下一刻
 * @param callback {Function} 回调
 */
var nextTick = function (callback) {
    // chrome18+, safari6+, firefox14+,ie11+,opera15
    if (MutationObserver) {
        var observer = new MutationObserver(callback);
        var a = document.createElement('a');

        observer.observe(a, {
            attributes: true
        });
        a.setAttribute('a', String(Math.random()));
    }
    // ie
    else if ('VBArray' in window) {
        var script = document.createElement('script');
        // IE下这个通常只要 1 ms,而且没有副作用，不会发现请求
        script.onreadystatechange = function () {
            callback(); //在interactive阶段就触发
            script.onreadystatechange = null;
            document.body.removeChild(script);
            script = null;
        };

        document.body.appendChild(script);
    } else {
        setTimeout(callback, 0);
    }
};