define(function (require) {
    'use strict';

    var Pagination = require('/src/ui/pagination/index.js');
    var pg1 = new Pagination('#demo', {
        max: 1299,
        page: 1
    }).on('change', function (page) {
        this.render({
            page: page
        });
    }).on('change', function (page) {
        console.log(page);
    });
});