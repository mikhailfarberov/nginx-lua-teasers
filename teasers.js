Array.prototype.remove = function(a, b) {
    var c = this.slice((b || a) + 1 || this.length);
    return this.length = a < 0 ? this.length + a : a, this.push.apply(this, c)
};

if (typeof(ADROTATOR) == 'undefined') {
    var ADROTATOR = new function () {
        var self = this,
            SERVERS = GLOBAL_HOSTS,
            DOMAIN = "GLOBAL_DOMAIN",
            SERVER_URL = false,
            GLOBAL_INIT = !1,
            CLIENT_ID = false,
            UID = "GLOBAL_UID",
            recycling = 0,
            blocks = [],
            dynamic = [],
            framed = false,
            ref = null,
            mobile = null,
            desktop = null,
            openstat = null;

        self.stripAndExecuteScript = function (a, b) {
            var c = "",
                d = !1,
                e = b.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function () {
                    var a = /class=["|'](.*?)["|']/g.exec(arguments[0]);
                    return a && (d = a[1]), "" != arguments[1] && (c += arguments[1] + "\n"), ""
                }),
                f = [];
            if (b.replace(/<script([\s\S]*?)>([\s\S]*?)<\/script>/gi, function () {
                if ("" != arguments[1]) {
                    var a = /src=["|'](.*?)["|']/g.exec(arguments[1]);
                    if (a) {
                        var b = a[1];
                        a = /async/.exec(arguments[1]), f.push({
                            src: b,
                            async: !!a
                        })
                    }
                }
                return ""
            }), window.execScript) window.execScript(c);
            else {
                var g = document.createElement("script");
                g.setAttribute("type", "text/javascript"), d && (g.className = d), g.textContent = c, a.appendChild(g)
            }
            for (i in f)
                if (f.hasOwnProperty(i)) {
                    var g = document.createElement("script");
                    g.setAttribute("type", "text/javascript"), g.src = f[i].src, g.async = f[i].async, a.appendChild(g)
                }
            return e
        }

        self.stripCode = function (a, b) {
            var c = b.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function () {
                return ""
            });
            return c
        }

        self.stripStyle = function (a, b)
        {
            var c = b.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, function () {
                    return ""
                }),
                d = document.createElement("style");
            d.type = "text/css", d.innerHTML = c, a.appendChild(d)
        }

        self.stripAndAppendStyle = function (a, b) {
            var c = [];
            b.replace(/<style([\s\S]*?)>([\s\S]*?)<\/style>/gi, function () {
                if ("" != arguments[1]) {
                    var a = /href=["|'](.*?)["|']/g.exec(arguments[1]);
                    if (a) {
                        var b = a[1];
                        c.push({
                            src: b
                        })
                    }
                }
                return ""
            });
            for (i in c)
                if (c.hasOwnProperty(i)) {
                    var d = document.createElement("style");
                    d.setAttribute("rel", "stylesheet"), d.setAttribute("type", "text/css"), d.setAttribute("href", c[i]), a.appendChild(d)
                }
        }

        self.sendStat = function (bid, tid) {
            if (tid.length) {
                var params = {bid: bid, tid: tid};

                var b = new XMLHttpRequest;
                b.withCredentials = !0, b.open("POST", SERVER_URL + "/views/", !0), b.send(JSON.stringify(params))
            }
        }

        self.checkDynamic = function () {
            for (var i in dynamic) dynamic.hasOwnProperty(i) && (bd = dynamic[i], self.isElementInView(bd[0]) && (dynamic.remove(i), self.sendStat(bd[0].getAttribute("id"), bd[1])))
        }

        self.addGlobal = function (b) {
            (a = document.getElementsByTagName("head")[0], GLOBAL_INIT = !0, "undefined" != typeof b.c && (self.stripStyle(a, b.c), self.stripAndAppendStyle(a, b.c)), "undefined" != typeof b.j && self.stripAndExecuteScript(a, b.j))
        }

        self.getPageRect = function () {
            var a = "BackCompat" !== document.compatMode,
                b = a ? document.documentElement : document.body,
                c = (window.pageXOffset || b.scrollLeft) - (b.clientLeft || 0),
                d = (window.pageYOffset || b.scrollTop) - (b.clientTop || 0),
                e = "innerWidth" in window ? window.innerWidth : b.clientWidth,
                f = "innerHeight" in window ? window.innerHeight : b.clientHeight;
            return [c, d, c + e, d + f]
        }

        self.getElementRect = function (a) {
            for (var b = 0, c = 0, d = a.offsetWidth, e = a.offsetHeight; null !== a.offsetParent;) b += a.offsetLeft, c += a.offsetTop, a = a.offsetParent;
            return [b, c, b + d, c + e]
        }

        self.rectsIntersect = function (a, b) {
            return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1]
        }

        self.isElementInView = function (a) {
            return self.rectsIntersect(self.getPageRect(), self.getElementRect(a))
        }

        self.isFramed = function () {
            try {
                return document.location.href.match(/main\.news/i) || document.referrer.match(/\/mainews\.ru/i);
            } catch (a) {
                return !0
            }
        }

        self.isMobile = function () {
            var a = !1;
            return function (b) {
                (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(b) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(b.substr(0, 4))) && (a = !0)
            }(navigator.userAgent || navigator.vendor || window.opera), a
        }

        self.isTablet = function() {
            var a = !1;
            return function(b) {
                /android|ipad|playbook|silk/i.test(b.substr(0, 4)) && (a = !0)
            }(navigator.userAgent || navigator.vendor || window.opera), a
        }

        self.isDesktop = function () {
            return (!self.isMobile() && !self.isTablet());
        }

        self.getPathFromUrl = function (a) {
            return a.split("?")[0]
        }

        self.getDomainName = function (a) {
            var b;
            return b = a.indexOf("//") > -1 ? a.split("/")[2] : a.split("/")[0], b = b.split(":")[0]
        }

        self.getOpenstat = function(bid) {
            r = self.getDomainName(self.getReferrer())
            return window.btoa(DOMAIN + ';' + ((r != '') ? r:'-') + ';-;' + ((typeof bid !== 'undefined') ? bid:'-'));
        }

        self.getReferrer = function () {
            var a = self.getCookie("ADROTATOR-ref");
            return "undefined" == typeof a && (a = "", "undefined" != typeof document.referrer && self.getDomainName(document.referrer) != document.location.host ? b = self.getPathFromUrl(document.referrer) : b = "", "" != b && b != a && (a = b, self.setCookie("ADROTATOR-ref", a))), a
        }

        self.setCookie = function (a, b, c) {
            c = c || {};
            var d = c.expires;
            if ("number" == typeof d && d) {
                var e = new Date;
                e.setTime(e.getTime() + 1e3 * d), d = c.expires = e
            }
            d && d.toUTCString && (c.expires = d.toUTCString()), b = encodeURIComponent(b);
            var f = a + "=" + b;
            for (var g in c) {
                f += "; " + g;
                var h = c[g];
                h !== !0 && (f += "=" + h)
            }
            document.cookie = f
        }

        self.getCookie = function (a) {
            var b = document.cookie.match(new RegExp("(?:^|; )" + a.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
            return b ? decodeURIComponent(b[1]) : void 0
        }

        self.handle = function (ids) {
            var params = {};
            params["recycling"] = recycling;
            var hblocks = [];
            for (i in ids) {
                if (ids.hasOwnProperty(i))
                    hblocks.push(blocks[ids[i]]);
            }
            params["blocks"]= hblocks;

            var c = new XMLHttpRequest;
            c.withCredentials = !0, c.onreadystatechange = function () {
                if (4 == c.readyState && 200 == c.status && "" != c.responseText) {
                    var data = JSON.parse(c.responseText), tid = [];
                    for (i in ids) {
                        if (ids.hasOwnProperty(i) && blocks.hasOwnProperty(ids[i])) {
                            id = ids[i];
                            block = blocks[id];
                            teasers = data[id];
                            var elem = document.getElementById(block.id);
                            elem.className = "ADROTATOR-list";
                            tid = [];
                            for (t in teasers) {
                                if (teasers.hasOwnProperty(t)) {
                                    // <div class="item" style="user-select: none;"><div><a href="" target="_blank" rel="nofollow"><img class="image" src=""></a><div class="title"><a href="" target="_blank" rel="nofollow"></a></div><div class="clear"></div></div></div>
                                    var d = document.createElement("div");
                                    d.className = "item";
                                    d.setAttribute("data-id", teasers[t].id);
                                    if (block.vertical)
                                        d.className = "item vertical";
                                    d.style.cssText = 'user-select: none;';
                                    openstat = self.getOpenstat(block.id);
                                    if (openstat)
                                        teasers[t].url = teasers[t].url + '?_openstat=' + openstat;
                                    if (block.hasOwnProperty("textonly") && block.textonly == true)
                                        d.innerHTML = '<div><div class="title"><a href="' + teasers[t].url + '" target="_blank" rel="nofollow">' + teasers[t].title + '</a></div><div class="clear"></div></div>';
                                    else
                                        d.innerHTML = '<div><a href="' + teasers[t].url + '" target="_blank" rel="nofollow"><img class="image" src="' + teasers[t].img + '"></a><div class="title"><a href="' + teasers[t].url + '" target="_blank" rel="nofollow">' + teasers[t].title + '</a></div><div class="clear"></div></div>';
                                    elem.appendChild(d);
                                    tid.push(teasers[t].id)
                                }
                            }
                            if (self.isElementInView(elem))
                                self.sendStat(block.id, tid);
                            else
                                dynamic.push([elem, tid])
                        }
                    }
                }
            }, c.open("POST", SERVER_URL + '/load/' + CLIENT_ID + '/', !0), c.send(JSON.stringify(params))
        }

        self.hexToDec = function(hex) {
            return parseInt(hex,16);
        }

        self.load = function(cfg) {
            if (!CLIENT_ID) return false;
            if (typeof cfg.recycling != 'undefined')
                recycling = cfg.recycling;
            var ids = [];
            if (typeof cfg.blocks != 'undefined') {
                for (i in  cfg.blocks) {
                    if (cfg.blocks.hasOwnProperty(i) && cfg.blocks[i].hasOwnProperty("id") && !blocks.hasOwnProperty(cfg.blocks[i]['id'])) {
                        blocks[cfg.blocks[i]['id']] = cfg.blocks[i];
                        ids.push(cfg.blocks[i]['id']);

                        if (typeof cfg.blocks[i]['css'] != 'undefined')
                            self.addGlobal({c: cfg.blocks[i]['css']});
                    }
                }
            }

            self.handle(ids);
            return true;
        }

        self.init = function(ehash, cfg) {
            if (typeof ehash == 'undefined')
                return false;
            if (self.isFramed())
                return false;

            CLIENT_ID = ehash;
            if (SERVERS.length) {
                SERVER_ID = self.hexToDec(UID) % SERVERS.length;
                SERVER_URL = SERVERS[SERVER_ID];
            } else
                return false;

            framed = self.isFramed();
            ref = self.getReferrer();
            mobile = self.isMobile();
            desktop = self.isDesktop();
            openstat = self.getOpenstat();

            document.addEventListener("scroll", function () {
                self.checkDynamic()
            });
            document.addEventListener("resize", function (a) {
                self.checkDynamic()
            });

            //console.log('UID=' + UID);

            self.addGlobal({c: '.ADROTATOR-list { overflow: hidden; padding-left: 0; padding-right: 0; margin: 10px auto 0;font-size: 0; text-align: left;} .ADROTATOR-list .item { display: inline-block; vertical-align: top; box-sizing: border-box; margin-bottom: 2%; margin-right: 2%; margin: 0 .5% 10px; position: relative; border-bottom: 1px solid #e3e3e3;} .ADROTATOR-list .vertical { display: block; } .ADROTATOR-list .image { border: none; width: 100%; max-width: 185px; margin: 0 auto; } .ADROTATOR-list .title { display: block; max-width: 180px; padding: 10px; margin: 0 0 5px; word-wrap: break-word; } .ADROTATOR-list .item .title a { display: block; font-family: Roboto; font-size: 15px; color: #000; font-weight: 400;  font-style: normal; text-decoration: none; line-height: 20px; height: 80px; overflow: hidden;  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; }.ADROTATOR-list .clear { clear: both;}'});

            if (typeof cfg != 'undefined') {
                self.load(cfg);
            }
            return true;
        }

        self.getTeaserInfo = function(id, hash, n, ncat, cb) {
            var c = new XMLHttpRequest;
            c.withCredentials = !0, c.onreadystatechange = function () {
                if (4 == c.readyState && 200 == c.status && "" != c.responseText) {
                    var teasers = JSON.parse(c.responseText);
                    openstat = self.getOpenstat();
                    for (t in teasers) {
                        if (teasers.hasOwnProperty(t)) {
                            if (openstat)
                                teasers[t].url = teasers[t].url + '?_openstat=' + openstat;
                        }
                    }
                    cb(teasers);
                }
            }, c.open("GET", SERVER_URL + "/get/" + id + "/" + hash + '/?count=' + n + '&category=' + ncat, !0), c.send()
        }

	self.landing = function(n, cb) {
    	    var ncat = 0, t = '-', h = '-';
            if(window.location.hash) {
                t = window.location.hash.substring(window.location.hash.indexOf('t=') + 2, window.location.hash.indexOf('&'));
                h = window.location.hash.substring(window.location.hash.indexOf('&') + 3);
                if (t != '') {
                    var SERVER_ID = h.substring(0, h.indexOf('.'));
                    if (SERVER_ID == '')
                        SERVER_ID = 0;
                    h = h.substring(h.indexOf('.') + 1);
                }
            } else
                SERVER_ID = 0;

            if (SERVERS.length) {
                SERVER_URL = SERVERS[SERVER_ID];
                if (typeof cb != 'undefined') {
                    self.getTeaserInfo(t, h, n, ncat, cb);
                }
            }

            return false;
        }

        self.informer = function(ehash, n, domain, cb) {
            CLIENT_ID = ehash;

            var c = new XMLHttpRequest;
            c.withCredentials = !0, c.onreadystatechange = function () {
                if (4 == c.readyState && 200 == c.status && "" != c.responseText) {
                    var teasers = JSON.parse(c.responseText);
                    if (typeof teasers.length == 'undefined' || teasers.length == 0) {
                        cb(false);
                        return;
                    }
                    openstat = self.getOpenstat();
                    for (t in teasers) {
                        if (teasers.hasOwnProperty(t)) {
                            if (openstat)
                                teasers[t].url = teasers[t].url + '?_openstat=' + openstat;
                        }
                    }
                    if (typeof cb != 'undefined') {
                        cb(teasers);
                    }
                }
            }, c.open("GET", SERVER_URL + '/load/' + CLIENT_ID + '/' + n + '/0/' + domain, !0), c.send()
        }
    };
}
