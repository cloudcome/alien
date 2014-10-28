/*!
 * 图片裁剪
 * @author ydr.me
 * @create 2014-10-28 15:21
 */


define(function (require, exports, module) {
    /**
     * @module parent/index
     */
    'use strict';

    var style = require('text!./style.css');
    var template = require('text!./template.html');
    var Template = require('../../libs/Template.js');
    var Emitter = require('../../libs/Emitter.js');
    var data = require('../../util/data.js');
    var klass = require('../../util/class.js');
    var selector = require('../../core/dom/selector.js');
    var modification = require('../../core/dom/modification.js');
    var attribute = require('../../core/dom/attribute.js');
    var event = require('../../core/event/base.js');
    var alienIndex = 1;
    var defaults = {
        minWidth: 100,
        minHeight: 100,
        maxWidth: null,
        maxHeight: null,
        ratio: 1
    };
    var Imgclip = klass.create({
        STATIC: {
            defaults: defaults
        },
        constructor: function ($ele, options) {
            var the = this;

            $ele = selector.query($ele);

            if (!$ele.length) {
                throw 'instance require an element';
            }

            Emitter.apply(the);
            the._$ele = $ele[0];
            the._options = data.extend(!0, {}, defaults, options);

            if (the._$ele.complete) {
                the._init();
            } else {
                event.on(the._$ele, 'load', the._init.bind(the));
            }
        },
        _init: function () {
            var the = this;
            var tpl = new Template(template);
            var wrap;
            var $ele = the._$ele;
            var $img = $ele.cloneNode(!0);
            var $wrap;

            the._id = alienIndex++;
            wrap = tpl.render({
                id: the._id
            });

            $wrap = the._$wrap = modification.parse(wrap)[0];
            modification.insert($wrap, $ele, 'afterend');
            attribute.css($wrap, {
                position: 'absolute',
                width: attribute.width($ele),
                height: attribute.height($ele)
            });
            attribute.top($wrap, attribute.top($ele));
            attribute.left($wrap, attribute.left($ele));
            the._$election = selector.query('.alien-ui-imgclip-selection', $wrap)[0];
            the._$bg = selector.query('.alien-ui-imgclip-bg', $wrap)[0];
            modification.insert($img, the._$election, 'beforeend');
            the._$img = $img;
        }
    }, Emitter);

    modification.importStyle(style);
    module.exports = Imgclip;
});