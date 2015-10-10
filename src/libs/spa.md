# (S)ingle (P)age (A)pplication

单页面应用不需要切换页面，不会出现白屏，有很好的用户体验。如网易云音乐（<http://music.163.com>）。


```
var spa = new SPA();

spa
    .if('/page1/', function (ready) {
        require.async('./pages/page1.js', ready);
    })
    .if('/page2/:pageId/', function (ready) {
        require.async('./pages/page2.js', ready);
    })
    .if(/^\/page3\/(\d+)\/$/, function (ready) {
        require.async('./pages/page3.js', ready);
    })
    .else(function (ready) {
        require.async('./pages/404.js', ready);
    })
    .before('enter', function (route) {
        console.log(route);
    })
    .after('enter', function (route) {
        console.log(route);
    });
```

每一个`spa#app`都会调用`enter`（app 进入）和`leave`（app 离开）方法。


