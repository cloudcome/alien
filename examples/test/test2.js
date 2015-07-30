'use strict';


var parseURL = (function () {
    var a = document.createElement('a');

    /**
     * 解析 url
     * @returns {Object}
     */
    return function (url) {
        a.href = url;

        return {
            protocol: a.protocol,
            host: a.host,
            hostname: a.hostname,
            pathname: a.pathname,
            search: a.search,
            hash: a.hash
        };
    };
}());