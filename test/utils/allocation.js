/*!
 * utils/allocation.js
 * @author ydr.me
 * @create 2015-04-24 17:06
 */

describe('utils/allocation', function () {
    'use strict';

    coolie.config({
        base: '../src/'
    }).use('./utils/allocation.js');

    it('getset', function (done) {
        coolie.callback(function (allocation) {
            var obj = {};
            var getSet = function () {
                return allocation.getset({
                    get: function (key) {
                        return obj[key];
                    },
                    set: function (key, val) {
                        obj[key] = val;
                    }
                }, arguments);
            };


            var a = getSet('a');
            getSet('a', 1);
            getSet({
                b: 2,
                c: 3
            });
            var b = getSet('a');
            var c = getSet(['b', 'c']);

            expect(a).toBeUndefined();
            expect(b).toEqual(1);
            expect(c).toEqual({b: 2, c: 3});
            done();
        });
    });

    it('args', function (done) {
        coolie.callback(function (allocation) {
            var fn = function () {
                var args = allocation.args(arguments);

                expect(args.length).toEqual(1);
                done();
            };

            fn(1, undefined, undefined);
        });
    });
});