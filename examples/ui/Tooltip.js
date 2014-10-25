define(function (require) {
    'use strict';

    var Tooltip = require('/src/ui/Tooltip.js');
    var btn0 = document.getElementById('btn-0');
    var btn1 = document.getElementById('btn-1');
    var btn2 = document.getElementById('btn-2');
    var btn3 = document.getElementById('btn-3');
    var btn4 = document.getElementById('btn-4');


    btn0.onclick = function () {
        this.times = (this.times || 0) + 1;
        if (this.times % 2) {
            this.tooltip = new Tooltip(this, {
                content: '我是自动提示的，虽然我的位置是智能的，但是出现的位置还是以上边居多，因为通常鼠标是在下边一点，然后文字在中间，提示在上边，非常的合适'
            });
        } else {
            this.tooltip.destroy();
        }
    };

    btn1.onclick = function () {
        this.times = (this.times || 0) + 1;
        if (this.times % 2) {
            this.tooltip = new Tooltip(this, {
                placement: 'top',
                content: '这条信息是固定出现在上边的'
            });
        } else {
            this.tooltip.destroy();
        }
    };

    btn2.onclick = function () {
        this.times = (this.times || 0) + 1;
        if (this.times % 2) {
            this.tooltip = new Tooltip(this, {
                placement: 'right',
                content: '这条信息是固定出现在右边的这条信息是固定出现在右边的这条信息是固定出现在右边的这条信息是固定出现在右边的这条信息是固定出现在右边的这条信息是固定出现在右边的'
            });
        } else {
            this.tooltip.destroy();
        }
    };

    btn3.onclick = function () {
        this.times = (this.times || 0) + 1;
        if (this.times % 2) {
            this.tooltip = new Tooltip(this, {
                placement: 'bottom',
                content: '这条信息是固定出现在下边的这条信息是固定出现在下边的这条信息是固定出现在下边的这条信息是固定出现在下边的这条信息是固定出现在下边的这条信息是固定出现在下边的'
            });
        } else {
            this.tooltip.destroy();
        }
    };

    btn4.onclick = function () {
        this.times = (this.times || 0) + 1;
        if (this.times % 2) {
            this.tooltip = new Tooltip(this, {
                placement: 'left',
                content: '这条信息是固定出现在左边的这条信息是固定出现在左边的这条信息是固定出现在左边的这条信息是固定出现在左边的这条信息是固定出现在左边的这条信息是固定出现在左边的这条信息是固定出现在左边的这条信息是固定出现在左边的这条信息是固定出现在左边的这条信息是固定出现在左边的这条信息是固定出现在左边的'
            });
        } else {
            this.tooltip.destroy();
        }
    };
});