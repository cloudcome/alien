# Template 语法
------------------


# 输出
```
{{exp}} 转义输出
{{=exp}} 原样输出
```

# 表达式
```
# 判断
{{if exp}}
{{else if exp}}
{{else}}
{{/if}}

# 列表
{{list list as index,item}}
{{/list}}

{{list list as item}}
{{/list}}
```


# 赋值
```
{{var a = 1;}} 定义
{{#a = 1;}} 赋值
```