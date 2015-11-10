/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-03-24 11:40
 */


define(function (require, exports, module) {
    'use strict';

    var random = require('../../src/utils/random.js');
    var dangkr = require('../../src/utils/dangkr.js');
    var $ = function (selector) {
        return document.getElementById(selector.slice(1)) || {};
    };
    var app = {};

    dangkr.ready(function () {
        alert('jsbridge has ready');
    });


    app.data = function () {
        var $dataValue = $('#dataValue');

        $('#dataSend').onclick = function () {
            dangkr.dataSend({
                data: $dataValue.value
            });
        };
    };


    app.navigation = function () {
        $('#navigationShow').onclick = function () {
            dangkr.navigationShow([{
                type: 'share',
                data: {
                    "title": "分享的标题",
                    "desc": "分享的描述",
                    "link": "http://www.dangke.com/",
                    "phone": "18814817057",
                    "img": "http://dummyimage.com/600x400"
                }
            }, {
                type: 'report',
                data: {
                    id: 123
                }
            }, {
                type: 'back'
            }, {
                type: 'done'
            }]);
        };

        $('#navigationHide').onclick = function () {
            dangkr.navigationShow([]);
        };

        $('#navigationTitle').onclick = function () {
            dangkr.navigationTitle(random.string());
        };
    };


    app.share = function () {
        var $shareData = $('#shareData');
        var $shareRet = $('#shareRet');

        $('#shareOpenAndClose').onclick = function () {
            dangkr.shareOpen(toJSON($shareData.value));
        };

        //dangke.shareData(toJSON($shareData.value));
        dangkr.when('share.click', function (err, json) {
            if (err) {
                return alert(err.message);
            }

            var s = '';

            if (typeof json === 'object') {
                s = JSON.stringify(json);
            } else {
                s = String(json);
            }

            $shareRet.innerHTML = 'share.click ' + s;
        });

        //
        //$('#shareTimeline').onclick = function () {
        //    dangke.shareTimeline(toJSON($shareData.value));
        //};
        //
        //$('#shareWeixin').onclick = function () {
        //    dangke.shareWeixin(toJSON($shareData.value));
        //};
        //
        //$('#shareWeibo').onclick = function () {
        //    dangke.shareWeibo(toJSON($shareData.value));
        //};
        //
        //$('#shareQQfriend').onclick = function () {
        //    dangke.shareQQfriend(toJSON($shareData.value));
        //};
        //
        //$('#shareQQzone').onclick = function () {
        //    dangke.shareQQzone(toJSON($shareData.value));
        //};
        //
        //$('#shareSMS').onclick = function () {
        //    dangke.shareSMS(toJSON($shareData.value));
        //};
    };


    app.geolocation = function () {
        var $geolocationData1 = $('#geolocationData1');

        $('#geolocationGet').onclick = function () {
            dangkr.geolocationGet(function (err, json) {
                $geolocationData1.value = JSON.stringify(json, null, 4);
            });
        };
    };


    app.location = function () {
        $('#locationRedirect1').onclick = function () {
            dangkr.locationRedirect({
                type: 'captain',
                id: '123'
            });
        };

        $('#locationRedirect2').onclick = function () {
            dangkr.locationRedirect({
                type: 'club',
                id: '123'
            });
        };

        $('#locationRedirect3').onclick = function () {
            dangkr.locationRedirect({
                type: 'myActivity'
            });
        };

        $('#locationRedirect4').onclick = function () {
            dangkr.locationRedirect({
                type: 'applyer',
                id: '123'
            });
        };

        $('#locationRedirect5').onclick = function () {
            dangkr.locationRedirect({
                type: 'applyList',
                id: '123'
            });
        };

        //$('#locationTitle').onclick = function () {
        //    dangke.locationTitle({
        //        title: random.string(random.number(6, 20))
        //    });
        //};
    };


    app.user = function () {
        var $userData = $('#userData');

        $('#userGet').onclick = function () {
            dangkr.userGet(function (err, json) {
                $userData.value = JSON.stringify(json, null, 4);
            });
        };

        $('#userLogin').onclick = function () {
            dangkr.userLogin(function (err, json) {
                $userData.value = JSON.stringify(json, null, 4);
            });
        };

        $('#userLogout').onclick = function () {
            dangkr.userLogin(function (err) {
                alert(err ? err.message : '已注销登录');
            });
        };
    };


    app.media = function () {
        var $mediaData1 = $('#mediaData1');
        var $mediaData2 = $('#mediaData2');
        var mediaData2 = null;

        $('#mediaInput1').onclick = function () {
            dangkr.mediaInput({
                placeholder: '测试输入占位符',
                maxLength: 100
            }, function (err, json, res) {
                $mediaData1.value = JSON.stringify(json, null, 4);
            });
        };

        $('#mediaInput2').onclick = function () {
            dangkr.mediaInput({
                placeholder: '测试输入占位符',
                maxLength: 100,
                atText: '@someone：',
                atParent: 2
            }, function (err, json, res) {
                $mediaData1.value = JSON.stringify(json, null, 4);
            });
        };

        $('#mediaPicture1').onclick = function () {
            dangkr.mediaPicture({
                list: [
                    'http://dummyimage.com/600x400/ccc/000&text=1'
                ]
            });
        };

        $('#mediaPicture2').onclick = function () {
            dangkr.mediaPicture({
                list: [
                    'http://dummyimage.com/600x400/CCC/000&text=1',
                    'http://dummyimage.com/600x400/AF3B3B/FFF&text=2',
                    'http://dummyimage.com/600x400/B68F2B/FFF&text=3',
                    'http://dummyimage.com/600x400/419719/FFF&text=4'
                ],
                active: 1
            });
        };

        var $mediaUploadImg = $('#mediaUploadImg');

        $('#mediaUpload1').onclick = function () {
            dangkr.mediaUpload(function (err, json) {
                if (err) {
                    return alert(err.message || '上传失败');
                }

                $mediaUploadImg.src = json.url;
            });
        };

        $('#mediaUpload2').onclick = function () {
            dangkr.mediaUpload({
                minify: false
            },function (err, json) {
                if (err) {
                    return alert(err.message || '上传失败');
                }

                $mediaUploadImg.src = json.url;
            });
        };
    };


    app.device = function () {
        var $deviceData1 = $('#deviceData1');
        var $deviceData2 = $('#deviceData2');

        $('#deviceNetwork').onclick = function () {
            dangkr.deviceNetwork(function (err, json) {
                $deviceData1.value = JSON.stringify(json, null, 4);
            });
        };

        $('#deviceSystem').onclick = function () {
            dangkr.deviceSystem(function (err, json) {
                $deviceData2.value = JSON.stringify(json, null, 4);
            });
        };
    };


    app.dialog = function () {
        var timeid1;
        var timeid2;

        $('#dialogLoading1').onclick = function () {
            dangkr.dialogLoadingOpen({
                modal: true,
                text: '测试中'
            });

            timeid1 = setTimeout(function () {
                dangkr.dialogLoadingClose();
            }, 5000);
        };

        $('#dialogLoading2').onclick = function () {
            dangkr.dialogLoadingOpen({
                modal: false,
                text: '比较长的loading，非模态测试中'
            });

            timeid2 = setTimeout(function () {
                dangkr.dialogLoadingClose();
            }, 5000);
        };

        $('#dialogTips1').onclick = function () {
            dangkr.dialogTipsOpen({
                modal: true,
                text: '模态提示',
                timeout: 3
            });
        };

        $('#dialogTips2').onclick = function () {
            dangkr.dialogTipsOpen({
                modal: false,
                text: '很长很长很长很长很长很长很长很长很长很长的一段提示，非模态测试中',
                timeout: 5
            });
        };
    };


    app.bottom = function () {
        $('#bottomApply1').onclick = function () {
            dangkr.bottomApply({
                // 是否允许报名
                active: true,
                // 是否隐藏
                hidden: false
            });
        };

        $('#bottomApply2').onclick = function () {
            dangkr.bottomApply({
                // 是否允许报名
                active: false,
                // 是否隐藏
                hidden: false
            });
        };

        $('#bottomApply3').onclick = function () {
            dangkr.bottomApply({
                // 是否允许报名
                active: true,
                // 是否隐藏
                hidden: true
            });
        };

        dangkr.when('bottom.apply', function () {
            alert('点击了报名按钮');
        });
    };


    app.data();
    app.navigation();
    app.share();
    app.geolocation();
    app.location();
    app.user();
    app.media();
    app.device();
    app.dialog();
    app.bottom();

    function toJSON(value) {
        return JSON.parse(value.replace(/\n/g, ''));
    }
});