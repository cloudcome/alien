define(function (require) {
    var Dangke = require('../../src/libs/dangke.js');

    document.body.innerHTML = Dangke.isDangke;


var add = function (n) {
    var sum = 0;
    var plus = function (n) {
        if (n) {
            sum += n;
            return plus;
        }

        return sum;
    };

    return plus(n);
};


    alert(add());
    alert(add(1)());
    alert(add(1)(2)());
    alert(add(1)(2)(3)());
    alert(add(1)(2)(3)(4)());
    alert(add(1)(2)(3)(4)(5)());
});
