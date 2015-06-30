/*!
 * utils/typeis
 * @author ydr.me
 * @create 2015-04-24 14:36
 */


describe('utils/typeis', function () {
    'use strict';

    var currentScript = coolie.getCurrentScript();
    var currentScriptURL = coolie.getScriptURL(currentScript);
    var host = coolie.getHost(currentScriptURL);
    var dir = coolie.getPathDir(currentScriptURL);

    coolie.config({
        base: host + coolie.getPathJoin(dir, '../../src/'),
    }).use('./utils/typeis.js');

    it('()', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis()).toBe('undefined');
            expect(typeis(null)).toBe('null');
            expect(typeis(1)).toBe('number');
            expect(typeis('1')).toBe('string');
            expect(typeis(true)).toBe('boolean');
            expect(typeis([])).toBe('array');
            expect(typeis({})).toBe('object');
            expect(typeis(/./)).toBe('regexp');
            expect(typeis(window)).toBe('window');
            expect(typeis(document)).toBe('document');
            expect(typeis(NaN)).toBe('nan');
            expect(typeis(function () {
            })).toBe('function');
            expect(typeis(new Image())).toBe('element');
            expect(typeis(new Date())).toBe('date');
            window.global = {};
            expect(typeis(window.global)).toBe('global');

            done();
        });
    });

    it('.string', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.string('1')).toBe(true);
            expect(typeis.string(1)).toBe(false);

            done();
        });
    });

    it('.number', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.number(1)).toBe(true);

            done();
        });
    });

    it('.function', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.function(function () {
            })).toBe(true);

            done();
        });
    });

    it('.object', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.object({})).toBe(true);

            done();
        });
    });

    it('.undefined', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.undefined()).toBe(true);

            done();
        });
    });

    it('.null', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.null(null)).toBe(true);

            done();
        });
    });

    it('.nan', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.nan(NaN)).toBe(true);

            done();
        });
    });

    it('.element', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.element(new Image())).toBe(true);

            done();
        });
    });

    it('.regexp', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.regexp(/./)).toBe(true);

            done();
        });
    });

    it('.boolean', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.boolean(true)).toBe(true);

            done();
        });
    });

    it('.array', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.array([])).toBe(true);

            done();
        });
    });

    it('.window', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.window(window)).toBe(true);

            done();
        });
    });

    it('.document', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.document(document)).toBe(true);

            done();
        });
    });

    it('.global', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.global(document)).toBe(false);

            done();
        });
    });

    it('.plainObject', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.plainObject({})).toBe(true);

            done();
        });
    });

    it('.emptyObject', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.emptyObject({})).toBe(true);

            done();
        });
    });

    it('.url', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.url('http://abc.com')).toBe(true);

            done();
        });
    });

    it('.email', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.email('cloudcome@163.com')).toBe(true);

            done();
        });
    });

    it('.validDate', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.validDate('2014-04-11')).toBe(true);

            done();
        });
    });

    it('.node', function (done) {
        coolie.callback(function (typeis) {
            expect(typeis.node(new Image())).toBe(true);

            done();
        });
    });
});
