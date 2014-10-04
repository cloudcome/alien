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


# 内容
* util
	* data.js----------------------------------包含数据的遍历、判断
	* date.js----------------------------------日期解析、处理
	* Emitter.js-------------------------------事件机制
	* promise.js-------------------------------promise
	* validator.js-----------------------------数据验证
	* filter.js--------------------------------数据过滤
	* canvas.js--------------------------------2D画布
	* svg.js-----------------------------------矢量作图
* core
	* dom
		* selector.js--------------------------DOM 选择器
		* attribute.js-------------------------DOM 属性操作
		* modification.js----------------------DOM 修改操作
		* animation.js-------------------------DOM 动画
		* position.js--------------------------DOM 位置
	* event
		* base.js------------------------------浏览器事件基本
		* touch.js-----------------------------触摸支持
		* mousewheel.js------------------------鼠标滚轮支持
		* fullscreen.js------------------------全屏事件支持
	* communication
		* xhr.js-------------------------------XHR通信
		* upload.js----------------------------上传通信
		* socket.js----------------------------socket通信
		* crossdomain.js-----------------------跨域通信
	* navigator
		* ua.js--------------------------------浏览器UA检测
		* support.js---------------------------浏览器特征检测
		* compatible.js------------------------浏览器兼容支持
		* hashbang.js--------------------------URL hashbang
		* querystring.js-----------------------URL querystring
* ui
	* onepage----------------------------------单页系统
	* notification-----------------------------桌面通知
	* sortable---------------------------------排序
	* scrollbar--------------------------------自定义滚动条
	* banner-----------------------------------焦点图
	* progress---------------------------------进度条
	* drag-------------------------------------拖拽
	* drop-------------------------------------释放
	* dialog-----------------------------------对话框
	* confirm----------------------------------确认框
	* msg--------------------------------------消息框
	* tips-------------------------------------提示框
	* preview----------------------------------图片预览
	* imgclip----------------------------------图片裁剪
	* more


# 开发与生产
* 开发环境：使用seajs配合模块加载
* 生产环境：使用<https://www.npmjs.org/package/apb>配合模块构建


# 更多
* AMDJS规范：<https://github.com/amdjs/amdjs-api/wiki/AMD-(%E4%B8%AD%E6%96%87%E7%89%88)#%E4%BD%BF%E7%94%A8-require-%E5%92%8C-exports>