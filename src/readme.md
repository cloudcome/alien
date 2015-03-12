# ![Alien](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20140914113127363721429460.png) v1.1.0
一个为现代浏览器而生的前端解决方案。


# 特点
* 易使用，接口清晰，职责单一
* 易理解，模块化编程，颗粒化分解
* 易扩展，合理宏观
* 易推广，开源免费，人人参与


# 兼容
* ![ie10](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20140919111504913271952205.png) IE10+
* ![chrome](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20140919111534857215164833.png) chrome latest
* ![firefox](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20140919111545251609050667.png) firefox latest
* ![safari](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20140919191953088445180368.png) safari latest
* 适合桌面现代浏览器、手机现代浏览器


# 文档及示例
- 在线主页 <http://alien.ydr.me/>
- 在线文档 <http://alien.ydr.me/docs/>
- 在线演示 <http://alien.ydr.me/examples/>
- 本地演示 使用 <https://www.npmjs.org/package/sts>，根目录执行`sts 18081`即可。


# 使用
- 生产环境：使用[coolie](http://github.com/cloudcome/coolie)（模块加载器）来加载模块。
- 开发环境：使用[coolie builder](http://github.com/cloudcome/nodejs-coolie)来进行生产环境的模块构建。
- [模块书写约定](https://github.com/cloudcome/alien/blob/master/help/module-convention.md)


# 目录结构
```
- alien
|-- docs 静态的 HTML 文档，可以直接打开
|-- examples 简单示例
|-- help 帮助
|-- src 【源代码】
|   |-- 3rd 第三方独立脚本
|	|-- core 核心库
|	|	|-- communication 通信
|	|	|	|-- jsonp.js
|	|	|	|-- upload.js
|	|	|	`-- xhr.js
|	|	|-- dom DOM
|	|	|	|-- animation.js
|	|	|	|-- attribute.js
|	|	|	|-- canvas.js
|	|	|	|-- modification.js
|	|	|	|-- see.js
|	|	|	`-- selector.js
|	|	|-- event 事件
|	|	|	|-- base.js
|	|	|	|-- drag.js
|	|	|	|-- ready.js
|	|	|	|-- touch.js
|	|	|	`-- wheel.js
|	|	`-- navigator 浏览器
|	|		|-- compatible.js
|	|		|-- cookie.js
|	|		|-- hashbang.js
|	|		|-- querystring.js
|	|		|-- shell.js
|	|		|-- storage.js
|	|		`-- ua.js
|	|-- libs 基础库
|	|	|-- Animation.js
|	|	|-- Emitter.js
|	|	|-- Pagination.js
|	|	|-- Pjax.js
|	|	|-- Template.js
|	|	|-- Template.md
|	|	`-- Validator.js
|	|	`-- Weixin.js
|	|-- ui UI
|	|	|-- Autoheight textarea 自动增高
|	|	|-- Banner
|	|	|-- Dialog
|	|	|-- Editor markdown 编辑器
|	|	|-- Imgclip
|	|	|-- Imgview
|	|	|-- Mask
|	|	|-- Msg
|	|	|-- Pager
|	|	|-- Pagination
|	|	|-- Prettify
|	|	|-- Resize
|	|	|-- Scrollbar
|	|	|-- Scrollspy 视口滚动
|	|	|-- Tab
|	|	|-- Tooltip
|	|	|-- Validator
|	|	|-- Window
|	|	|-- base.js
|	|	`-- readme.md
|	|-- util 小工具
|	|	|-- allocation.js
|	|	|-- calendar.js
|	|	|-- canvas.js
|	|	|-- class.js
|	|	|-- controller.js
|	|	|-- date.js
|	|	|-- dato.js
|	|	|-- easing.js
|	|	|-- hashbang.js
|	|	|-- howdo.js
|	|	|-- keyframes.js
|	|	|-- querystring.js
|	|	|-- random.js
|	|	|-- selection.js
|	|	`-- typeis.js
|	|	`-- url.js
|	`-- readme.md
|-- static 文档所需要的静态文件
|-- templates 文档的模板
|-- test 单元测试
|-- package.json
`-- readme.md
```


# 参考的脚本（库）有:
- https://github.com/madrobby/zepto
- https://github.com/jquery/jquery
- https://github.com/chenmnkken/easyjs
- https://github.com/joyent/node
- https://github.com/aui/artTemplate
- https://github.com/yyx990803/vue
- https://github.com/barretlee/javascript-multiple-download/blob/master/lib.
- https://github.com/enyojs/canvas
- https://github.com/AlloyTeam/JM/tree/master/src
- https://github.com/visionmedia/page.js
- https://github.com/jashkenas/underscore/blob/master/underscore.js


# 文档注释变量

- `@abstract` (synonyms: `@virtual`)
  
  This member must be implemented (or overridden) by the inheritor.

- `@access`

  Specify the access level of this member (private, public, or protected).

- `@alias`

  Treat a member as if it had a different name.

- `@augments` (synonyms: `@extends`)

  This object adds onto a parent object.

- `@author`

  Identify the author of an item.

- `@borrows`

  This object uses something from another object.

- `@callback`

  Document a callback function.

- `@class` (synonyms: `@constructor`)

  This function is intended to be called with the "new" keyword.

- `@classdesc`

  Use the following text to describe the entire class.

- `@constant` (synonyms: `@const`)

  Document an object as a constant.

- `@constructs`

  This function member will be the constructor for the previous class.

- `@copyright`

  Document some copyright information.

- `@default` (synonyms: `@defaultvalue`)

  Document the default value.

- `@deprecated`

  Document that this is no longer the preferred way.

- `@description` (synonyms: `@desc`)

  Describe a symbol.

- `@enum`

  Document a collection of related properties.

- `@event`

  Document an event.

- `@example`

  Provide an example of how to use a documented item.

- `@exports`

  Identify the member that is exported by a JavaScript module.

- `@external` (synonyms: `@host`)

  Document an external class/namespace/module.

- `@file` (synonyms: `@fileoverview`, `@overview`)

  Describe a file.

- `@fires` (synonyms: `@emits`)

  Describe the events this method may fire.

- `@function` (synonyms: `@func`, `@method`)

  Describe a function or method.

- `@global`

  Document a global object.

- `@ignore`

  Remove this from the final output.

- `@inner`

  Document an inner object.

- `@instance`

  Document an instance member.

- `@kind`

  What kind of symbol is this?

- `@lends`

  Document properties on an object literal as if they belonged to a symbol with a given name.

- `@license`

  Document the software license that applies to this code.

- `@link`

  Inline tag 
  create a link.

- `@member` (synonyms: `@var`)

  Document a member.

- `@memberof`

  This symbol belongs to a parent symbol.

- `@mixes`

  This object mixes in all the members from another object.

- `@mixin`

  Document a mixin object.

- `@module`

  Document a JavaScript module.

- `@name`

  Document the name of an object.

- `@namespace`

  Document a namespace object.

- `@param` (synonyms: `@arg`, `@argument`)

  Document the parameter to a function.

- `@private`

  This symbol is meant to be private.

- `@property` (synonyms: `@prop`)

  Document a property of an object.

- `@protected`

  This member is meant to be protected.

- `@public`

  This symbol is meant to be public.

- `@readonly`

  This symbol is meant to be read-only.

- `@requires`

  This file requires a JavaScript module.

- `@returns` (synonyms: `@return`)

  Document the return value of a function.

- `@see`

  Refer to some other documentation for more information.

- `@since`

  When was this feature added?

- `@static`

  Document a static member.

- `@summary`

  A shorter version of the full description.

- `@this`

  What does the 'this' keyword refer to here?

- `@throws` (synonyms: `@exception`)

  Describe what errors could be thrown.

  Document tasks to be completed.

- `@tutorial`

  Insert a link to an included tutorial file.

- `@type`

  Document the type of an object.

- `@typedef`

  Document a custom type.

- `@variation`

  Distinguish different objects with the same name.

- `@version`

  Documents the version number of an item.