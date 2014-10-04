/*!
 * style.js
 * @author ydr.me
 * @create 2014-10-04 02:46
 */


define(function (require) {
    /**
     * @module ui/dialog/style
     * @requires core/dom/modification
     */
    'use strict';

    var style = function () {
        /***
         .alien-ui-dialog-overflow{
            overflow: hidden;
         }

         .alien-ui-dialog-bg{
             display: none;
             position: fixed;
             top: 0;
             right: 0;
             bottom: 0;
             left: 0;
             background: rgba(255,255,255,.3);
             overflow: auto;
             -webkit-overflow-scrolling: touch;
         }

         .alien-ui-dialog{
             position: absolute;
             width: 500px;
             background: #fff;
         }

         .alien-ui-dialog-container{
            box-shadow: 0 0 20px #A0A0A0;
            height: 100%;
            overflow: hidden;
         }

         .alien-ui-dialog-header{
            position: relative;
            font-weight: normal;
            overflow: hidden;
            background: -moz-linear-gradient(0deg, #FFFFFF 0, #EEEEEE 100%);
            background: -webkit-gradient(linear, 0deg, color-stop(0, FFFFFF), color-stop(100%, EEEEEE));
            background: -webkit-linear-gradient(0deg, #FFFFFF 0, #EEEEEE 100%);
            background: -o-linear-gradient(0deg, #FFFFFF 0, #EEEEEE 100%);
            background: -ms-linear-gradient(0deg, #FFFFFF 0, #EEEEEE 100%);
            background: linear-gradient(0deg, #FFFFFF 0, #EEEEEE 100%);
         }

         .alien-ui-dialog-title{
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding: 10px;
            font-size: 12px;
            text-align: center;
            line-height: 12px;
            cursor: move;
            color: #444;
         }

         .alien-ui-dialog-close{
            position: absolute;
            top: 0;
            right: 0;
            color: #ccc;
            width: 32px;
            height: 32px;
            text-align: center;
            cursor: pointer;
            font: normal normal normal 30px/32px Arial;
         }

         .alien-ui-dialog-close:hover{
            color: #888;
         }

         .alien-ui-dialog-body{
            position: relative;
            padding: 20px;
            overflow: auto;
         }

         .alien-ui-dialog-iframe{
            display: block;
            border: 0;
            margin: 0;
            padding: 0;
            width: 100%;
            height: 400px;
         }
         */
    };
    var modification = require('../../core/dom/modification.js');

    modification.style(style.toString().match(/\/\*{3}([\s\S]*)\*\//)[1]);
});