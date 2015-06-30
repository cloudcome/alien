/*!
 * utils/allocation.js
 * @author ydr.me
 * @create 2015-04-24 17:06
 */

describe('utils/allocation', function () {
    'use strict';

    var currentScript = coolie.getCurrentScript();
    var currentScriptURL = coolie.getScriptURL(currentScript);
    var host = coolie.getHost(currentScriptURL);
    var dir = coolie.getPathDir(currentScriptURL);

    coolie.config({
        base: host + coolie.getPathJoin(dir, '../../src/'),
    }).use('./utils/calendar.js');

    it('.month', function (done) {
        coolie.callback(function (calendar) {
            var months = calendar.month(2015, 0, {
                weeks: 6
            });

            // 2015年1月，日历第一天是：2014年12月28日
            expect(months[0][0].year).toEqual(2014);
            expect(months[0][0].month).toEqual(11);
            expect(months[0][0].date).toEqual(28);
            // 2015年1月，日历一共有6个星期（定死）
            expect(months.length).toEqual(6);
            // 2015年5月，日历最后一天是：2015年2月7日
            expect(months[5][6].year).toEqual(2015);
            expect(months[5][6].month).toEqual(1);
            expect(months[5][6].date).toEqual(7);

            done();
        });
    });
});