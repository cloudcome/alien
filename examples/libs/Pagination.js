define(function (require) {
    'use strict';

    var Pagination = require('/src/libs/Pagination.js');

    var p = new Pagination({
        count: 99,
        page: 67
    });
    var list = p.init();
    var html = '';

    list.forEach(function (item) {
        html += JSON.stringify(item) + '\n';
    });

    document.getElementById('pre').innerHTML = html;
});