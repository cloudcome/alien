/*!
 * drag.js
 * @author ydr.me
 * @create 2014-10-08 16:43
 */


define(function (require, exports, module) {
    /**
     * 扩展拖拽事件支持
     *
     * @module core/event/drag
     * @requires core/event/touch
     * @requires core/dom/attribute
     * @requires core/dom/modification
     * @requires core/dom/animation
     * @requires core/dom/selector
     *
     * @example
     * // draggablefor="#被拖动的 id"
     * // dom结构
     * // &lt;div id="abc"&gt;
     * //     &lt;!-- 这里的 draggablefor 属性指向的是拖拽影响的元素，为空表示拖拽自身 --&gt;
     * //     &lt;div draggablefor="abc" &gt;&lt;/div&gt;
     * // &lt;/div&gt;
     * // 可以在事件监听里取消默认行为，即 eve.preventDefault();
     * event.on(ele, 'dragstart', fn);
     * event.on(ele, 'drag', fn);
     * event.on(ele, 'dragend', fn);
     */
    'use strict';

    var dato = require('../../utils/dato.js');
    var event = require('./touch.js');
    var attribute = require('../dom/attribute.js');
    var modification = require('../dom/modification.js');
    var animation = require('../dom/animation.js');
    var selector = require('../dom/selector.js');
    var dragstartEvent = 'mousedown taphold';
    var dragEvent = 'mousemove touchmove MSPointerMove pointermove';
    var dragendEvent = 'mouseup touchend MSPointerUp pointerup touchcancel MSPointerCancel pointercancel';
    var x0 = null;
    var y0 = null;
    var x1 = null;
    var y1 = null;
    // 0 = 未开始拖动
    // 1 = 开始拖动
    // 2 = 拖动中
    var state = 0;
    // 触发元素
    var ele;
    // 克隆拖拽元素
    var clone;
    // 拖拽影响元素
    var dragfor;
    var left;
    var top;
    var className = 'alien-core-event-drag';
    var style =
        '.' + className + '{-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;' +
        'opacity:.5;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;' +
        'position:absolute;background:#eee;border:1px dotted #000}';
    var preventDefault = false;

    modification.importStyle(style);

    event.on(document, dragstartEvent, function (eve) {
        var _eve = eve.type === 'mousedown' && eve.button === 0 ? eve : (
            eve.touches && eve.touches.length ? eve.touches[0] : null
        );
        var _dragfor;
        var attr;

        ele = _getDragable(eve.target);

        if (ele) {
            attr = attribute.attr(ele, 'draggablefor');
            _dragfor = selector.query(attr ? '#' + attribute.attr(ele, 'draggablefor') : ele);
            x0 = _eve ? _eve.clientX : null;
            y0 = _eve ? _eve.clientY : null;

            if (x0 !== null && y0 !== null && state === 0 &&
                ele !== document.body && _dragfor.length && _dragfor[0].contains(ele)) {
                state = 1;
                dragfor = _dragfor[0];
                left = attribute.left(ele);
                top = attribute.top(ele);
                eve.preventDefault();
            }
        }
    });

    event.on(document, dragEvent, function (eve) {
        var _eve = eve.type === 'mousemove' && eve.button === 0 ? eve : (
            eve.touches && eve.touches.length ? eve.touches[0] : null
        );

        x1 = _eve ? _eve.clientX : null;
        y1 = _eve ? _eve.clientY : null;

        var dispatchDragstart;
        var dispatchDrag;

        // 发生了变化
        if (
            state === 1 &&
            x0 !== null &&
            y0 !== null &&
            x1 !== null &&
            y1 !== null &&
            (x0 !== x1 || y0 !== y1)
        ) {
            state = 2;
            dispatchDragstart = event.dispatch(ele, 'dragstart', _eve);

            // 已经取消了默认事件
            if (dispatchDragstart.defaultPrevented === true) {
                preventDefault = true;
            } else {
                preventDefault = false;
                clone = modification.create('div', {
                    style: {
                        width: attribute.outerWidth(dragfor) - 2,
                        height: attribute.outerHeight(dragfor) - 2,
                        left: attribute.left(dragfor),
                        top: attribute.top(dragfor),
                        zIndex: Math.pow(2, 53)
                    },
                    'class': className
                });
                modification.insert(clone, document.body, 'beforeend');
            }
        }

        if (state === 2) {
            /**
             * 拖拽
             * @event drag
             * @param event {Object} 事件对象
             */
            dispatchDrag = event.dispatch(ele, 'drag', _eve, {
                deltaX: x1 - x0,
                deltaY: y1 - y0
            });

            if (dispatchDrag.defaultPrevented !== true) {
                attribute.left(clone, left + x1 - x0);
                attribute.top(clone, top + y1 - y0);
            }

            eve.preventDefault();
        }
    });

    event.on(document, dragendEvent, function (eve) {
        var _eve = eve.type === 'mouseup' && eve.button === 0 ?
            eve :
            (eve.touches && eve.touches.length ?
                eve.touches[0] :
                (eve.changedTouches && eve.changedTouches.length ? eve.changedTouches[0] : null)
            );
        // 先记录初始值，最后还原，再动画
        var from;
        var to;
        var dispatchDragend;

        if (state === 2) {
            dispatchDragend = event.dispatch(ele, 'dragend', _eve, {
                deltaX: x1 - x0,
                deltaY: y1 - y0
            });

            if (!preventDefault && dispatchDragend.defaultPrevented !== true) {
                from = attribute.css(dragfor, ['visibility', 'left', 'top', 'margin-left', 'margin-top']);

                attribute.css(dragfor, 'visibility', 'hidden');
                attribute.left(dragfor, attribute.left(clone));
                attribute.top(dragfor, attribute.top(clone));
                to = {
                    left: attribute.css(dragfor, 'left'),
                    top: attribute.css(dragfor, 'top'),
                    marginLeft: attribute.css(dragfor, 'margin-left'),
                    marginTop: attribute.css(dragfor, 'margin-top')
                };

                attribute.css(dragfor, from);
                animation.transition(dragfor, to, {
                    duration: 300
                });
            }

            modification.remove(clone);
            clone = null;
        }

        state = 0;
        x0 = null;
        y0 = null;
    });


    module.exports = event;


    /**
     * 获取当前作用元素最近的可拖拽元素
     * @param ele
     * @returns {*}
     * @private
     */
    function _getDragable(ele) {
        if (!ele || ele.nodeType !== 1 || ele === document.body || ele === document.documentElement) {
            return null;
        }

        while (ele) {
            if (attribute.attr(ele, 'draggablefor') !== null) {
                return ele;
            }

            ele = selector.parent(ele)[0];

            if (ele === document.body) {
                return null;
            }
        }

        return null;
    }
});