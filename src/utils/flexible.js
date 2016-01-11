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
    var viewWidth = 0;

    var render = function () {
        flexible.viewWidth = viewWidth = Math.min(window.innerWidth, maxWidth);
        var rem = viewWidth * dpr / 10;

        docEl.style.fontSize = rem + 'px';
        flexible.rem = rem;
        changedCallbackList.forEach(function (callback) {
            callback.call(flexible);
        });
    };

    setTimeout(render);
    flexible.render = render;


    /**
     * rem 尺寸转换为 px 尺寸
     * @param rem
     * @param [desginWidth]
     * @param [_dpr]
     * @returns {number}
     */
    flexible.rem2px = function (rem, desginWidth, _dpr) {
        desginWidth = desginWidth || viewWidth;
        _dpr = _dpr || dpr;
        var _rem = desginWidth * _dpr / 10;
        return parseFloat(rem) * _rem;
    };

    /**
     * px 尺寸转换为 rem 尺寸
     * @param px
     * @param [desginWidth]
     * @param [_dpr]
     * @returns {number}
     */
    flexible.px2rem = function (px, desginWidth, _dpr) {
        desginWidth = desginWidth || viewWidth;
        _dpr = _dpr || dpr;
        var _rem = desginWidth * _dpr / 10;
        return parseFloat(px) / _rem;
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
