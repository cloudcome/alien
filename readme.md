# ![Alien](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20140914113127363721429460.png)
一个为现代浏览器而生的前端解决方案。


# 作者
* [模块书写约定](https://github.com/cloudcome/alien/blob/master/help/module-convention.md)
* [cloudcome](http://github.com/cloudcome/)
* you


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


# 示例
1. 下载下来
2. 然后使用 [sts](https://www.npmjs.org/package/sts) 全局安装之后，启动（命令`sts 18081`）根目录即可
3. 打开`http://localhost:18081/examples/ui/dialog.html`


# 内容
- libs 库函数，构造方法
	- Deferred
	- Emitter
	- Pagination
	- Template
	- Validate
	- Filter
- util 工具库，静态方法
	- class
	- data
	- date
	- easing
	- howdo
- core 核心库
	- communication 通信
		- jsonp
		- upload
		- xhr
	- dom dom 操作
		- attribute
		- animation
		- modification
		- selector
	- navigator 浏览器操作
		- compatible
		- hashbang
		- querystring
		- shell
		- ua
	- event 事件
		- base
		- drag
		- ready
		- touch
		- wheel
- ui
	- Drag
	- Dialog
	- Msg
	- Scrollbar
	- Banner
	- Pagination
	- Tips


# 开发与生产
* 开发环境：使用seajs配合模块加载
* 生产环境：使用<https://www.npmjs.org/package/apb>配合模块构建


# 更多
* AMDJS规范：<https://github.com/amdjs/amdjs-api/wiki/AMD-(%E4%B8%AD%E6%96%87%E7%89%88)#%E4%BD%BF%E7%94%A8-require-%E5%92%8C-exports>