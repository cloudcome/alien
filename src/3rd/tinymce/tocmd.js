/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-22 14:41
 */


'use strict';

var seatransform = require('seatransform');
var fse = require('fs-extra');
var path = require('ydr-utils').path;

var name1 = process.argv[2];
var root1 = path.join(__dirname, '../tinymce/');
var file1 = path.join(root1, process.argv[2]);
var file2 = path.join(__dirname, name1);

console.log('<', file1);
var code1 = fse.readFileSync(file1, 'utf8');
var code2 = code1;

if (/define\(/.test(code1)) {
    code2 = seatransform.transform(code1);
} else if (/\/plugins\/.test(file1)/) {
    code2 = 'define(function (require) {\n' +
        '\tvar tinymce = window.tinymce;\n' +
        '\tvar PluginManager = require("../../classes/AddOnManager").PluginManager;\n\n' +
        code1 +
        '});';
}

fse.outputFileSync(file2, code2, 'utf8');
console.log('>', file2);

