# ![Alien](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20140914113127363721429460.png)
一个为现代浏览器而生的脚本库集合，遵守AMDJS规范。


# 作者
* [cloudcome](http://github.com/cloudcome/)
* you


# 兼容
* ![ie10](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20140919111504913271952205.png) IE10+
* ![chrome](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20140919111534857215164833.png) chrome latest
* ![firefox](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20140919111545251609050667.png) firefox latest


# 内容
* util
	* data.js----------------------------------包含数据的遍历、判断
	* compatible.js----------------------------浏览器兼容支持
	* ua.js------------------------------------浏览器UA检测
	* date.js----------------------------------日期操作
	* support.js-------------------------------浏览器特征检测
	* promise.js-------------------------------promise
	* validator.js-----------------------------数据验证
	* filter.js--------------------------------数据过滤
	* canvas.js--------------------------------2D画布
	* svg.js-----------------------------------矢量作图
	* querystring.js---------------------------URL querystring
* core
	* dom
		* selector.js--------------------------dom选择器
		* attribute.js-------------------------dom属性操作
		* modification.js----------------------dom修改操作
	* event
		* emitter.js---------------------------事件机制
		* touch.js-----------------------------触摸支持
		* mousewheel.js------------------------鼠标滚轮支持
		* fullscreen.js------------------------全屏事件支持
		* drag.js------------------------------拖拽支持
		* drop.js------------------------------释放支持
	* communication
		* xhr.js-------------------------------XHR通信
		* upload.js----------------------------上传通信
		* socket.js----------------------------socket通信
		* crossdomain.js-----------------------跨域通信
	* url
		* hash.js------------------------------hash解析
		* query.js-----------------------------query解析
* ui
	* onepage
		* index.js-----------------------------单页系统
	* notification
		* index.js-----------------------------桌面通知
	* sortable
		* style.css----------------------------排序样式
		* index.js-----------------------------排序脚本
	* scrollbar
		* style.css----------------------------滚动条样式
		* index.js-----------------------------滚动条脚本
	* banner
		* style.css----------------------------焦点图样式
		* index.js-----------------------------焦点图脚本
	* progress
		* style.css----------------------------进度条样式
		* index.js-----------------------------进度条脚本
	* dialog
		* style.css----------------------------对话框样式
		* index.js-----------------------------对话框脚本
	* confirm
		* style.css----------------------------确认选择框样式
		* index.js-----------------------------确认选择框脚本
	* msg
		* style.css----------------------------消息框样式
		* index.js-----------------------------消息框脚本
	* tips
		* style.css----------------------------提示框样式
		* index.js-----------------------------提示框脚本
	* preview
		* style.css----------------------------图片预览框样式
		* index.js-----------------------------图片预览框脚本
	* imgclip
		* style.css----------------------------图片裁剪框样式
		* index.js-----------------------------图片裁剪框脚本
	* more


# 开发与生产
* 开发环境：使用seajs配合模块加载
* 生产环境：使用<https://www.npmjs.org/package/apb>配合模块构建


# 更多
* AMDJS规范：<https://github.com/amdjs/amdjs-api/wiki/AMD-(%E4%B8%AD%E6%96%87%E7%89%88)#%E4%BD%BF%E7%94%A8-require-%E5%92%8C-exports>