define(function (require) {
    'use strict';

    var selector = require('../../../src/core/dom/selector.js');
    var keyframes = require('../../../src/core/dom/keyframes.js');
    var animation = require('../../../src/core/dom/animation.js');
    var modification = require('../../../src/core/dom/modification.js');
    var Template = require('../../../src/libs/Template.js');
    var template = selector.query('#template')[0].innerHTML;
    var tpl = new Template(template);
    var $list = selector.query('#list')[0];

    // 添加帧动画
    selector.query('#add')[0].onclick = function () {
        modification.insert(tpl.render(), $list, 'beforeend');
    };

    // 生成帧动画
    selector.query('#gen')[0].onclick = function () {

    };
});