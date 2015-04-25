/*!
 * utils/dato.js
 * @author ydr.me
 * @create 2015-04-24 17:06
 */

describe('utils/dato', function () {
    'use strict';

    coolie.config({
        base: '../src/'
    }).use('./utils/dato.js');

    it('.parseInt', function (done) {
        coolie.callback(function (dato) {
            expect(dato.parseInt('1')).toBe(1);
            expect(dato.parseInt(1)).toBe(1);
            expect(dato.parseInt(null)).toBeUndefined();
            expect(dato.parseInt(null, 1)).toBe(1);
            done();
        });
    });

    it('.parseFloat', function (done) {
        coolie.callback(function (dato) {
            expect(dato.parseFloat('1.1')).toBe(1.1);
            expect(dato.parseFloat(1)).toBe(1);
            expect(dato.parseFloat(null)).toBeUndefined();
            expect(dato.parseFloat(null, 1)).toBe(1);
            done();
        });
    });

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

    it('pick', function (done) {
        coolie.callback(function (dato) {
            var o1 = {a: 1, b: 2, c: 3, d: 4, e: 5};
            var keys = ['a', 'c', 'f'];

            var o2 = dato.pick(o1, keys);

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

    it('bytes', function (done) {
        coolie.callback(function (dato) {
            var l = dato.bytes('我123');

            expect(l).toEqual(5);

            done();
        });
    });

    it('length', function (done) {
        coolie.callback(function (dato) {
            var s = "𠮷";

            var l = dato.length(s);

            expect(l).toBe(1);

            done();
        });
    });

    it('compare', function (done) {
        coolie.callback(function (dato) {
            var o1 = {a: 1, b: 2, c: 3};
            var o2 = {a: 1, b: 3, d: 4};
            var o3 = dato.compare(o1, o2);
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
            var o1a1 = dato.compare(o1, a1);
            var a3 = dato.compare(a1, a2);

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
            var o6 = dato.compare(o4, o5);

            expect(o6).toEqual(null);

            done();
        });
    });

    it('humanize', function (done) {
        coolie.callback(function (dato) {
            var n1 = dato.humanize(10000);
            var n2 = dato.humanize(10000.000001);

            expect(n1).toEqual('10,000');
            expect(n2).toEqual('10,000.000001');

            done();
        });
    });

    it('than', function (done) {
        coolie.callback(function (dato) {
            var b1 = dato.than(2, 1);
            var b2 = dato.than('12345678901234567890123456789012345678901234567890123456', '12345678901234567890123456789012345678901234567890');
            var b3 = dato.than('12345678901234567890123456789012345678901234567890', '12345678901234567890123456789012345678901234567890123456', '<');
            var b4 = dato.than('12345678901234567890123456789012345678901234567892', '12345678901234567890123456789012345678901234567891');
            var b5 = dato.than('12345678901234567890123456789012345678901234567892', '12345678901234567890123456789012345678901234567893', '<');

            expect(b1).toEqual(true);
            expect(b2).toEqual(true);
            expect(b3).toEqual(true);
            expect(b4).toEqual(true);
            expect(b5).toEqual(true);

            done();
        });
    });


    it('fillString', function (done) {
        coolie.callback(function (dato) {
            var s1 = 'aa';
            var s2 = dato.fillString(s1, 4, '-');
            var s3 = dato.fillString(s1, 4, '-', true);
            var s4 = dato.fillString(s1, 4);
            var s5 = dato.fillString(s1, 4, true);

            expect(s2).toEqual('--aa');
            expect(s3).toEqual('aa--');
            expect(s4).toEqual('00aa');
            expect(s5).toEqual('aa00');

            done();
        });
    });

    it('fixRegExp', function (done) {
        coolie.callback(function (dato) {
            var r1 = '*';

            expect(dato.fixRegExp(r1)).toEqual('\\*');

            done();
        });
    });

    it('btoa, atob', function (done) {
        coolie.callback(function (dato) {
            var s1 = '#云淡然 cloudcome';
            var s2 = 'JTIzJUU0JUJBJTkxJUU2JUI3JUExJUU3JTg0JUI2JTIwY2xvdWRjb21l';

            expect(dato.btoa(s1)).toEqual(s2);
            expect(dato.atob(s2)).toEqual(s1);
            expect(dato.atob('s')).toEqual('');

            done();
        });
    });
});
