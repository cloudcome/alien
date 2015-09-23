/* jshint onevar: false, camelcase: false */
(function ($) {
    var source = {}; // 游戏资源map管理
    var stage = document.getElementById('stage'); // 游戏画布
    var ctx = stage.getContext('2d');
    var score = document.getElementById('score');
    var window_w = $(window).width(), window_h = $(window).height();
    var isSupportTouch =  !!('ontouchend' in document);
    var ctx_width, ctx_height;
    var config = {
        "loadImg" : [
            'http://p4.qhimg.com/t01f169fa7fdd166976.png', // bg.png
            'http://p9.qhimg.com/t01355afa98af5c865a.png' // guide.png
        ],  //等待动画图片资源
        "gameImg" : [
            'http://p8.qhimg.com/t0105cf5ddc2788b36d.png', // car.png
            'http://p6.qhimg.com/t01bc27fb7566f32662.png', // car_2.png
            'http://p6.qhimg.com/t01bf2f5503de2c09c0.png', // women1.png
            'http://p2.qhimg.com/t01d5a6f27dfd6f0a29.png', // women2.png
            'http://p9.qhimg.com/t0180d607c54cbc42bb.png', // score.png
            'http://p2.qhimg.com/t0112104234e3d91aa4.png' // heart.png
        ],  //游戏图片资源
        'wxDesc': '我开豪车追妹纸获奖啦！成功闯入方程式大赛！'
    };

    // 微信分享的数据
    var wxData = {
        'appId': '', // 服务号可以填写appId
        'imgUrl' : 'http://p2.qhimg.com/t017bbde5550e655af3.png',
        'link' : "http://hao.360.cn/",
        'desc' : '',
        'title' : ''
    };


    // 玩家类
    var player = (function () {
        var _player = {};

        _player.init = function() {
            _player.x;
            _player.y;
            _player.lastX;
            _player.lastY;
            _player.status = true;
            _player.model = R.createImage("http://p8.qhimg.com/t0105cf5ddc2788b36d.png");
            _player.model2 = R.createImage("http://p6.qhimg.com/t01bc27fb7566f32662.png");
            _player.width = ctx_width / 480 * _player.model.width;
            _player.height = _player.width / _player.model.width * _player.model.height;
        };


        function move(x, y) {
            _player.lastX = _player.x;
            _player.lastY = _player.y;
            _player.x = x - _player.width / 2;
            _player.y = y - _player.height / 2;
            _player.x = _player.x > ctx_width - _player.width ? ctx_width - _player.width : _player.x;
            _player.x = _player.x < 0 ? 0 : _player.x;
            _player.y = _player.y > ctx_height - _player.height ? ctx_height - _player.height : _player.y;
            _player.y = _player.y < 0 ? 0 : _player.y;
        }

        function moving(game_time) {
            if (!_player.status) {
                return;
            }
            ctx.drawImage(game.time % 20 > 15 ? _player.model : _player.model2, _player.x, _player.y, _player.width, _player.height);
        };

        _player.move = move;
        _player.moving = moving;

        return _player;

    })();

    // 敌军类
    var planeManager = (function () {

        var _plane = { };

        var planes = _plane.planes = [], planesNum = _plane.planesNum = 0;

        _plane.planes
        // create工厂
        function PlaneEntry(type) {
            this.type = type;
            this.height = 0;
            this.width = 0;
            this.maxSpeed = 0;
            this.status = true;

            // 不同的类型
            switch (type) {
                case 1: // 美女
                    this.score = 1;
                    this.maxSpeed = 15;
                    break;
                case 2: // 伪娘
                    this.score = 0;
                    this.maxSpeed = 25;
                    break;
            }

            var img = [
                'http://p6.qhimg.com/t01bf2f5503de2c09c0.png',
                'http://p2.qhimg.com/t01d5a6f27dfd6f0a29.png'
            ];

            this.modelImg = img[this.type - 1];
            this.model = R.createImage(this.modelImg);

            this.width = ctx_width / 480 * this.model.width;
            this.height = this.width / this.model.width * this.model.height;

            // 随机出现的位置
            this.x = Math.random() * (ctx_width - this.width);
            this.y = -this.height;

            // 速度控制
            var maxSpeed = game.time / 800 > 100 ? 100 : game.time / 800;
            this.speed = Math.random() * (maxSpeed - 1) + 12;
            this.speed = this.speed < .5 ? Math.random() * 0.5 + 0.5 : this.speed;
            this.speed = this.speed > this.maxSpeed ? this.maxSpeed : this.speed;

        }

        PlaneEntry.prototype.show = function() {
            ctx.drawImage(this.model, this.x, this.y, this.width, this.height);
        };

        // 美女或伪娘被碰撞

        PlaneEntry.prototype.die = function() {
            var type = this.type;
            game.score += this.score;
            this.status = false;

        };

        function createPlane(type) {
            return new PlaneEntry(type);
        }

        var addSomePlane = _plane.addSome = function() {
            // 出现的频率
            if (game.time % 30 != 0) {
                return;
            }

            if (planesNum == 36) { // 最多生成36个飞机
                planesNum = 0;
            }

            planesNum++;
            // 出现伪娘的概率 1： 美女 2：伪娘
            switch (true) {
                case planesNum % (Math.floor(Math.random() *3)) == 0:
                    _plane.planes.push(createPlane(2));
                    break;

                default:
                    _plane.planes.push(createPlane(1));
                    break;
            }
        };

        _plane.scrolling = function() {
            addSomePlane();
            var len = _plane.planes.length;
            for (var i = len; i--;) {
                var plane = _plane.planes[i];
                if (plane.y > ctx_height || plane.status == false) {
                    _plane.planes.splice(i, 1);
                    continue;
                }

                plane.show();

                if (isCollide(plane)) {
                    if (plane.type == '1') {
                        scoreEntry.showheart();
                    } else {
                        game.stop();
                    }
                    plane.die();
                }
                plane.y = plane.y + plane.speed;
            }

            //判断是否和美女或伪娘碰撞
            function isCollide(plain) {
                var plainTopLeft = [plain.x, plain.y];
                var plainBottomRight = [plain.x + plain.width, plain.y + plain.height];
                var meTopLeft = [player.x + player.width / 3, player.y];
                var meBottomRight = [player.x + (player.width * 2 / 3), player.y + (player.height * 2 / 3)];

                var collideTopLeft = [Math.max(plainTopLeft[0], meTopLeft[0]), Math.max(plainTopLeft[1], meTopLeft[1])];
                var collideBottomRight = [Math.min(plainBottomRight[0], meBottomRight[0]), Math.min(plainBottomRight[1], meBottomRight[1])];

                if (collideTopLeft[0] < collideBottomRight[0] && collideTopLeft[1] < collideBottomRight[1]) {
                    return true;
                }

                return false;
            }
        };

        return _plane;
    })();

    // 分数类
    var scoreEntry = (function () {
        var _score = { };

        _score.format = function (tbl) {
            return function (num, n) {
                n = n || 5;
                return (0 >= (n = n - num.toString().length)) ? num : (tbl[n] || (tbl[n] = Array(n + 1).join(0))) + num;
            };
        }([]);

        _score.showheart = function () {
            $('.heart').removeClass('hearthot').addClass('hearthot');
            setTimeout(function () {
                $('.heart').removeClass('hearthot');
            }, 200);
        };

        _score.show = function() {
            $('.score-wrap').show();
        };

        return _score;

    })();

    // 结果页
    var resultPanel = (function () {
        var $panel = $('#resultPanel'),

            initEvent = function () {
                var eventHandle = 'click';
                if (isSupportTouch) {
                    eventHandle = 'touchstart';
                }

                /* 重新开始 */
                $panel.find('.replay').on(eventHandle, function () {
                    game.init();
                    game.start();
                });

                /* 分享朋友圈 */
                $panel.find('.share').on(eventHandle, function () {
                    $panel.find('.weixin-share').show().one(eventHandle, function () {
                        $(this).hide();
                    });
                    wxData.desc = $(this).data('desc').replace(/\{x\}/ig, game.score) || '';
                });

                /* 打开礼盒 */
                $panel.find('.lottery').on(eventHandle, function () {
                    prize.open();
                });
            },

            _results = {
                show: function () {
                    $panel.show();
                    _results.showScore();
                },

                hide: function () {
                    $panel.hide();
                },

                showScore: function () {
                    var pid = 1,
                        score = game.score;

                    // 分数信息
                    if (score === 0) {
                        pid = 1;
                    } else if (score < 10) {
                        pid = 2;
                    } else {
                        pid = 3;
                    }

                    var panel = $panel.find('#scoreBoard').show().find('.score-' + pid);

                    prize.hide();

                    $panel.find('#scoreBoard .score-result').hide();
                    panel.show();

                    if (pid < 3) {
                        $panel.find('#scoreBoard .rank').show();
                    } else {
                        // 大礼包
                        $panel.find('#scoreBoard .rank').hide();
                        prize.preLoad();
                    }

                    panel.find('.tips span').html(score);
                },

                wxHide: function () {
                    $panel.find('.weixin-share').hide();
                }
            };

        initEvent();

        return _results;
    })();

    var prize = (function () {
        var prizeInfo = null,
            $prize = $('#prize'),

            _scrollInit,

            _prize = {
                preLoad: function () {
                    /* $.get('url', function (res) {
                        prizeInfo = res;
                    }); */
                    prizeInfo = {
                        type: parseInt(Math.random() * 1002, 10) % 5 + 1,
                        code: 'testcode-xxxxx'
                    };
                },
                open: function () {
                    var count = 100,
                        t = setInterval(function () {
                            if (prizeInfo || !count) {
                                count--;
                                clearInterval(t);
                                try {
                                    if (prizeInfo.type > 2 && prizeInfo.code) {
                                        _prize.showPrize(prizeInfo.type - 2, prizeInfo.code);
                                    } else {
                                        _prize.showDefault(prizeInfo.type);
                                    }
                                } catch (e) {
                                    _prize.showDefault(parseInt(Math.random() * 1002, 10) % 2 + 1);
                                }
                            }
                        }, 10);
                },

                hide: function () {
                    $prize.hide();
                },

                showDefault: function (type) {
                    var img = [
                            'http://p7.qhimg.com/t0119206eb84a47a0ea.png',
                            'http://p3.qhimg.com/t01ce25d6a523c61246.png'
                        ],
                        desc;

                    type = type % img.length;
                    $('#prizeResult').hide();
                    $prize.show()
                        .find('.prize-default').show()
                        .find('.random-prize').attr('src', img[type]);

                    desc = $prize.find('.prize-default .share').data('desc').split('|');
                    $prize.find('.prize-default .share').data('desc', desc[type % desc.length]);
                },
                showPrize: function (type, code) {
                    var img = [
                            'http://p8.qhimg.com/t0185a10d3a498658c4.png',
                            'http://p2.qhimg.com/t0192e25f7bcd18092f.png',
                            'http://p0.qhimg.com/t0176584326fa328dc6.png'
                        ],
                        textArr = ['方程式大奖赛门票', '赛道狂飙体验特权', '赛车激情体验资格'],
                        desc;

                    type = type % img.length;
                    $prize.show().find('.prize-default').hide();
                    $('#prizeResult').show()
                        .find('.prize-content')
                            .find('p span').html(textArr[type]).end()
                            .find('img').attr('src', img[type]).end()
                            .find('.yards span').html(code);

                    if (!_scrollInit) {
                        new IScroll('#prizeResult');
                        _scrollInit = true;
                    }

                }
            };

        return _prize;
    }());


    /**
     * 游戏主类
     */
    var game = new Best.Game({
        FPS: 60,
        score: 0,
        time: 0,
        bgImg: R.createImage('http://p4.qhimg.com/t01f169fa7fdd166976.png'),
        bgScrollTime: 0,

        initGraphicContext: function () {
            this.canvas = document.getElementById('stage');
            this.context = this.canvas.getContext('2d');
        },

        onInit: function () {
            player.init();
        },

        onStart: function () {
            this.scene = this.getScene(0);
            this.scene.init(this);
            this.scene.enter();
        },

        getScene: function (id) {
            var scene = ScenePool[id];
            return scene;
        },

        bgScroll: function () {
            var bg_img_height = this.bgImg.height;
            var bg_img_width = this.bgImg.width;
            this.bgScrollTime += (12 + (((this.time+(this.time*0.9))/1000) > 20 ? 20 : ((this.time+(this.time*0.9)))/1000));
            if (this.bgScrollTime > bg_img_height) {
                this.bgScrollTime = 0;
            }
            ctx.drawImage(this.bgImg, 0, this.bgScrollTime - bg_img_height, bg_img_width, bg_img_height);
            ctx.drawImage(this.bgImg, 0, this.bgScrollTime, bg_img_width, bg_img_height);
        },

        onStop: function () {
            $('#gameoverPanel').show();
            setTimeout(function () {
                resultPanel.show();
                $('#gameoverPanel').hide();
            }, 1000);
        }
    });


    /**
     * 场景管理 ScenePool
     */
    var ScenePool = { };

    (function () {

    var scene = new Best.Scene({
        id: 0,

        init: function (game) {
            this.game = game;
            $(stage).addClass('playing');
            scoreEntry.show();
            this.initEvent();
        },

        initEvent: function (){
            this.clear();
            // 汽车开始
            player.move($(stage).width()/2, $(stage).height());

            stage = $(stage);
            if (isSupportTouch) {
                var touchCar = function (e) {
                    e.preventDefault();
                    var touch = e.targetTouches[0];
                    var x = touch.pageX - stage.offset().left;
                    var y = touch.pageY - stage.offset().top;
                    player.move(x, y);
                }
                stage.get(0).removeEventListener('touchmove', touchCar);
                stage.get(0).addEventListener('touchmove', touchCar, false);
            } else {
                stage.off('mousemove').on('mousemove', function (e) {
                    var x = e.clientX - stage.offset().left;
                    var y = e.clientY - stage.offset().top;
                    player.move(x, y);
                });
            }
        },

        clear: function () {
            this.game.time = 0;
            this.game.score = 0;
            this.game.bgScrollTime = 0;
            player.status = true;
            planeManager.planes = [];
            planeManager.planesNum = 0;
            score.innerHTML = scoreEntry.format(this.game.score);
            resultPanel.hide();
        },

        enter: function () {


        },

        update: function () {
            this.game.time++;
            this.game.bgScroll(); // 背景滚动
            planeManager.scrolling();
            player.moving(this.game.time);
            score.innerHTML = scoreEntry.format(this.game.score);
        },

        handleInput: function () {
        },

        render: function () {

        }
    });

    ScenePool[scene.id] = scene;

    })();


    // loading事件
    function loading() {
        // 设置背景
        function drawBg() {
            var bg_img = R.createImage('http://p4.qhimg.com/t01f169fa7fdd166976.png');
            var bg_img_width = bg_img.width;
            var bg_img_height = bg_img.height;
            ctx.drawImage(bg_img, 0, 0, bg_img_width, bg_img_height);

        }
        function touchStart() {
            $("#guidePanel").hide();
            game.init();
            game.start();
        }

        // 开始动画
        drawBg();

        R.loadImage(config.gameImg, function () {
            $('#gamePanel').on('touchstart', function () {
                touchStart();
                touchStart = function () {};
            });
        });
    }


    // 游戏总入口
    function main() {
        R.loadImage(config.loadImg, loading);

        resize();
        var content = $(stage).parent();
        $(window).on("resize", resize);

        function resize() {
            var screenWidth = $(window).width();
            var screenHeight = $(window).height();
            ctx_height = screenHeight < 576 ? screenHeight : 576;
            ctx_width = screenWidth < 320 ? screenWidth : 320;
            $(stage).attr({
                height: ctx_height,
                width: ctx_width
            });
        }

    }

    main();

    WeixinApi.ready(function(Api) {
        // 分享的回调
        var wxCallbacks = {
            // 分享操作开始之前
            ready : function() {
                if (!wxData.desc) {
                    wxData.desc = config.wxData;
                }
                // 你可以在这里对分享的数据进行重组
                //console.log("准备分享");
            },
            // 分享被用户自动取消
            cancel : function(resp) {
                resultPanel.wxHide();
                // 你可以在你的页面上给用户一个小Tip，为什么要取消呢？
                //console.log("分享被取消");
            },
            // 分享失败了
            fail : function(resp) {
                resultPanel.wxHide();
                // 分享失败了，是不是可以告诉用户：不要紧，可能是网络问题，一会儿再试试？
                //console.log("分享失败");
            },
            // 分享成功
            confirm : function(resp) {
                resultPanel.wxHide();
                // 分享成功了，我们是不是可以做一些分享统计呢？
                //console.log("分享成功");
            },
            // 整个分享过程结束
            all : function(resp) {
                resultPanel.wxHide();
                // 如果你做的是一个鼓励用户进行分享的产品，在这里是不是可以给用户一些反馈了？
                //console.log("分享结束");
            }
        };

        // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
        Api.shareToFriend(wxData, wxCallbacks);

        // 点击分享到朋友圈，会执行下面这个代码
        Api.shareToTimeline(wxData, wxCallbacks);

        // 点击分享到腾讯微博，会执行下面这个代码
        Api.shareToWeibo(wxData, wxCallbacks);
    });
})(jQuery);
