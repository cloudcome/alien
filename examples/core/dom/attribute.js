define(function (require) {
    'use strict';

    var body = document.body;
    var script = document.getElementById('script');
    var div1 = document.getElementById('div1');
    var div2 = document.getElementById('div2');
    var domAttribute = require('/src/core/dom/attribute.js');
    window.domAttribute = domAttribute;

    console.log('==========================');
    console.log('attr');
    console.log(domAttribute.attr(body, 'name', 123));
    console.log(domAttribute.attr(body, 'name'));
    console.log(domAttribute.attr(body, {
        id: 'id-123',
        key1: 'val1',
        key2: 'val2',
        key3: 'val3',
        key4: 'val4'
    }));
    console.log(domAttribute.attr(body, ['id', 'key1', 'name']));

    console.log('==========================');
    console.log('hasAttr');
    console.log(domAttribute.hasAttr(body, 'id'));

    console.log('==========================');
    console.log('removeAttr');
    console.log(domAttribute.removeAttr(body, 'key1 key2'));
    console.log(domAttribute.removeAttr(div1));

    console.log('==========================');
    console.log('prop');
    console.log(domAttribute.prop(body, 'name2', 123));
    console.log(domAttribute.prop(body, 'name2'));
    console.log(domAttribute.prop(body, {
        id2: 'id-123',
        key2: 'key'
    }));
    console.log(domAttribute.prop(body, ['id2', 'key2', 'name2']));

    console.log('==========================');
    console.log('css');
    console.log(domAttribute.css(body, 'width', '1000px'));
    console.log(domAttribute.css(body, 'width'));
    console.log(domAttribute.css(body, {
        backgroundColor: '#eee',
        'border-after': '10px'
    }));
    console.log(domAttribute.css(body, ['width', 'backgroundColor']));

    console.log('==========================');
    console.log('data');
    console.log(domAttribute.data(body, 'width', '1000px'));
    console.log(domAttribute.data(body, 'width'));
    console.log(domAttribute.data(body, {
        id2: 'id-123',
        'key2-abc': {
            a: 1,
            b: 2
        }
    }));
    console.log(domAttribute.data(body, ['width', 'backgroundColor']));

    console.log('==========================');
    console.log('html');
    console.log(domAttribute.html(div1, '<p>Hello worold!</p>'));
    console.log(domAttribute.html(div1));

    console.log('==========================');
    console.log('text');
    console.log(domAttribute.text(div2, '<p>Hello worold!</p>'));
    console.log(domAttribute.text(div2));

    console.log('==========================');
    console.log('addClass');
    console.log(domAttribute.addClass(div1, 'a'));
    console.log(domAttribute.addClass(div1, 'a b c d'));
    console.log(domAttribute.addClass(div2, 'a b c d'));

    console.log('==========================');
    console.log('hasClass');
    console.log(domAttribute.hasClass(div1, 'a'));
    console.log(domAttribute.hasClass(div2, 'b'));

    console.log('==========================');
    console.log('removeClass');
    console.log(domAttribute.removeClass(div1, 'a'));
    console.log(domAttribute.removeClass(div2));
});