/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-22 14:41
 */


'use strict';

var seatransform = require('seatransform');
var fse = require('fs-extra');
var glob = require('glob');
var path = require('ydr-utils').path;

var file = process.argv[2];

glob(path.join(file, '*.js'), function (index, files) {
    files.forEach(function (file) {
        var code1 = fse.readFileSync(file, 'utf8');
        var code2 = seatransform.transform(code1);
        console.log(code2);
    });
});


