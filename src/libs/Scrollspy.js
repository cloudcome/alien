/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-03-05 10:27
 */


define(function (require, exports, module) {
    /**
     * @module utils/lazy
     */
    'use strict';

    var see = require('../core/dom/see.js');
    var selector = require('../core/dom/selector.js');
    var attribute = require('../core/dom/attribute.js');
    var event = require('../core/event/base.js');
    var controller = require('./controller.js');
    var dato = require('./dato.js');
    var klass = require('./class.js');
    var Emitter = require('../libs/Emitter.js');
    var defaults = {
        selector: 'img',
        originalData: 'original',
        flag: '-alien-lazy-'
    };
    var Lazy = klass.create(function (options) {
        var the = this;

        the._options = dato.extend({}, defaults, options);
        the._init();
    });

    Lazy.fn._init = function () {
        var the = this;

        the._initEvent();
        the._onscroll();
    };

    Lazy.fn._initEvent = function () {
        var the = this;

        event.on(window, 'scroll', controller.debounce(the._onscroll.bind(the)));
    };


    Lazy.fn._onscroll = function () {
        var the = this;
        var options = the._options;
        var $res = selector.query(options.selector);

        dato.each($res, function (index, $re) {
            if ($re[options.flag]) {
                return;
            }

            var isInViewport = see.isInViewport($re);

            if (isInViewport) {
                $re[options.flag] = true;
                $re.src = attribute.data($re, options.originalData);
                attribute.removeAttr($re, 'data-' + options.originalData);
            }
        });
    };

    module.exports = Lazy;
});