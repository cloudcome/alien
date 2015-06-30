define(function (require) {
    'use strict';

    var Pagination = require('/src/libs/pagination.js');

    var pagi = new Pagination({
        count: 99,
        page: 67
    });
    var html = '';

    pagi.getList().forEach(function (item) {
        html += JSON.stringify(item) + '\n';
    });

    document.getElementById('pre').innerHTML = html;
});