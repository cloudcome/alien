# 1、规范

```js
var generator = require('/src/ui/generator.js');
var MyUI = generator({
    /**
     * 构造函数
     */
    constructor: function () {
        var the = this;

        // 自动初始化
        the._init();
    },


    /**
     * 初始化
     * @private
     */
    _init: function () {
        var the = this;

        the._initData();
        the._initNode();
        the._initEvent();
    },


    /**
     * 初始化数据
     * @private
     */
    _initData: function () {
        // code
    },


    /**
     * 初始化节点
     * @private
     */
    _initNode: function () {
        // code
    },


    /**
     * 初始化事件
     * @private
     */
    _initEvent: function () {
        // code
    },


    /**
     * 销毁实例
     */
    destroy: function () {
        // 1、节点的还原归位
        // 2、事件的解除绑定
    }
});
```

# 2、说明

- UI 构造函数已经默认继承了`Emitter`类。因此它具有了事件的发布（`emit`）和订阅（`on`）功能，以及事件解除（`un`）。
- 销毁实例的做法是，先执行原型上的`destroy`方法，然后赋值为`null`。

