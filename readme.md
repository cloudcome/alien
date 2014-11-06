# ![Alien](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20140914113127363721429460.png)
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


# 示例
- 在线演示 <http://alien.ydr.me>
- 本地演示 使用 <https://www.npmjs.org/package/sts>


# 使用
- 生产环境：使用[coolie](http://github.com/cloudcome/coolie)（模块加载器）来加载模块。
- 开发环境：使用[coolie builder](http://github.com/cloudcome/nodejs-coolie)来进行生产环境的模块构建。
- [模块书写约定](https://github.com/cloudcome/alien/blob/master/help/module-convention.md)


# 内容
- core 核心库
	- communication 通信
		- jsonp
		- upload
		- xhr
	- dom dom 操作
		- animation
		- attribute
		- canvas
		- modification
		- selector
	- event 事件
		- base
		- drag
		- ready
		- touch
		- wheel
	- navigator 浏览器操作
		- compatible
		- cookie
		- hashbang
		- querystring
		- shell
		- ua
- libs 库函数，构造方法
	- DDB Data DOM Binding
	- Emitter
	- Pagination
	- Template
	- Validate
- ui
	- Banner
	- Dialog
	- Imgclip
	- Msg
	- Pagination
	- Resize
	- Scrollbar
	- Tooltip
- util 工具库，静态方法
	- canvas
	- class
	- data
	- date
	- easing
	- hashbang
	- howdo
	- querystring
	- random
	- selection
