define(function (require) {
    'use strict';

    var event = require('/src/core/event/base.js');
    var demo = document.getElementById('demo');
    var demo2 = document.getElementById('demo2');
    var ret1 = document.getElementById('ret1');
    var ret2 = document.getElementById('ret2');
    var ret3 = document.getElementById('ret3');
    var ret4 = document.getElementById('ret4');

    require('/src/core/event/touch.js');

    //event.on(demo, 'tap', function (eve) {
    //    ret1.innerHTML = 'demo tap ' + Date.now();
    //    demo.style.display = 'none';
    //    //eve.stopPropagation();
    //});

    var time1 = 0;
    event.on(demo, 'touchstart', function (eve) {
        ret1.innerHTML = 'demo touchstart ' + Date.now();
        time1 = Date.now();
        console.log(eve);
    });

    event.on(demo, 'click', function (eve) {
        ret2.innerHTML = 'demo click ' + (Date.now() - time1);
        console.log(eve);
    });

    event.on(demo2, 'click', function (eve) {
        ret3.innerHTML = 'demo2 click ' + Date.now();
    });

    //event.on(demo2, 'tap', function (eve) {
    //    ret1.innerHTML += ' tap demo2';
    //    console.log(eve);
    //});
    //
    //event.on(demo, 'swipe', function (eve) {
    //    ret1.innerHTML += ' swipe it';
    //    console.log(eve);
    //});
    //
    //event.on(demo, 'swipeup', function () {
    //    ret2.innerHTML += ' swipeup it';
    //});
    //
    //event.on(demo, 'swiperight', function () {
    //    ret2.innerHTML += ' swiperight it';
    //});
    //
    //event.on(demo, 'swipedown', function () {
    //    ret2.innerHTML = ' swipedown it';
    //});
    //
    //event.on(demo, 'swipeleft', function () {
    //    ret2.innerHTML = ' swipeleft it';
    //});
    //
    //event.on(demo, 'taphold', function () {
    //    ret1.innerHTML += ' taphold demo';
    //});
    //
    //event.on(demo2, 'taphold', function () {
    //    ret1.innerHTML += ' taphold demo2';
    //});
    //
    //event.on(demo, 'touch1start', function (eve) {
    //    ret3.innerHTML += ' touch1start demo';
    //    console.log(eve);
    //});
    //
    //event.on(demo, 'touch1move', function (eve) {
    //    ret3.innerHTML += ' touch1move demo';
    //    console.log(eve);
    //});
    //
    //event.on(demo, 'touhangeh1end', function (eve) {
    //    ret3.innerHTML += ' touch1end demo';
    //    demo.innerHTML = 'changedDirection: ' + eve.alienDetail.changedDirection;
    //    console.log(eve);
    //});
    //
    //event.on(demo2, 'touch1start', function (eve) {
    //    ret3.innerHTML += ' touch1start demo2';
    //    console.log(eve);
    //});
    //
    //event.on(demo2, 'touch1move', function (eve) {
    //    ret3.innerHTML += ' touch1move demo2';
    //    console.log(eve);
    //});
    //
    //event.on(demo2, 'touch1end', function (eve) {
    //    ret3.innerHTML += ' touch1end demo2';
    //    demo2.innerHTML = 'changedDirection: ' + eve.alienDetail.changedDirection;
    //    console.log(eve);
    //});
});