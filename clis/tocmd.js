/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-22 14:41
 */


'use strict';

var seatransform = require('seatransform');
var fse = require('fs-extra');
var path = require('ydr-utils').path;
var glob = require('glob');

var files = glob.sync(path.join(process.argv[2], '*'));

files.forEach(function (file) {
    var code1 = fse.readFileSync(file, 'utf8');
    var code2 = seatransform.transform(code1);
    var dirname = path.dirname(file);
    var basename = path.basename(file);
    var destFile = path.join(dirname, 'cmd-' + basename);
    console.log(destFile);
    fse.writeFileSync(destFile, code2, 'utf8');
});


