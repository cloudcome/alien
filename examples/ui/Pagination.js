define(function (require) {
    var Pagination = require('/src/ui/Pagination.js');
    var ret = document.getElementById('ret');
    var count = 1299;
    var current = 1;
    var settings = {
        count: count,
        page: current
    };
    var pg1 = new Pagination(ret, settings);

    pg1.on('change', function (page) {
        this.render({
            count: count,
            page: page
        });
    }).on('change', function (page) {
        console.log(page);
    });
});