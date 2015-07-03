/*!
 * script
 * @author ydr.me
 * @create 2014-10-03 17:41
 */

'use strict';

$('#docs-content').scrollspy({
    target: '#docs-sidebar',
    offset: 65
});

$('.nav-tabs').each(function () {
    $(this).find('a').click(function () {
        var $target = $($(this).attr('href'));

        $(this).closest('li').addClass('active').siblings().removeClass('active');

        if($target.length){
            $target.addClass('active').siblings().removeClass('active');
        }

        return !1;
    }).eq(0).find('a').trigger('click');
});