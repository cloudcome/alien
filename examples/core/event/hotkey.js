/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-04-16 15:17
 */


define(function (require, exports, module) {
    /**
     * @module parent/hotkey.js
     */
    'use strict';

    var keys = [
        // c
        "esc", "tab", "space", "return", "backspace", "scroll", "capslock", "numlock", "insert", "home", "del", "end", "pageup", "pagedown",
        "left", "up", "right", "down",
        // f
        "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12",
        // number
        "1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
        // single
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
        // ctrl + *
        "ctrl+a", "ctrl+b", "ctrl+c", "ctrl+d", "ctrl+e", "ctrl+f", "ctrl+g", "ctrl+h", "ctrl+i", "ctrl+j", "ctrl+k", "ctrl+l", "ctrl+m",
        "ctrl+n", "ctrl+o", "ctrl+p", "ctrl+q", "ctrl+r", "ctrl+s", "ctrl+t", "ctrl+u", "ctrl+v", "ctrl+w", "ctrl+x", "ctrl+y", "ctrl+z",
        // cmd + *
        "cmd+a", "cmd+b", "cmd+c", "cmd+d", "cmd+e", "cmd+f", "cmd+g", "cmd+h", "cmd+i", "cmd+j", "cmd+k", "cmd+l", "cmd+m",
        "cmd+n", "cmd+o", "cmd+p", "cmd+q", "cmd+r", "cmd+s", "cmd+t", "cmd+u", "cmd+v", "cmd+w", "cmd+x", "cmd+y", "cmd+z",
        // shift + *
        "shift+a", "shift+b", "shift+c", "shift+d", "shift+e", "shift+f", "shift+g", "shift+h", "shift+i", "shift+j", "shift+k", "shift+l",
        "shift+m", "shift+n", "shift+o", "shift+p", "shift+q", "shift+r", "shift+s", "shift+t", "shift+u", "shift+v", "shift+w", "shift+x",
        "shift+y", "shift+z",
        // alt + *
        "alt+a", "alt+b", "alt+c", "alt+d", "alt+e", "alt+f", "alt+g", "alt+h", "alt+i", "alt+j", "alt+k", "alt+l",
        "alt+m", "alt+n", "alt+o", "alt+p", "alt+q", "alt+r", "alt+s", "alt+t", "alt+u", "alt+v", "alt+w", "alt+x", "alt+y", "alt+z",
        // ctrl + c
        "ctrl+esc", "ctrl+tab", "ctrl+space", "ctrl+return", "ctrl+backspace", "ctrl+scroll", "ctrl+capslock", "ctrl+numlock",
        "ctrl+insert", "ctrl+home", "ctrl+del", "ctrl+end", "ctrl+pageup", "ctrl+pagedown", "ctrl+left", "ctrl+up", "ctrl+right",
        "ctrl+down",
        // cmd + c
        "cmd+esc", "cmd+tab", "cmd+space", "cmd+return", "cmd+backspace", "cmd+scroll", "cmd+capslock", "cmd+numlock",
        "cmd+insert", "cmd+home", "cmd+del", "cmd+end", "cmd+pageup", "cmd+pagedown", "cmd+left", "cmd+up", "cmd+right",
        "cmd+down",
        // ctrl + f
        "ctrl+f1", "ctrl+f2", "ctrl+f3", "ctrl+f4", "ctrl+f5", "ctrl+f6", "ctrl+f7", "ctrl+f8", "ctrl+f9", "ctrl+f10", "ctrl+f11", "ctrl+f12",
        // cmd + f
        "cmd+f1", "cmd+f2", "cmd+f3", "cmd+f4", "cmd+f5", "cmd+f6", "cmd+f7", "cmd+f8", "cmd+f9", "cmd+f10", "cmd+f11", "cmd+f12",
        // shift + c
        "shift+esc", "shift+tab", "shift+space", "shift+return", "shift+backspace", "shift+scroll", "shift+capslock", "shift+numlock",
        "shift+insert", "shift+home", "shift+del", "shift+end", "shift+pageup", "shift+pagedown", "shift+left", "shift+up",
        "shift+right", "shift+down",
        // shift + f
        "shift+f1", "shift+f2", "shift+f3", "shift+f4", "shift+f5", "shift+f6", "shift+f7", "shift+f8", "shift+f9", "shift+f10", "shift+f11", "shift+f12",
        // alt + c
        "alt+esc", "alt+tab", "alt+space", "alt+return", "alt+backspace", "alt+scroll", "alt+capslock", "alt+numlock",
        "alt+insert", "alt+home", "alt+del", "alt+end", "alt+pageup", "alt+pagedown", "alt+left", "alt+up", "alt+right", "alt+down",
        // alt + f
        "alt+f1", "alt+f2", "alt+f3", "alt+f4", "alt+f5", "alt+f6", "alt+f7", "alt+f8", "alt+f9", "alt+f10", "alt+f11", "alt+f12"
    ];

    // the fetching...
    //$.each(elements, function(i, e) { // i is element index. e is element as text.
    //    var newElement = ( /[\+]+/.test(elements[i]) ) ? elements[i].replace("+","_") : elements[i];
    //
    //    // Binding keys
    //    $(document).bind('keydown', elements[i], function assets() {
    //        $('#_'+ newElement).addClass("dirty");
    //        return false;
    //    });
    //});


    var event = require('/src/core/event/hotkey.js');
    var attribute = require('/src/core/dom/attribute.js');
    var selector = require('/src/core/dom/selector.js');

    keys.forEach(function (key) {
        event.on(document, key, function (eve) {
            var $target = selector.query('#_' + key.replace(/\+/g, '_'))[0];

            if ($target) {
                attribute.addClass($target, 'dirty');
            }

            return false;
        });
    });

    event.on(document, 'cmd+s ctrl+s', function () {
        alert('save');

        return false;
    });
});