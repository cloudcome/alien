var player = (function () {
    var x = 0, y = 0, lastX = 0, lastY = 0, status = true;
    var model = R.createImage('me.png'), model2 = R.createImage('me_2.png');
    var width = ctx_width / 480 * model.width;
    var height = width / model.width * model.height;

    function move(x, y) {
        lastX = x;
        lastY = y;
        x = x - width / 2;
        y = y - height / 2;
        x = x > ctx_width - width ? ctx_width - width : x;
        x = x < 0 ? 0 : x;
        y = y > ctx_height - height ? ctx_height - height : y;
        y = y < 0 ? 0 : y;
    }

    return {
        useBomb: { },
        move: move
    };

})();