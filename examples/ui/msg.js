define(function (require) {
    'use strict';

    var Msg = require('../../src/ui/msg/index.js');
    var alert = require('../../src/widgets/alert.js');

    document.getElementById('btn0').onclick = function () {
        new Msg({
            isModal: false,
            content: '腾格里额里斯镇，沙漠深处，数个足球场大小的长方形的排污池并排居于沙漠之中，周边用水泥砌成，围有一人高绿色网状铁丝栏。',
            buttons: []
        }).on('beforeopen', function () {
                console.log(this.alienEmitter);
            });
    };


    document.getElementById('btn1').onclick = function () {
        new Msg({
            content: '你在朋友圈里这么流弊，你家里人造吗？你在朋友圈里这么流弊，你家里人造吗？你在朋友圈里这么流弊，你家里人造吗？你在朋友圈里这么流弊，你家里人造吗？',
            buttons: ['我去年买了个表']
        }).on('close', function (index) {
                alert(this.getOptions('buttons')[index]);
            });
    };

    document.getElementById('btn2').onclick = function () {
        new Msg({
            content: '你到底说不说，说不说，说不说？你到底说不说，说不说，说不说？你到底说不说，说不说，说不说？你到底说不说，说不说，说不说？',
            buttons: ['说', '不说']
        }).on('close', function (index) {
                alert(this.getOptions('buttons')[index]);
            });
    };

    document.getElementById('btn3').onclick = function () {
        new Msg({
            content: '有你这么逗比的吗？有你这么逗比的吗？有你这么逗比的吗？有你这么逗比的吗？有你这么逗比的吗？有你这么逗比的吗？有你这么逗比的吗？',
            buttons: [
                '有吗', '有吧', '有的'
            ]
        }).on('close', function (index) {
                alert(this.getOptions('buttons')[index]);
            });
    };

    document.getElementById('btn4').onclick = function () {
        new Msg({
            content: '这么多按钮，确定是你需要的？这么多按钮，确定是你需要的？这么多按钮，确定是你需要的？这么多按钮，确定是你需要的？这么多按钮，确定是你需要的？',
            buttons: ['不知道', '应该是我需要的', '我也不知道', '还是越多越好吧']
        }).on('close', function (index) {
                alert(this.getOptions('buttons')[index]);
            });
    };

    document.getElementById('btn5').onclick = function () {
        new Msg({
            content: '数一下这里一共出现了几个按钮？！数一下这里一共出现了几个按钮？！数一下这里一共出现了几个按钮？！数一下这里一共出现了几个按钮？！',
            buttons: ['一共1个按钮', '一共2个按钮', '一共3个按钮', '一共4个按钮', '算了，懒得数了']
        }).on('close', function (index) {
                new Msg({
                    style: 'danger',
                    title: null,
                    content: this.getOptions('buttons')[index],
                    timeout: 1000
                });
            });
    };


    document.getElementById('btn6').onclick = function () {
        new Msg({
            isModal: false,
            title: null,
            content: '注意啦！！2000ms 后自动消失注意啦！！2000ms 后自动消失注意啦！！2000ms 后自动消失注意啦！！2000ms 后自动消失注意啦！！2000ms 后自动消失',
            buttons: [],
            timeout: 2000
        });
    };

});