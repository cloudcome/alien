# 1、规范

```js
// 默认参数
var defaults = {
    width: 700,
    height: 300
};
var dato = require('../../utils/dato.js');
var ui = require('../');
var MyUI = ui.create({
    /**
     * 构造函数
     * @param $ele {Object} 节点
     * @param [options] {Object} 初始化参数
     */
    constructor: function ($ele, options) {
        var the = this;

        // 参数
        the._options = dato.extend(true, {}, defaults, options);

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
MyUI.defaults = defaults;
```

# 2、说明

- UI 构造函数已经默认继承了`Emitter`类。因此它具有了事件的发布（`emit`）和订阅（`on`）功能，以及事件解除（`un`）。
- `ui.create`已经默认添加了`#setOptions`和`#getOptions`原型方法，参数属性为`this._options`。
- 销毁实例的做法是，先执行原型上的`destroy`方法，然后赋值为`null`。

