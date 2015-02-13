define(function (require) {
    'use strict';

    var body = document.body;
    var script = document.getElementById('script');
    var p1 = document.getElementById('p1');
    var domModification = require('../../../src/core/dom/modification.js');
    var index = 0;

    console.log('==========================');
    console.log('parse');
    console.log(domModification.parse('123'));
    console.log(domModification.parse('<div/>'));
    console.log(domModification.parse('<div/>123'));
    console.log(domModification.parse('<div>123</div><p>456</p>'));

    console.log('==========================');
    console.log('create');
    console.log(domModification.create('#text', '123'));
    console.log(domModification.create('#comment', '123'));
    console.log(domModification.create('div', {
        id: 'id-123'
    }));

    console.log('==========================');
    console.log('body beforebegin');
    console.log(domModification.insert(_create(), script, 'beforebegin'));

    console.log('==========================');
    console.log('body afterbegin');
    console.log(domModification.insert(_create(), body, 'afterbegin'));

    console.log('==========================');
    console.log('script beforeend');
    console.log(domModification.insert(_create(), body, 'beforeend'));

    console.log('==========================');
    console.log('script afterend');
    console.log(domModification.insert(_create(), script, 'afterend'));

    console.log('==========================');
    console.log('script wrap');
    console.log(domModification.wrap(script, '<div><ul><li>1</li><li>2</li></ul></div>'));

    console.log('==========================');
    console.log('script unwrap');
    console.log(domModification.unwrap(p1, 'ul li ul li'));


    domModification.insert('字符串', document.body);
    domModification.insert('<h1>HTML 标签</h1>', document.body);
    domModification.insert(' <h1>HTML 标签 字符串</h1>', document.body);


    function _create() {
        var id = 'id-' + Date.now();
        var div = domModification.create('div', {
            id: id,
            style: {
                backgroundColor: '#eee',
                border: '1px solid #ddd',
                padding: '10px',
                'margin-bottom': '10px'
            }
        });
        div.innerHTML = '第' + (++index) + '个div';

        return div;
    }
});