/**
 * 资源管理工具类 Resource
 * @type {Object}
 */
var R = (function (M) {

    var source = []; // 资源管理器

    // 创建图片
    M.createImage = function(src) {
        if (typeof source[src] !== 'undefined') {
            return source[src];
        }
        source[src] = new Image();
        source[src].src = src;
        return source[src];
    };

    // 图片预加载
    M.loadImage = function(images, callback) {
        var len = images.length;
        var loaded = 0;
        for (var i = len; i--; ) {
            var src = images[i];
            source[src] = new Image();
            source[src].onload = function() {
                loaded++;
                if (len == loaded) {
                    callback && callback();
                }
            };
            source[src].src = src;
        }
    };

    return M;
})({});
