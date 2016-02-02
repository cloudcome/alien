/**
 * tinymce
 * @author ydr.me
 * @create 2016-02-01 15:58
 */


define(function (require, exports, module) {
    'use strict';

    var coolie = window.coolie;
    var tinymce = window.tinymce = require('./classes/EditorManager.js');
    require('./langs/zh_CN.js');
    require('./themes/default.js');
    var css = require('./skins/lightgray/style.css', 'css');

    css += '' +
        '.mce-throbber{' +
            /**/'background-image:url(' + require('./skins/lightgray/img/loader.gif', 'file') + ')' +
        '}' +
        '' +
        '@font-face{' +
            /**/'font-family: "tinymce";' +
            /**/'font-weight: normal;' +
            /**/'font-style: normal;' +
            /**/'src: url(' + require('./skins/lightgray/fonts/tinymce.eot', 'file') + ');' +
            /**/'src: url(' + require('./skins/lightgray/fonts/tinymce.eot', 'file') + '?#iefix) format("embedded-opentype"), ' +
            /**//**/'url(' + require('./skins/lightgray/fonts/tinymce.woff', 'file') + ') format("woff"), ' +
            /**//**/'url(' + require('./skins/lightgray/fonts/tinymce.ttf', 'file') + ') format("truetype"), ' +
            /**//**/'url(' + require('./skins/lightgray/fonts/tinymce.svg', 'file') + '#tinymce) format("svg");' +
        '}' +
        '' +
        '@font-face{' +
            /**/'font-family: "tinymce-small";' +
            /**/'font-weight: normal;' +
            /**/'font-style: normal;' +
            /**/'src: url(' + require('./skins/lightgray/fonts/tinymce-small.eot', 'file') + ');' +
            /**/'src: url(' + require('./skins/lightgray/fonts/tinymce-small.eot', 'file') + '?#iefix) format("embedded-opentype"), ' +
            /**//**/'url(' + require('./skins/lightgray/fonts/tinymce-small.woff', 'file') + ') format("woff"), ' +
            /**//**/'url(' + require('./skins/lightgray/fonts/tinymce-small.ttf', 'file') + ') format("truetype"), ' +
            /**//**/'url(' + require('./skins/lightgray/fonts/tinymce-small.svg', 'file') + '#tinymce) format("svg");' +
        '}';

    coolie.importStyle(css);
    module.exports = tinymce;
});