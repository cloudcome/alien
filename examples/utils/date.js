define(function (require) {
    'use strict';

    var date = require('/src/utils/date.js');
    var now = new Date();
    var YYYY = now.getFullYear();
    var M = now.getMonth();
    var D = now.getDate();
    window.date = date;

    document.getElementById('ret1').innerHTML = date.format('YYYY年MM月DD日 HH:mm:ss.SSS 星期e a');
    document.getElementById('ret2').innerHTML = date.from('2014-4-11 08:00:00');
    document.getElementById('ret3').innerHTML = date.from('2015-4-11 08:00:00');
    document.getElementById('ret4').innerHTML = date.getWeeksInYear(YYYY, M, D);
    document.getElementById('ret5').innerHTML = date.getWeeksInMonth(YYYY, M, D);
    document.getElementById('ret6').innerHTML = date.getDaysInMonth(YYYY, M);
    document.getElementById('ret7').innerHTML = date.getDaysInYear(YYYY, M, D);
});