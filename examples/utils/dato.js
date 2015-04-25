define(function (require) {
    'use strict';

    var dato = require('/src/utils/dato.js');
    //var o3 = {a: {b: {c: 1}}};
    //var o4 = {a: {b: {d: 2}}};
    //var o34_1 = dato.extend(false, o3, o4);
    //var o34_2 = dato.extend(true, o3, o4);

    //console.log(o34_1);
    //console.log(o34_2);

    var s = "𠮷";
    console.log(s.length);
    console.log(dato.length(s));

    var o1 = {a: 1, b: 2, c: 3};
    var o2 = {a: 1, b: 3, d: 4};

    var o3 = dato.compare(o1, o2);

    console.log(o3);
});