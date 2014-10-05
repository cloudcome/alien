/*!
 * style.js
 * @author ydr.me
 * @create 2014-10-05 14:18
 */


define(function (require) {
    /**
     * @module ui/slider/style
     */
    'use strict';

    var modification = require('../../core/dom/modification.js');
    var style = function () {
        /***

         .alien-ui-slider-nav{
            position: absolute;
            right: 10px;
            bottom: 10px;
            overflow: hidden;
            background: rgba(0, 0, 0, 0.33);
            padding: 6px 12px;
            border-radius: 4px;
         }

         .alien-ui-slider-nav-item{
            display: inline-block;
            width: 10px;
            height: 10px;
            line-height: 10px;
            padding: 0;
            margin: 0 6px;
            text-align: center;
            background: #666;
            cursor: default;
         }

         .alien-ui-slider-nav-item-active{
            background: #fff;
         }

         .alien-ui-slider-nav-text .alien-ui-slider-nav-item{
            width: auto;
            height: 20px;
            line-height: 22px;
            font-size: 12px;
            font-weight: normal;
            color: #EEE;
            padding: 0 6px;
         }

         .alien-ui-slider-nav-text .alien-ui-slider-nav-item-active{
            color: #000;
         }

         .alien-ui-slider-nav-square .alien-ui-slider-nav-item{

         }

         .alien-ui-slider-nav-circle .alien-ui-slider-nav-item{
            border-radius: 100%;
         }

         .alien-ui-slider-nav-transparent{
            background: transparent;
         }

         .alien-ui-slider-nav-transparent .alien-ui-slider-nav-item{
            background: transparent;
            color: #999;
         }

         .alien-ui-slider-nav-transparent .alien-ui-slider-nav-item-active{
            color: #fff;
            font-weight: 900;
         }

          */
    };

    modification.style(style);
});