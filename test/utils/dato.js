/*!
 * utils/dato.js
 * @author ydr.me
 * @create 2015-04-24 17:06
 */

describe('utils/dato', function () {
    'use strict';

    var currentScript = coolie.getCurrentScript();
    var currentScriptURL = coolie.getScriptURL(currentScript);
    var host = coolie.getHost(currentScriptURL);
    var dir = coolie.getPathDir(currentScriptURL);

    coolie.config({
        base: host + coolie.getPathJoin(dir, '../../src/'),
    }).use('./utils/dato.js');


    it('each', function (done) {
        coolie.callback(function (dato) {
            var list = [1, 2, 3];
            var arrIndex = 0;

            dato.each(list, function (index, val) {
                arrIndex++;
                expect(list[index]).toBe(val);

                if (index === 1) {
                    return false;
                }
            });

            expect(arrIndex).toBe(2);

            var obj = {a: 1, b: 2, c: 3};
            var objKey = '';

            dato.each(obj, function (key, val) {
                objKey = key;
                expect(obj[key]).toBe(val);

                if (key === 'b') {
                    return false;
                }
            });

            expect(objKey).toBe('b');

            done();
        });
    });

    it('extend', function (done) {
        coolie.callback(function (dato) {
            var o1 = {a: 1};
            var o2 = {b: 2};
            var o3 = {a: {b: {c: 1}}};
            var o4 = {a: {b: {d: 2}}};
            var o5 = {a: {b: {c: 1}}};
            var o6 = {a: {b: {d: 2}}};
            var a1 = {a: {b: [1, 2, 3, 4]}};
            var a2 = {a: {b: [4, 5, 6]}};

            var o12 = dato.extend(o1, o2);
            var o34 = dato.extend(false, o3, o4);
            var o56 = dato.extend(true, o5, o6);
            var a12 = dato.extend(true, a1, a2);

            expect(o12).toEqual({a: 1, b: 2});
            expect(o34).toEqual({a: {b: {d: 2}}});
            expect(o56).toEqual({a: {b: {c: 1, d: 2}}});
            expect(a12).toEqual({a: {b: [4, 5, 6, 4]}});

            done();
        });
    });

    it('select', function (done) {
        coolie.callback(function (dato) {
            var o1 = {a: 1, b: 2, c: 3, d: 4, e: 5};
            var keys = ['a', 'c', 'f'];

            var o2 = dato.select(o1, keys);

            expect(o2.a).toBe(1);
            expect(o2.c).toBe(3);
            expect(o2.f).toBe(undefined);
            done();
        });
    });

    it('toArray', function (done) {
        coolie.callback(function (dato) {
            var a1 = dato.toArray({0: 0, 1: 1, length: 2});
            var a2 = dato.toArray({a: 1}, true);

            expect(a1).toEqual([0, 1]);
            expect(a2).toEqual([{a: 1}]);

            done();
        });
    });



    it('compare', function (done) {
        coolie.callback(function (number) {
            var o1 = {a: 1, b: 2, c: 3};
            var o2 = {a: 1, b: 3, d: 4};
            var o3 = number.compare(o1, o2);
            var same = o3.same;
            var only0 = o3.only[0];
            var only1 = o3.only[1];
            var diff = o3.diff;

            expect(same).toEqual(['a']);
            expect(only0).toEqual(['c']);
            expect(only1).toEqual(['d']);
            expect(diff.indexOf('b') !== -1).toEqual(true);
            expect(diff.indexOf('c') !== -1).toEqual(true);
            expect(diff.indexOf('d') !== -1).toEqual(true);


            var a1 = [1, 2, 3];
            var a2 = [1, 3, 4];
            var o1a1 = number.compare(o1, a1);
            var a3 = number.compare(a1, a2);

            same = a3.same;
            only0 = a3.only[0];
            only1 = a3.only[1];
            diff = a3.diff;

            expect(o1a1).toEqual(null);
            expect(same).toEqual([0]);
            expect(only0).toEqual([]);
            expect(only1).toEqual([]);
            expect(diff.indexOf(1) > -1).toEqual(true);
            expect(diff.indexOf(2) > -1).toEqual(true);

            var o4 = '1';
            var o5 = '2';
            var o6 = number.compare(o4, o5);

            expect(o6).toEqual(null);

            done();
        });
    });
});
