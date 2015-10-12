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
    });
```

每一个 page 都会安全执行以下方法

- leave 离开本页面之前
- enter 进入本页面之后
- update 更新本页面之后




