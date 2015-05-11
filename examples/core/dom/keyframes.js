define(function (require) {
    'use strict';

    var selector = require('../../../src/core/dom/selector.js');
    var keyframes = require('../../../src/core/dom/keyframes.js');
    var animation = require('../../../src/core/dom/animation.js');
    var modification = require('../../../src/core/dom/modification.js');
    var event = require('../../../src/core/event/base.js');
    var Template = require('../../../src/libs/Template.js');
    var alert = require('../../../src/widgets/alert.js');
    var Dialog = require('../../../src/ui/Dialog/');
    var Autoheight = require('../../../src/ui/Autoheight/');
    var template = selector.query('#template')[0].innerHTML;
    var tpl = new Template(template);
    var $name = selector.query('#name')[0];
    var $list = selector.query('#list')[0];
    var $gen = selector.query('#gen')[0];
    var $run = selector.query('#run')[0];
    var $ret = selector.query('#ret')[0];
    var $demo = selector.query('#demo')[0];
    var dialog = new Dialog($demo, {
        width: '90%',
        height: '90%',
        title: '动画演示'
    });
    var ah = new Autoheight($ret);
    var name = 'my-keyframes';
    var parseJSON = function (str) {
        str = '{' + str + '}';

        var fn = new Function('', 'return ' + str);

        try {
            return fn();
        } catch (err) {
            return {};
        }
    };

    // 删除
    event.on($list, 'click', '.remove', function () {
        var $li = selector.closest(this, 'li')[0];

        modification.remove($li);
    });

    // 添加帧动画
    selector.query('#add')[0].onclick = function () {
        modification.insert(tpl.render(), $list, 'beforeend');
        $gen.disabled = false;
    };

    // 生成帧动画
    $gen.onclick = function () {
        var $itemList = selector.query('li');
        var obj = {};

        name = $name.value;

        $itemList.forEach(function ($li) {
            var $input = selector.query('input', $li)[0];
            var $textarea = selector.query('textarea', $li)[0];

            obj[$input.value] = parseJSON($textarea.value);
        });

        if (!obj[0]) {
            $gen.disabled = true;
            return alert('缺少开始帧动画，帧点为 0');
        }

        if (!obj[1]) {
            $gen.disabled = true;
            return alert('缺少结束帧动画，帧点为 1');
        }

        keyframes.create(name, obj);
        $ret.value = window.cssbeautify(keyframes.getStyle(name));
        ah.resize();
        $run.disabled = false;
    };

    // 运行动画
    $run.onclick = function () {
        dialog.open(function () {
            animation.keyframes($demo, name);
        });
    };

    $demo.onclick = function () {
        animation.keyframes($demo, name);
    };
});