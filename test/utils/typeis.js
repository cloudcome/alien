/*!
 * utils/typeis
 * @author ydr.me
 * @create 2015-04-24 14:36
 */


describe('utils/typeis', function () {
    'use strict';

    coolie.config({
        base: '../src/'
    }).use('./utils/typeis.js');

    it('()', function (done) {
        coolie.callback(function (main) {
            expect(main()).toBe('undefined');
            expect(main(null)).toBe('null');
            expect(main(1)).toBe('number');
            expect(main('1')).toBe('string');
            expect(main(true)).toBe('boolean');
            expect(main([])).toBe('array');
            expect(main({})).toBe('object');
            expect(main(/./)).toBe('regexp');
            expect(main(window)).toBe('window');
            expect(main(document)).toBe('document');
            expect(main(NaN)).toBe('nan');
            expect(main(function () {
            })).toBe('function');
            expect(main(new Image())).toBe('element');
            expect(main(new Date())).toBe('date');
            window.global = {};
            expect(main(global)).toBe('global');

            done();
        });
    });

    it('.string', function (done) {
        coolie.callback(function (main) {
            expect(main.string('1')).toBe(true);
            expect(main.string(1)).toBe(false);

            done();
        });
    });

    it('.number', function (done) {
        coolie.callback(function (main) {
            expect(main.number(1)).toBe(true);

            done();
        });
    });

    it('.function', function (done) {
        coolie.callback(function (main) {
            expect(main.function(function () {
            })).toBe(true);

            done();
        });
    });

    it('.object', function (done) {
        coolie.callback(function (main) {
            expect(main.object({})).toBe(true);

            done();
        });
    });

    it('.undefined', function (done) {
        coolie.callback(function (main) {
            expect(main.undefined()).toBe(true);

            done();
        });
    });

    it('.null', function (done) {
        coolie.callback(function (main) {
            expect(main.null(null)).toBe(true);

            done();
        });
    });

    it('.nan', function (done) {
        coolie.callback(function (main) {
            expect(main.nan(NaN)).toBe(true);

            done();
        });
    });

    it('.element', function (done) {
        coolie.callback(function (main) {
            expect(main.element(new Image())).toBe(true);

            done();
        });
    });

    it('.regexp', function (done) {
        coolie.callback(function (main) {
            expect(main.regexp(/./)).toBe(true);

            done();
        });
    });

    it('.boolean', function (done) {
        coolie.callback(function (main) {
            expect(main.boolean(true)).toBe(true);

            done();
        });
    });

    it('.array', function (done) {
        coolie.callback(function (main) {
            expect(main.array([])).toBe(true);

            done();
        });
    });

    it('.window', function (done) {
        coolie.callback(function (main) {
            expect(main.window(window)).toBe(true);

            done();
        });
    });

    it('.document', function (done) {
        coolie.callback(function (main) {
            expect(main.document(document)).toBe(true);

            done();
        });
    });

    it('.global', function (done) {
        coolie.callback(function (main) {
            expect(main.global(document)).toBe(false);

            done();
        });
    });

    it('.plainObject', function (done) {
        coolie.callback(function (main) {
            expect(main.plainObject({})).toBe(true);

            done();
        });
    });

    it('.emptyObject', function (done) {
        coolie.callback(function (main) {
            expect(main.emptyObject({})).toBe(true);

            done();
        });
    });

    it('.url', function (done) {
        coolie.callback(function (main) {
            expect(main.url('http://abc.com')).toBe(true);

            done();
        });
    });

    it('.email', function (done) {
        coolie.callback(function (main) {
            expect(main.email('cloudcome@163.com')).toBe(true);

            done();
        });
    });

    it('.validDate', function (done) {
        coolie.callback(function (main) {
            expect(main.validDate('2014-04-11')).toBe(true);

            done();
        });
    });

    it('.node', function (done) {
        coolie.callback(function (main) {
            expect(main.node(new Image())).toBe(true);

            done();
        });
    });

    it('.node', function (done) {
        coolie.callback(function (main) {
            expect(main.node(new Image())).toBe(true);

            done();
        });
    });
});
