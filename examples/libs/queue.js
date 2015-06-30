/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-04-21 14:02
 */


define(function (require, exports, module) {
    'use strict';


    var selector = require('/src/core/dom/selector.js');
    var $length = selector.query('#length')[0];
    var $push = selector.query('#push')[0];
    var $begin = selector.query('#begin')[0];
    var $pause = selector.query('#pause')[0];
    var $continue = selector.query('#continue')[0];
    var $stop = selector.query('#stop')[0];
    var index = 1;
    var random = require('/src/utils/random.js');
    var buildTask = function () {
        var id = index++;

        return function (done) {
            setTimeout(function () {
                console.log('任务', id);
                done();
            }, random.number(500, 1000));
        };
    };
    var Queue = require('/src/libs/queue.js');
    var q = new Queue();

    q.on('size', function (size) {
        $length.innerHTML = size;
    });

    $push.onclick = function () {
        q.push(buildTask());
    };

    $begin.onclick = function () {
        q.begin();
    };

    $pause.onclick = function () {
        q.pause();
    };

    $continue.onclick = function () {
        q.continue();
    };

    $stop.onclick = function () {
        q.stop();
    };

    q.on('done', function () {
        console.log('完成');
    });
});