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
            allocation.getset({

            });

            done();
        });
    });
});