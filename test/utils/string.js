/*!
 * utils/string.js
 * @author ydr.me
 * @create 2015-04-24 17:06
 */

describe('utils/string', function () {
    'use strict';

    var currentScript = coolie.getCurrentScript();
    var currentScriptURL = coolie.getScriptURL(currentScript);
    var host = coolie.getHost(currentScriptURL);
    var dir = coolie.getPathDir(currentScriptURL);

    coolie.config({
        base: host + coolie.getPathJoin(dir, '../../src/'),
    }).use('./utils/string.js');


    it('bytes', function (done) {
        coolie.callback(function (string) {
            var l = string.bytes('我123');

            expect(l).toEqual(5);

            done();
        });
    });

    it('length', function (done) {
        coolie.callback(function (string) {
            var s = "𠮷";

            var l = string.length(s);

            expect(l).toBe(1);

            done();
        });
    });

    it('padLeft', function (done) {
        coolie.callback(function (string) {
            var s1 = 'aa';
            var s2 = string.padLeft(s1, 4, '-');
            var s3 = string.padLeft(s1, 4);

            expect(s2).toEqual('--aa');
            expect(s3).toEqual('  aa');

            done();
        });
    });

    it('padRight', function (done) {
        coolie.callback(function (string) {
            var s1 = 'aa';
            var s2 = string.padRight(s1, 4, '-');
            var s3 = string.padRight(s1, 4);

            expect(s2).toEqual('aa--');
            expect(s3).toEqual('aa  ');

            done();
        });
    });

    it('escapeRegExp', function (done) {
        coolie.callback(function (string) {
            var r1 = '*';

            expect(string.escapeRegExp(r1)).toEqual('\\*');

            done();
        });
    });

    it('base64, debase64', function (done) {
        coolie.callback(function (string) {
            var s1 = '#云淡然 cloudcome';
            var s2 = 'JTIzJUU0JUJBJTkxJUU2JUI3JUExJUU3JTg0JUI2JTIwY2xvdWRjb21l';

            expect(string.base64(s1)).toEqual(s2);
            expect(string.debase64(s2)).toEqual(s1);

            done();
        });
    });
});
