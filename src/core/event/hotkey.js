/*!
 * hotkey
 * @author ydr.me
 * @create 2015-04-16 15:13
 */


define(function (require, exports, module) {
    /**
     * @module core/event/hotkey
     * @requires core/event/base
     * @requires utils/dato
     */
    'use strict';

    var specialKeys = {
        8: "backspace",
        9: "tab",
        10: "return",
        13: "return",
        16: "shift",
        17: "ctrl",
        18: "alt",
        19: "pause",
        20: "capslock",
        27: "esc",
        32: "space",
        33: "pageup",
        34: "pagedown",
        35: "end",
        36: "home",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        45: "insert",
        46: "del",
        59: ";",
        61: "=",
        91: "cmd",
        96: "0",
        97: "1",
        98: "2",
        99: "3",
        100: "4",
        101: "5",
        102: "6",
        103: "7",
        104: "8",
        105: "9",
        106: "*",
        107: "+",
        109: "-",
        110: ".",
        111: "/",
        112: "f1",
        113: "f2",
        114: "f3",
        115: "f4",
        116: "f5",
        117: "f6",
        118: "f7",
        119: "f8",
        120: "f9",
        121: "f10",
        122: "f11",
        123: "f12",
        144: "numlock",
        145: "scroll",
        173: "-",
        186: ";",
        187: "=",
        188: ",",
        189: "-",
        190: ".",
        191: "/",
        192: "`",
        219: "[",
        220: "\\",
        221: "]",
        222: "'"
    };
    var shiftNums = {
        "`": "~",
        "1": "!",
        "2": "@",
        "3": "#",
        "4": "$",
        "5": "%",
        "6": "^",
        "7": "&",
        "8": "*",
        "9": "(",
        "0": ")",
        "-": "_",
        "=": "+",
        ";": ": ",
        "'": "\"",
        ",": "<",
        ".": ">",
        "/": "?",
        "\\": "|"
    };
    var secondaryKeys = ['ctrl', 'alt', 'meta', 'shift'];
    var secondaryAlias = ['ctrl', 'alt', 'cmd', 'shift'];
    var event = require('./base.js');
    var dato = require('../../utils/dato.js');

    event.on(document, 'keydown', function (eve) {
        var which = eve.which;
        var specialKey = specialKeys[which];
        var character = specialKey ? specialKey : String.fromCharCode(which).toLowerCase();
        var eventType = '';

        //console.log(which);
        //console.log(specialKey);
        //console.log(character);

        if (secondaryAlias.indexOf(character) > -1) {
            return;
        }

        dato.each(secondaryKeys, function (index, secondaryKey) {
            if (eve[secondaryKey + 'Key'] && specialKey !== secondaryKey) {
                eventType += secondaryAlias[index] + '+';
            }
        });

        var ret = event.dispatch(eve.target, eventType + character, eve);

        // 已经冒泡了
        //if(ret.bubbles){
        //
        //}

        // 已经阻止默认事件
        if (ret && ret.defaultPrevented === true) {
            eve.preventDefault();
        }
    }, false);

    module.exports = event;
});