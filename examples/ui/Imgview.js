/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-01-04 21:45
 */


define(function (require, exports, module) {
    'use strict';

    var Imgview = require('/src/ui/Imgview/');
    var imgview = new Imgview();
    var list = [];

    list.push('http://img.tuku.com/upload/attach/2013/06/94949-7IUzBD6.jpg?v=' + Date.now());
    list.push('http://www.sinaimg.cn/dy/slidenews/4_img/2015_11/704_1575962_849639.jpg?v=' + Date.now());
    list.push('http://www.tu123.cn/uploads/allimg/1303/25/13641H631I020-3NT4.jpg?v=' + Date.now());
    list.push('http://www.sinaimg.cn/dy/slidenews/4_img/2015_11/704_1575963_139320.jpg?v=' + Date.now());
    list.push('http://i2.download.fd.pchome.net/g1/M00/04/1A/oYYBAFHVYW-IOiEFAAH8r0Xc_8cAAAuvQC6QkQAAfzH550.jpg?v=' + Date.now());
    list.push('http://i3.img.969g.com/mtf/imgx2013/12/19/234_150213_e3f92.jpg?v=' + Date.now());
    list.push('http://img2.myhsw.cn/2015-03-31/30dpd7ad.jpg?v=' + Date.now());
    list.push('http://img5.iqilu.com/c/u/2015/0415/1429089768141.jpg?v=' + Date.now());
    list.push('http://www.zj.xinhuanet.com/newscenter/science/10190723202042083047_11n.jpg?v=' + Date.now());
    list.push('http://image6.tuku.cn/wallpaper/Chinese%20Girls%20Wallpapers/9620_2560x1600.jpg?v=' + Date.now());
    list.push('http://www.gywb.cn/xinwen/attachement/jpg/site2/20140407/7970333169067341747.jpg?v=' + Date.now());
    list.push('http://new-img1.ol-img.com/75/215/licIet5Anht2.png?v=' + Date.now());
    list.push('http://www.yuanfentk.com/uploads/allimg/140901/1-140Z1223S5.jpg?v=' + Date.now());
    list.push('http://i7.download.fd.pchome.net/t_320x520/g1/M00/0D/18/ooYBAFS8svmISVrKAAHKfe4IzHQAACPGwPm364AAcqV884.jpg?v=' + Date.now());
    list.push('http://y3.ifengimg.com/4cc826a0576e8c20/2015/0508/rdn_554c5b48c5a45.jpg?v=' + Date.now());
    list.push('http://www.jiepai.net/wp-content/uploads/2014/04/hemanting_20140426_01.jpg?v=' + Date.now());

    document.getElementById('btn').onclick = function () {
        imgview.open(list);
    };
});