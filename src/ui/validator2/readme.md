# 总则
- 验证成功，会在表单项目上添加“has-success”样式类
- 验证失败，会在表单项目上添加“has-error”样式类


# 默认过滤
- trim【true】是否过滤左右空白
- exist【false】是否存在才进行验证


# 标准规则
- type【false】 数据类型
- required【false】 是否必填
- length【-】 指定字数长度限制
- minLength【-】 最小字数长度
- maxLength【-】 最大字数长度
- minBytes【-】 指定字节长度限制（1中文2字节，1英文1字节）
- minBytes【-】 最小字节长度
- maxBytes【-】 最大字节长度
- min【-】 最小数值
- max【-】 最大数值
- regexp【-】 正则表达式
- equal【-】 全等值
- inArray【-】 指定范围值
- msg【-】 指定消息


# 扩展规则
- equalName【-】与之相等的 name
- suffix【-】后缀数组


# 自定义规则
```
Validator.registerRule({
    name: 'suffix',
    type: 'array'
}, function (suffix, val, next) {
    var sf = (val.match(/\.[^.]*$/) || [''])[0];
    var reg = new RegExp('(' + suffix.map(function (sf) {
        return string.escapeRegExp(sf);
    }).join('|') + ')$', 'i');

    next(reg.test(sf) ? null : new Error(this.alias + '的后缀必须为“' +
    suffix.join('/') + '”' +
    (suffix.length > 1 ? '之一' : '')), val);
});
```