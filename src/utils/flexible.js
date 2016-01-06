(function () {
    'use strict';

    var win = window;
    var doc = win.document;
    var docEl = doc.documentElement;
    var docHead = doc.head;
    var viewportMeta = doc.querySelector('meta[name="viewport"]');
    var dpr = docEl.dataset.dpr;
    var maxWidth = docEl.dataset.maxWidth || 1024;
    var tid;
    var changedCallbackList = [];

    if (viewportMeta) {
        return;
    }

    var flexible = win.flexible = {};

    if (!dpr) {
        var devicePixelRatio = win.devicePixelRatio || 1;

        if (devicePixelRatio > 2) {
            dpr = 3;
        } else if (devicePixelRatio > 1) {
            dpr = 2;
        } else {
            dpr = 1;
        }
    }

    var scale = 1 / dpr;
    flexible.dpr = dpr;
    flexible.scale = scale;

    var eMeta = doc.createElement('meta');
    eMeta.setAttribute('name', 'viewport');
    eMeta.setAttribute('content', 'width=device-width,initial-scale=' + scale + ',maximum-scale=' + scale + ',minimum-scale=' + scale);
    docHead.appendChild(eMeta);
    docEl.classList.add('dpr-' + dpr);

    var render = function () {
        var width = Math.min(window.innerWidth, maxWidth);
        var rem = width * dpr / 10;

        docEl.style.fontSize = rem + 'px';
        flexible.rem = rem;
        setTimeout(function () {
            changedCallbackList.forEach(function (callback) {
                callback.call(flexible);
            });
        }, 1);
    };

    render();
    flexible.render = render;


    /**
     * rem 尺寸转换为 px 尺寸
     * @param rem
     * @returns {number}
     */
    flexible.rem2px = function (rem) {
        return parseFloat(rem) * flexible.rem;
    };

    /**
     * px 尺寸转换为 rem 尺寸
     * @param px
     * @returns {number}
     */
    flexible.px2rem = function (px) {
        return parseFloat(px) / flexible.rem;
    };

    /**
     * rem 变化通知
     * @param callback
     */
    flexible.onchange = function (callback) {
        if (typeof callback === 'function') {
            changedCallbackList.push(callback);
        }
    };

    win.addEventListener('resize', function () {
        clearTimeout(tid);
        tid = setTimeout(render, 300);
    });
    win.addEventListener('pageshow', function (e) {
        if (e.persisted) {
            clearTimeout(tid);
            tid = setTimeout(render, 300);
        }
    });
})();
