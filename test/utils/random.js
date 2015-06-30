/*!
 * utils/random
 * @author ydr.me
 * @create 2015-04-24 22:45
 */

describe('utils/random', function () {
    'use strict';

    var currentScript = coolie.getCurrentScript();
    var currentScriptURL = coolie.getScriptURL(currentScript);
    var host = coolie.getHost(currentScriptURL);
    var dir = coolie.getPathDir(currentScriptURL);

    coolie.config({
        base: host + coolie.getPathJoin(dir, '../../src/'),
    }).use('./utils/random.js');

    it('.number', function (done) {
        coolie.callback(function (random) {
            var n1 = random.number(1, 10);

            expect(n1).toBeLessThan(11);
            expect(n1).toBeGreaterThan(0);

            var n2 = random.number(1, 1);

            expect(n2).toEqual(1);

            var n3 = random.number(10, 1);

            expect(n3).toBeLessThan(11);
            expect(n3).toBeGreaterThan(0);

            done();
        });
    });

    it('.string', function (done) {
        coolie.callback(function (random) {
            var s1 = random.string(2);
            var s2 = random.string(2, 'A');
            var s3 = random.string(2, '0');

            expect(s1.length).toBe(2);
            expect(s2.length).toBe(2);
            expect(s3.length).toBe(2);

            done();
        });
    });
});
