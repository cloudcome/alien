(function($) {
    'use strict';

    // need a way for all ids to be unique even though this template is run for
    // every version. it's a good thing time always moves forward...
    var tabs = $('[data-toggle=tab]')
        , tabPanes = $('.tab-pane')
        , micro = (function(){ var a = new Date(); return a.getTime(); }())
        , offset = 65
        , $sidebar = $('#docs-sidebar')
        , $navList = $sidebar.find('.nav-list')
        , $window = $(window)
        , $body = $('body')
        , i, id, pageTitle, liDivider

        /**
         *  Make sure the fixed nav fits inside the window and resizes with it
         *  accordingly.
         */
        , sidebarResize = function() {

            }
        ; // end var declaration

    sidebarResize();
    $window.resize(sidebarResize);

    // responsive design removes the fixed positioning of the nav for phones. we
    // need to make sure to account for situations with fixed/static nav
    if ($('.navbar-fixed-top').css('position') == 'fixed') {
        // since we have a fixed nav, we need to account for native link fragment
        // functionality. scrollspy handles it once the page loads, but it needs to be
        // handled for initial page load.
        if (window.location.hash.length) {
            $(document).ready(function() {
                setTimeout(function() {
                    var targ = $('.name:target')[0]
                        , boundingRect, top, topDiff;

                    if (targ) {
                        boundingRect = targ.getBoundingClientRect();
                        top = parseInt(boundingRect.top, 10);
                        if (top !== offset) {
                            topDiff = top - offset;
                            $body.scrollTop($body.scrollTop() + topDiff);
                        }
                    }
                }, 100);
            });
        }
    } else {
        // on a phone
        $('<a id="toTop" href="#main"><i class="icon-arrow-up icon-white"></i>Top</a>')
            .appendTo('body');
    }

    // ensure all tabs in detail panes have unique ids so the bootstrapped tabs work
    for (i = 0; i < tabs.length; i++) {
        id = micro++;
        $(tabs[i]).attr('href', '#tab' + id);
        $(tabPanes[i]).attr('id', 'tab' + id);
    }

    // fix scroll spy so that it takes into account the fixed top nav bar
    $navList.find('li a').click(function(event) {
        event.preventDefault();
        $($(this).attr('href'))[0].scrollIntoView();
        scrollBy(0, -offset);
    });

    // insert title into sidebar
    pageTitle = $('#docs-content > section > header > h2').text().replace(/\s/g, '');
    if (pageTitle.length) {
        liDivider = ($navList.find('li').length)
                        ? '<li class="divider"></li>'
                        : ''
                        ;
        $('#docs-sidebar .nav-list')
            .prepend('<li><h4>' + pageTitle + '</h4></li>' + liDivider);
    }

    // make external links go to a new tab/window
    $('a[href*=http]').attr('target', '_blank');

    // event links have colons in them which seem to mess with bootstrap's scroll spy
    // so we change them to hyphens instead. this replacement also takes place in
    // the nav-list (layout.tmpl) and the method template (method.tmpl).
    $('a[href*="event:"]').attr('href', function(index, attr) {
        $(this).attr('href', attr.replace(':', '-'));
    });

    // we've replaced newlines with <br> tags for preserving comments. as such, they
    // sometimes show up in <ul>'s
    $('ul br').remove();

    // wrap the params in <code> tags
    $('.signature').each(function(ndx, el) {
        var $el     = $(el)
            , txt   = $el.html()
            , p     = []
            , newTxt
            ;

        newTxt = txt.replace(/[()]/g, '');

        $.each(newTxt.split(','), function(ndx, value) {
            value = value.replace(/^ *| *$/g, '');
            if (value.length) {
                p.push('<code>' + value + '</code>');
            }
        });

        if (p.length) {
            $el.html('(' + p.join(', ') + ')');
        }
    });

    // show labels for inherited members/methods
    $('section.inherited dt').prepend('<span class="label">inherited</span>');

    // show labels for overriding members/methods
    $('section.overrides dt').prepend('<span class="label label-warning">overrides</span>');
}(jQuery));
