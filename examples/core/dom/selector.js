define(function (require) {
    'use strict';

    var domSelector = require('/src/core/dom/selector.js');
    var div = domSelector.query('#div');
    var divs = domSelector.query('.div', div[0]);
    var div3 = divs[3];
    var div3Siblings = domSelector.siblings(div3);

    window.domSelector = domSelector;

    console.log('==========================');
    console.log('div3 index');
    console.log(domSelector.index(div3));

    console.log('==========================');
    console.log('div3Siblings');
    console.log(div3Siblings);

    console.log('==========================');
    console.log('div3 prev');
    console.log(domSelector.prev(div3));

    console.log('==========================');
    console.log('div3 next');
    console.log(domSelector.next(div3));

    console.log('==========================');
    console.log('div3 closest body');
    console.log(domSelector.closest(div3, 'body'));

    console.log('==========================');
    console.log('div3 parent');
    console.log(domSelector.parent(div3));

    console.log('==========================');
    console.log('#div children');
    console.log(domSelector.children(div[0]));

    console.log('==========================');
    console.log('#div contents');
    console.log(domSelector.contents(div[0]));

    console.log('==========================');
    console.log('#div filter');
    console.log(domSelector.filter(divs, function () {
        return domSelector.index(this) % 2;
    }));
});