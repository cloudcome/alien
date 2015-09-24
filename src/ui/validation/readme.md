# validation
配置`breakOnInvalid`表示是否在遇到非法字段时断开验证。


# 验证规则
表单验证规则来源于3个地方

- libs/validation-rules.js 内置的静态规则
- ui/validation/validation-rules.js 内置的静态规则
- libs 层或者 ui 层自定义的规则

静态规则是有名称的，而自定义的规则是匿名的。

内置规则有：

- type\[属性]: number/integer/mobile/email/url 数据类型
- required\[属性]: true/false 是否必填
- minLength: <Number> 最小长度
- maxLength: <Number> 最大长度
- maxlength\[属性]: <Number> 最大长度
- equal: <name> 等于
- min\[属性]: <Number> 数值最小值
- max\[属性]: <Number> 数值最大值
- step\[属性]: <Number> 数值步进值
- accept\[属性]: <String> 文件类型
- pattern\[属性]: <String> 正则字符串
- minSize: <Number> 图片最小尺寸
- maxSize: <Number> 图片最大尺寸
- minWidth: <Number> 图片最小宽度
- maxWidth: <Number> 图片最大宽度
- minHeight: <Number> 图片最小高度
- maxHeight: <Number> 图片最大高度



# JS 验证规则写法
## libs 层静态规则
静态规则，则可以被任何实例使用，不建议重写和添加。

```
var Validation = require('libs/validation.js');

Validation.addRule('规则名称', function(value, done, param0, param1, param2, ...){
    // value 为传入的表单值
    // done 为验证结束的回调
    // done('错误消息');如果消息为空，表示验证成功
    // param0, param1, param2, ... 表示验证规则的值
});
```

如内置的 `type`，其规则写法为：
```
Validation.addRule('type', function(value, done, type){
    // 对应的 DOM 里规则为 `data-validation="type: url"`
    if(type === 'url'){
        // ...
        done('URL 不合法');
    }
});
```


## libs 层实例规则
实例规则，只属于当前实例，验证规则有顺序之别。
```
var Validation = require('libs/validation.js');
var v = new Validation();


// 1. 添加内置的规则给指定字段
v.addRule('表单字段', 'libs层的静态验证规则');

// 2. 添加自定义规则给指定字段
// 这个验证规则是匿名的（其实 libs 层会分配一个序列号）
v.addRule('表单字段', function(value, done, param0, param1, param2, ...){
    // value 为传入的表单值
    // done 为验证结束的回调
    // done('错误消息');如果消息为空，表示验证成功
    // param0, param1, param2, ... 表示验证规则的值
});
```


## ui 层实例规则
ui 层没有静态规则，只有实例规则；实例规则只属于当前实例有关。
```
var Validation = require('ui/validation/index.js');
var v = new Validation('#form');


// 1. 添加内置的规则给指定字段，通常内置的规则都可以直接写在 DOM 属性里
v.addRule('表单字段', 'libs层的静态验证规则');

// 2. 添加自定义规则给指定字段
// 这个验证规则是匿名的（其实 libs 层会分配一个序列号）
v.addRule('表单字段', function(value, done, param0, param1, param2, ...){
    // value 为传入的表单值
    // done 为验证结束的回调
    // done('错误消息');如果消息为空，表示验证成功
    // param0, param1, param2, ... 表示验证规则的值
});
```



# DOM 验证规则写法
规则来源于 html 里的`data-validation`属性：

```
<input type="text" data-validation="type:email,minLength:5,maxLength:12">
```

如上，验证规则按顺序为

1. type
2. minLength
3. maxLength

按顺序进行依次验证，如果验证失败，则退出队列。



# 表单验证消息
消息来源于表单验证规则里的错误消息，错误消息规则为
```
${1}是字段，${2}是规则值
值：12 + 规则：max: 5 + ${1}不能大于${2} => 字段不能大于5
```

其中，字段的值来源顺序如下

- setAlias('字段', '字段别名')
- data-alias="字段:字段别名"
- 对应的 label 的值
- 对应的 placeholder 值
- 对应的 name 值


# 重写表单消息
如果对内置的静态规则消息不赞同，除了修改静态规则外，还可以在 DOM 层直接修改：
```
<input type="text" 
    data-validation="type:email,minLength:5,maxLength:12"
    data-msg="type:数据类型不合法啦">
```

