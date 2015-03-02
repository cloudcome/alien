/*!
 * easing.js
 * @author ydr.me
 * @create 2014-10-06 18:06
 */


define(function (require, exports, module) {
    /**
     * @module utils/easing
     * @link https://github.com/chenmnkken/easyjs/blob/master/core/src/anim.js#L20
     */
    'use strict';
    var pow = Math.pow;
    var PI = Math.PI;
    var BACK_CONST = 1.70158;

    module.exports = {
        // css3 easing
        css3: {
            'in': 'ease-in',
            'out': 'ease-out',
            'in-out': 'ease-in-out',
            'snap': 'cubic-bezier(0,1,.5,1)',
            'linear': 'cubic-bezier(.25,.25,.75,.75)',
            'ease-in-quad': 'cubic-bezier(.55,.085,.68,.53)',
            'ease-in-cubic': 'cubic-bezier(.55,.055,.675,.19)',
            'ease-in-quart': 'cubic-bezier(.895,.03,.685,.22)',
            'ease-in-quint': 'cubic-bezier(.755,.05,.855,.06)',
            'ease-in-sine': 'cubic-bezier(.470,0,.745,.715)',
            'ease-in-expo': 'cubic-bezier(.950,.05,.795,.035)',
            'ease-in-circ': 'cubic-bezier(.6,.04,.98,.335)',
            'ease-in-back': 'cubic-bezier(.6,-.28,.735,.045)',
            'ease-out-quad': 'cubic-bezier(.25,.46,.45,.94)',
            'ease-out-cubic': 'cubic-bezier(.215,.61,.355,1)',
            'ease-out-quart': 'cubic-bezier(.165,.84,.44,1)',
            'ease-out-quint': 'cubic-bezier(.23, 1,.32,1)',
            'ease-out-sine': 'cubic-bezier(.39,.575,.565,1)',
            'ease-out-expo': 'cubic-bezier(.19,1,.22,1)',
            'ease-out-circ': 'cubic-bezier(.075,.82,.165,1)',
            'ease-out-back': 'cubic-bezier(.175,.885,.32,1.275)',
            'ease-in-out-quart': 'cubic-bezier(.770,0,.175,1)',
            'ease-in-out-quint': 'cubic-bezier(.860,0,.07,1)',
            'ease-in-out-sine': 'cubic-bezier(.445,.05,.55,.95)',
            'ease-in-out-expo': 'cubic-bezier(1,0,0,1)',
            'ease-in-out-circ': 'cubic-bezier(.785,.135,.15,.86)',
            'ease-in-out-back': 'cubic-bezier(.68,-.55,.265,1.55)'
        },
        // 只需要传递一个参数即可
        // t 为时间比 => 已耗时 / 总时间
        // 值 = 开始值 + ( 结束值 - 开始值 ) * 时间比;
        js: {
            // 匀速运动
            linear: function (t) {
                return t;
            },

            easeIn: function (t) {
                return t * t;
            },

            easeOut: function (t) {
                return ( 2 - t) * t;
            },

            easeBoth: function (t) {
                return (t *= 2) < 1 ?
                .5 * t * t :
                .5 * (1 - (--t) * (t - 2));
            },

            easeInStrong: function (t) {
                return t * t * t * t;
            },

            easeOutStrong: function (t) {
                return 1 - (--t) * t * t * t;
            },

            easeBothStrong: function (t) {
                return (t *= 2) < 1 ?
                .5 * t * t * t * t :
                .5 * (2 - (t -= 2) * t * t * t);
            },

            easeOutQuart: function (t) {
                return -(pow((t - 1), 4) - 1)
            },

            easeInOutExpo: function (t) {
                if (t === 0) return 0;
                if (t === 1) return 1;
                if ((t /= 0.5) < 1) return 0.5 * pow(2, 10 * (t - 1));
                return 0.5 * (-pow(2, -10 * --t) + 2);
            },

            easeOutExpo: function (t) {
                return (t === 1) ? 1 : -pow(2, -10 * t) + 1;
            },

            swing: function (t) {
                return 0.5 - Math.cos(t * PI) / 2;
            },

            swingFrom: function (t) {
                return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
            },

            swingTo: function (t) {
                return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
            },

            backIn: function (t) {
                if (t === 1) t -= .001;
                return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
            },

            backOut: function (t) {
                return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
            },

            bounce: function (t) {
                var s = 7.5625, r;

                if (t < (1 / 2.75)) {
                    r = s * t * t;
                }
                else if (t < (2 / 2.75)) {
                    r = s * (t -= (1.5 / 2.75)) * t + .75;
                }
                else if (t < (2.5 / 2.75)) {
                    r = s * (t -= (2.25 / 2.75)) * t + .9375;
                }
                else {
                    r = s * (t -= (2.625 / 2.75)) * t + .984375;
                }

                return r;
            },

            // windows8开始面板的滑动切换效果
            doubleSqrt: function (t) {
                return Math.sqrt(Math.sqrt(t));
            }
        }
    }
    ;
});


function anonymous(alienTemplateData_1423132028795/**/) {
    try {
        var thead = alienTemplateData_1423132028795["thead"];
        var tbody = alienTemplateData_1423132028795["tbody"];
        var alien_libs_template_GYE6vAAhe5EQatYyU3FN = "";
        alien_libs_template_GYE6vAAhe5EQatYyU3FN += "<table class=\"alien-ui-datepicker-list\"> <thead> <tr> ";
        this.each(thead, function (alien_libs_template_JDkSIEqmrNFJ55zVv4GI, alien_libs_template_iQGFJsUiqv8HPSCN1XEr) {
            var alien_libs_template_JoUA1PO3lh9USssrrp3f = alien_libs_template_JDkSIEqmrNFJ55zVv4GI;
            var th = alien_libs_template_iQGFJsUiqv8HPSCN1XEr;
            alien_libs_template_GYE6vAAhe5EQatYyU3FN += " <th>";
            alien_libs_template_GYE6vAAhe5EQatYyU3FN += this.escape(th) + "</th> ";
        }, this);
        alien_libs_template_GYE6vAAhe5EQatYyU3FN += " </tr> </thead> <tbody> ";
        this.each(tbody, function (alien_libs_template_9yIUiLZ8OMMLpDQcKHYW, alien_libs_template_ULstP1jS2Ne97N31VAFb) {
            var index = alien_libs_template_9yIUiLZ8OMMLpDQcKHYW;
            var tr = alien_libs_template_ULstP1jS2Ne97N31VAFb;
            alien_libs_template_GYE6vAAhe5EQatYyU3FN += " <tr> ";
            this.each(tr[index], function (alien_libs_template_ZpeM5Y1ZId6eClxUfBkj, alien_libs_template_qz88hd9330CBdrAMgtiD) {
                var alien_libs_template_AwymWFhy5qoriGF5zzUz = alien_libs_template_ZpeM5Y1ZId6eClxUfBkj;
                var td = alien_libs_template_qz88hd9330CBdrAMgtiD;
                alien_libs_template_GYE6vAAhe5EQatYyU3FN += " <td data-id=\"";
                alien_libs_template_GYE6vAAhe5EQatYyU3FN += this.escape(td.id) + "\" data-year=\"";
                alien_libs_template_GYE6vAAhe5EQatYyU3FN += this.escape(td.year) + "\" data-month=\"";
                alien_libs_template_GYE6vAAhe5EQatYyU3FN += this.escape(td.month) + "\" data-date=\"";
                alien_libs_template_GYE6vAAhe5EQatYyU3FN += this.escape(td.date) + "\" class=\"alien-ui-datepicker-";
                alien_libs_template_GYE6vAAhe5EQatYyU3FN += this.escape(td.type) + " ";
                alien_libs_template_GYE6vAAhe5EQatYyU3FN += this.escape(td.active ? 'alien-ui-datepicker-active' : '') + "\">";
                alien_libs_template_GYE6vAAhe5EQatYyU3FN += this.escape(td.date) + "</td> ";
            }, this);
            alien_libs_template_GYE6vAAhe5EQatYyU3FN += " </tr> ";
        }, this);
        alien_libs_template_GYE6vAAhe5EQatYyU3FN += " </tbody> </table>";
        return alien_libs_template_GYE6vAAhe5EQatYyU3FN
    } catch (err) {
        return err.message;
    }
}
