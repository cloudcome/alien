/*!
 * utils/class.js
 * @author ydr.me
 * @create 2015-04-24 17:06
 */

describe('utils/class', function () {
    'use strict';

    coolie.config({
        base: '../src/'
    }).use('./utils/class.js');

    it('.inherit', function (done) {
        coolie.callback(function (klass) {
            var Father = function(){};
            Father.prototype.abc = 123;

            var Child = function(){};

            klass.inherit(Child, Father);

            var c1 = new Child();
            expect(c1.abc).toEqual(123);
            done();
        });
    });

    it('.create', function (done) {
        coolie.callback(function (klass) {
            var Father = function(){};
            Father.prototype.abc = 123;

            var Child = klass.create(function () {}, Father);

            var c1 = new Child();
            expect(c1.abc).toEqual(123);
            done();
        });
    });
});