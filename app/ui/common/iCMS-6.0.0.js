(function($) {
    window.iCMS = {
        config:{
            API: '/public/api.php',
            PUBLIC: '/',
            COOKIE: 'iCMS_',
            AUTH:'USER_AUTH',
            DIALOG:'',
        },
        init: function(options) {
            this.config = $.extend(this.config,options);
        },
        start:function(){
            var doc = $(document);
            this.user_status = this.user.status();
            if (this.user_status) {
                this.user.data();
                $("#iCMS-nav-login").hide();
                $("#iCMS-nav-profile").show();
            }
            doc.on("click", '.iCMS_user_login', function(event) {
                event.preventDefault();
                iCMS.LoginBox(true);
                return false;
            });
            doc.on("click", '.iCMS_user_logout', function(event) {
                event.preventDefault();
                iCMS.user.logout();
                return false;
            });
            $(".iCMS_seccode_img,.iCMS_seccode_text").click(function() {
                $(".iCMS_seccode_img").attr('src', iCMS.api('public', '&do=seccode&') + Math.random());
            });
            $(".iCMS_search_btn").click(function(event) {
                var q = $('[name="q"]',"#iCMS-search-box").val();
                if(q==""){
                    iCMS.alert("请输入关键词");
                    return false;
                }
            });
            $(".iCMS_API_iframe").load(function() {
                iCMS.api_iframe_height($(this));
            });
            $('.tip').tooltip();
        },
        api: function(app, _do) {
            return iCMS.config.API + '?app=' + app + (_do || '');
        },
        param: function(a,_param) {
            if(_param){
                a.attr('data-param',iCMS.json2str(_param));
                return;
            }
            var param = a.attr('data-param') || false;
            if (!param) return {};
            return $.parseJSON(param);
        },
        modal: function() {
            //console.log($(window).width(),$(window).height());
            $('[data-toggle="modal"]').on("click",function() {
                event.preventDefault();
                window.top.iCMS_MODAL = $(this).modal({width: "85%",height: "640px",overflow:true});
                $(this).parent().parent().parent().removeClass("open");
                return false;
            });
        },
        tip: function(el, title,placement) {
            placement = placement||el.attr('data-placement');
            var container = el.attr('data-container');
            if(container){
                $(container).empty();
            }
            el.tooltip({
              html: true,container:container||false,
              placement: placement||'right',
              trigger: 'manual',
              title:title,
            }).tooltip('show');
        },
        alert: function(msg, ok) {
            var opts = ok ? {
                label: 'success',
                icon: 'check'
            } : {
                label: 'warning',
                icon: 'warning'
            }
            window.top.iCMS.dialog(msg, opts);
        },
        dialog: function(msg, options) {
            var defaults = {
                    id: 'iPHP-DIALOG',
                    title: 'iCMS - 提示信息',
                    width: 360,
                    height: 150,
                    fixed: true,
                    lock: true,
                    time: 3000,
                    label: 'success',
                    icon: 'check'
                },
                opts = $.extend(defaults, options,iCMS.config.DIALOG);
            //console.log(opts);
            if (msg.jquery) opts.content = msg.html();
            if (typeof msg == "string" && !opts.content) {
                opts.content = '<div class=\"iPHP-msg\"><span class=\"label label-' + opts.label + '\"><i class=\"fa fa-' + opts.icon + '\"></i> ' + msg + '</span></div>';
            }else{
                opts.content = msg;
            }
            return $.dialog(opts);
        },
        setcookie: function(cookieName, cookieValue, seconds, path, domain, secure) {
            var expires = new Date();
            expires.setTime(expires.getTime() + seconds);
            cookieName = this.config.COOKIE + '_' + cookieName;
            document.cookie = escape(cookieName) + '=' + escape(cookieValue) + (expires ? '; expires=' + expires.toGMTString() : '') + (path ? '; path=' + path : '/') + (domain ? '; domain=' + domain : '') + (secure ? '; secure' : '');
        },
        getcookie: function(name) {
            name = this.config.COOKIE + '_' + name;
            var cookie_start = document.cookie.indexOf(name);
            var cookie_end = document.cookie.indexOf(";", cookie_start);
            return cookie_start == -1 ? '' : unescape(document.cookie.substring(cookie_start + name.length + 1, (cookie_end > cookie_start ? cookie_end : document.cookie.length)));
        },
        random: function(len) {
            len = len || 16;
            var chars = "abcdefhjmnpqrstuvwxyz23456789ABCDEFGHJKLMNPQRSTUVWYXZ",
                code = '';
            for (i = 0; i < len; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            return code;
        },
        imgFix: function(im, x, y) {
            x = x || 99999
            y = y || 99999
            im.removeAttribute("width");
            im.removeAttribute("height");
            if (im.width / im.height > x / y && im.width > x) {
                im.height = im.height * (x / im.width)
                im.width = x
                im.parentNode.style.height = im.height * (x / im.width) + 'px'
            } else if (im.width / im.height <= x / y && im.height > y) {
                im.width = im.width * (y / im.height)
                im.height = y
                im.parentNode.style.height = y + 'px'
            }
        },
        json2str:function(o){
            var arr = [];
            var fmt = function(s) {
                if (typeof s == 'object' && s != null) return iCMS.json2str(s);
                return /^(string|number)$/.test(typeof s) ? '"' + s + '"' : s;
            }
            for (var i in o)
                 arr.push('"' + i + '":'+ fmt(o[i]));
            return '{' + arr.join(',') + '}';
        },
        api_iframe_height:function(a,b){
            var a = a||window.top.$(b);
            a.height(0); //用于每次刷新时控制IFRAME高度初始化
            var height = a.contents().height();
            a.height(height);
            //window.top.$('.iCMS_API_iframe-loading').hide();
        },
        format:function(content,ubb) {
            content = content.replace(/\/"/g, '"')
                .replace(/\\\&quot;/g, "")
                .replace(/\r/g, "")
                .replace(/on(\w+)="[^"]+"/ig, "")
                .replace(/<script[^>]*?>(.*?)<\/script>/ig, "")
                .replace(/<style[^>]*?>(.*?)<\/style>/ig, "")
                .replace(/style=[" ]?([^"]+)[" ]/ig, "")
                .replace(/<a[^>]+href=[" ]?([^"]+)[" ]?[^>]*>(.*?)<\/a>/ig, "[url=$1]$2[/url]")
                .replace(/<img[^>]+src=[" ]?([^"]+)[" ]?[^>]*>/ig, "[img]$1[/img]")
                .replace(/<embed[^>]+src=[" ]?([^"]+)[" ]\s+width=[" ]?([^"]\d+)[" ]\s+height=[" ]?([^"]\d+)[" ]?[^>]*>.*?<\/embed>/ig, "[media=$2,$3]$1[/media]")
                .replace(/<embed[^>]+src=[" ]?([^"]+)[" ]?[^>]*>.*?<\/embed>/ig, "[media]$1[/media]")
                .replace(/<b[^>]*>(.*?)<\/b>/ig, "[b]$1[/b]")
                .replace(/<strong[^>]*>(.*?)<\/strong>/ig, "[b]$1[/b]")
                .replace(/<p[^>]*?>/g, "\n\n")
                .replace(/<br[^>]*?>/g, "\n")
                .replace(/<[^>]*?>/g, "");
            if(ubb){
                return content;
            }
            content = content.replace(/\[url=([^\]]+)\]\n(\[img\]\1\[\/img\])\n\[\/url\]/g, "$2")
                .replace(/\[img\](.*?)\[\/img\]/ig, '<p><img src="$1" /></p>')
                .replace(/\[b\](.*?)\[\/b\]/ig, '<b>$1</b>')
                .replace(/\[url=([^\]|#]+)\](.*?)\[\/url\]/g, '$2')
                .replace(/\[url=([^\]]+)\](.*?)\[\/url\]/g, '<a target="_blank" href="$1">$2</a>')
                .replace(/\n+/g, "[iCMS.N]");

            content = this.n2p(content);
            content = content.replace(/#--iCMS.PageBreak--#/g, "<!---->#--iCMS.PageBreak--#")
                .replace(/<p>\s*<p>/g, '<p>')
                .replace(/<\/p>\s*<\/p>/g, '</p>')
                .replace(/<p>\s*<\/p>/g, '')
                .replace(/<p><br\/><\/p>/g, '');
            return content;
        },
        n2p:function(cc) {
            var c = '',s = cc.split("[iCMS.N]");
            for (var i = 0; i < s.length; i++) {
                while (s[i].substr(0, 1) == " " || s[i].substr(0, 1) == "　") {
                    s[i] = s[i].substr(1, s[i].length);
                }
                if (s[i].length > 0){
                    c += "<p>" + s[i] + "</p>";
                }
            }
            return c;
        },
    };
    iCMS.article = {
        good: function(a) {
            var $this = $(a),
                p = $this.parent(),
                param = iCMS.param(p);
            param['do'] = 'good';
            $.get(iCMS.api('article'), param, function(c) {
                if (c.code) {
                    var count = parseInt($('span', $this).text());
                    $('span', $this).text(count + 1);
                } else {
                    iCMS.alert(c.msg, c.code);
                    return false;
                }
            }, 'json');
        }
    };
})(jQuery);

(function($) {
    $.fn.modal = function(options) {
        var im = $(this),
            defaults = {
                width: "360px",
                height: "auto",
                title: im.attr('title') || "iCMS 提示",
                href: im.attr('href') || false,
                target: im.attr('data-target') || "#iCMS-MODAL",
                zIndex: im.attr('data-zIndex') || false,
                overflow: im.attr('data-overflow') || false,
            };

        var meta = im.attr('data-meta') ? $.parseJSON(im.attr('data-meta')) : {};
        var opts = $.extend(defaults, options, meta);
        var mOverlay = $('<div id="modal-overlay"></div>');

        return im.each(function() {

            var m = $(opts.target),
                mBody = m.find(".modal-body"),
                mTitle = m.find(".modal-title");
            opts.title && mTitle.html(opts.title);
            mBody.empty();

            if (opts.overflow) $("body").css({
                "overflow-y": "hidden"
            });

            if (opts.html) {
                var html = opts.html;
                if (typeof opts.html == "object") {
                    if (opts.html.jquery) {
                        opts.html.show();
                        html = opts.html.html();
                    } else {
                        opts.html.style.display = 'block';
                    }
                }
                mBody.html(html).css({
                    "overflow-y": "auto"
                });
            } else if (opts.href) {
                var mFrame = $('<iframe id="modal-iframe" frameborder="no" allowtransparency="true" scrolling="auto" hidefocus="" src="' + opts.href + '"></iframe>');
                mFrameFix = $('<div id="modal-iframeFix"></div>');
                mFrame.appendTo(mBody);
                mFrameFix.appendTo(mBody);
            }
            mOverlay.insertBefore(m).click(function() {
                im.destroy();
            });
            $('[data-dismiss="modal"][aria-hidden="true"]').on('click', function() {
                im.destroy();
            });
            im.size = function(o) {
                var opts = $.extend(opts, o);
                opts.zIndex && m.css({
                    "cssText": 'z-index:' + opts.zIndex + '!important'
                });
                m.css({
                    width: opts.width
                });
                mBody.height(opts.height);
                var left = ($(window).width() - m.width()) / 2,
                    top = ($(window).height() - m.height()) / 2;
                m.css({
                    "position": "fixed",
                    left: left + "px",
                    top: top + "px"
                });

                //console.log({left:left+"px",top:top+"px"});

            };
            im.destroy = function() {
                window.stop ? window.stop() : document.execCommand("Stop");
                m.hide().removeClass('in');
                mOverlay.remove();
                m.find(".modal-title").html("iCMS 提示");
                if (opts.overflow) {
                    $("body").css({
                        "overflow-y": "auto"
                    });
                }
            };
            im.size(opts);
            m.show().addClass('in');
            return im;
        });
    }
})(jQuery);
// lazy load
(function(a){
    a.fn.lazyload=function(b){var c={attr:"data-original",container:a(window),callback:a.noop};var d=a.extend({},c,b||{});d.cache=[];a(this).each(function(){var h=this.nodeName.toLowerCase(),g=a(this).attr(d.attr);var i={obj:a(this),tag:h,url:g};d.cache.push(i)});var f=function(g){if(a.isFunction(d.callback)){d.callback.call(g.get(0))}};var e=function(){var g=d.container.height();if(a(window).get(0)===window){contop=a(window).scrollTop()}else{contop=d.container.offset().top}a.each(d.cache,function(m,n){var p=n.obj,j=n.tag,k=n.url,l,h;if(p){l=p.offset().top-contop,l+p.height();if((l>=0&&l<g)||(h>0&&h<=g)){if(k){if(j==="img"){f(p.attr("src",k))}else{p.load(k,{},function(){f(p)})}}else{f(p)}n.obj=null}}})};e();d.container.bind("scroll",e)}}
)(jQuery);

function pad(num, n) {
    num = num.toString();
    return Array(n > num.length ? (n - ('' + num).length + 1) : 0).join(0) + num;
}

$(function(){
    if(!placeholderSupport()){   // 判断浏览器是否支持 placeholder
        $('[placeholder]').focus(function() {
            var input = $(this);
            if (input.val() == input.attr('placeholder')) {
                input.val('');
                input.removeClass('placeholder');
            }
        }).blur(function() {
            var input = $(this);
            if (input.val() == '' || input.val() == input.attr('placeholder')) {
                input.addClass('placeholder');
                input.val(input.attr('placeholder'));
            }
        }).blur();
    };
})

function placeholderSupport() {
    return 'placeholder' in document.createElement('input');
}
