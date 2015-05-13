/*!
 * utils/number.js
 * @author ydr.me
 * @create 2015-04-24 17:06
 */

describe('utils/number', function () {
    'use strict';

    coolie.config({
        base: '../src/'
    }).use('./utils/number.js');

    it('.parseInt', function (done) {
        coolie.callback(function (number) {
            expect(number.parseInt('1')).toBe(1);
            expect(number.parseInt(1)).toBe(1);
            expect(number.parseInt(null)).toBe(0);
            expect(number.parseInt(null, 1)).toBe(1);
            done();
        });
    });

    it('.parseFloat', function (done) {
        coolie.callback(function (number) {
            expect(number.parseFloat('1.1')).toBe(1.1);
            expect(number.parseFloat(1)).toBe(1);
            expect(number.parseFloat(null)).toBe(0);
            expect(number.parseFloat(null, 1)).toBe(1);
            done();
        });
    });


    it('format', function (done) {
        coolie.callback(function (number) {
            var n1 = number.format(10000);
            var n2 = number.format(10000.000001);

            expect(n1).toEqual('10,000');
            expect(n2).toEqual('10,000.000001');

            done();
        });
    });

    it('abbr', function (done) {
        coolie.callback(function (number) {
            var n1 = number.abbr(10 * 1000);
            var n2 = number.abbr(10 * 1000 * 1000);
            var n3 = number.abbr(10 * 1000 * 1000 * 1000);
            var n4 = number.abbr(10 * 1000 * 1000 * 1000 * 1000);

            expect(n1).toEqual('10k');
            expect(n2).toEqual('10m');
            expect(n3).toEqual('10b');
            expect(n4).toEqual('10t');

            done();
        });
    });

    it('than', function (done) {
        coolie.callback(function (number) {
            var b1 = number.than(2, 1);
            var b2 = number.than('12345678901234567890123456789012345678901234567890123456', '12345678901234567890123456789012345678901234567890');
            var b3 = number.than('12345678901234567890123456789012345678901234567890', '12345678901234567890123456789012345678901234567890123456', '<');
            var b4 = number.than('12345678901234567890123456789012345678901234567892', '12345678901234567890123456789012345678901234567891');
            var b5 = number.than('12345678901234567890123456789012345678901234567892', '12345678901234567890123456789012345678901234567893', '<');

            expect(b1).toEqual(true);
            expect(b2).toEqual(true);
            expect(b3).toEqual(true);
            expect(b4).toEqual(true);
            expect(b5).toEqual(true);

            done();
        });
    });
});
