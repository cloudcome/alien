/**
 * ui 热键
 * @author ydr.me
 * @create 2016-01-05 21:31
 */


define(function (require, exports, module) {
    /**
     * @module ui/hotkey
     * @reuqires libs/emitter
     * @reuqires utils/class
     * @reuqires utils/dato
     * @reuqires utils/typeis
     * @reuqires core/event/base
     */

    'use strict';

    var dato = require('../../utils/dato.js');
    var typeis = require('../../utils/typeis.js');
    var event = require('../../core/event/base.js');
    var ui = require('../index.js');

    // ⌘（command）、⌥（option）、⇧（shift）、
    // ⇪（caps lock）、⌃（control）、↩（return）、
    // ⌅（enter）、⎋（esc）
    var specialKeys = {
        8: 'backspace',
        9: 'tab',
        10: ['return', 'enter'],
        13: ['return', 'enter'],
        16: 'shift',
        17: 'ctrl',
        18: 'alt',
        19: 'pause',
        20: 'capslock',
        27: 'esc',
        32: 'space',
        33: 'pageup',
        34: 'pagedown',
        35: 'end',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        45: 'insert',
        46: 'del',
        59: ';',
        61: '=',
        91: 'cmd',
        96: '0',
        97: '1',
        98: '2',
        99: '3',
        100: '4',
        101: '5',
        102: '6',
        103: '7',
        104: '8',
        105: '9',
        106: '*',
        107: '+',
        109: '-',
        110: '.',
        111: '/',
        112: 'f1',
        113: 'f2',
        114: 'f3',
        115: 'f4',
        116: 'f5',
        117: 'f6',
        118: 'f7',
        119: 'f8',
        120: 'f9',
        121: 'f10',
        122: 'f11',
        123: 'f12',
        144: 'numlock',
        145: 'scroll',
        173: '-',
        186: ';',
        187: '=',
        188: ',',
        189: '-',
        190: '.',
        191: '/',
        192: '`',
        219: '[',
        220: '\\',
        221: ']',
        222: '\''
    };
    var decorationKeyMap = {
        ctrl: 'ctrl',
        alt: 'alt',
        meta: 'cmd',
        shift: 'shift',
        capture: false
    };

    var defaults = {};
    var Hotkey = ui.create({
        constructor: function (ele, options) {
            var the = this;

            the._ele = ele;
            the._options = dato.extend({}, defaults, options);
            event.on(ele, 'keydown', the._onkeydown = function (eve) {
                var which = eve.which;
                var specialKey = specialKeys[which];
                var character = specialKey ? specialKey : String.fromCharCode(which).toLowerCase();
                var characters = typeis.Array(character) ? character : [character];
                var charactersMap = {};

                dato.each(characters, function (index, character) {
                    charactersMap[character] = 1;
                });

                dato.each(characters, function (index, character) {
                    var decoratedKeys = [];

                    dato.each(decorationKeyMap, function (decorationKey, aliasKey) {
                        if (eve[decorationKey + 'Key'] && !charactersMap[decorationKey] && !charactersMap[aliasKey]) {
                            decoratedKeys.push(aliasKey);
                        }
                    });

                    if (decoratedKeys.length) {
                        decoratedKeys.push('');
                    }

                    var eventType = decoratedKeys.join('+') + character;
                    var ret = the.emit(eventType, eve);

                    if (ret === false) {
                        try {
                            eve.preventDefault();
                            eve.stopPropagation();
                            eve.stopImmediatePropagation();
                        } catch (err) {
                            // ignore
                        }
                    }
                });
            }, the._options.capture);
        },

        /**
         * 销毁实例
         */
        destroy: function () {
            var the = this;

            event.un(the._ele, 'keydown', the._onkeydown, the._options.capture);
        }
    });

    Hotkey.defaults = defaults;
    module.exports = Hotkey;
    Hotkey.MAC_OS = /Mac OS/i.test(navigator.userAgent);
});