define("1a", ["c", "l", "o"], function (t, e) {
    "use strict";
    function n(t) {
        var e = document.cookie.split(";"), n = {};
        return c.each(e, function (e, o) {
            var r = o.split("=");
            r[0] = r[0].trim(), r[0] = t ? i(r[0]) : r[0], r[0] && (n[r[0]] = t ? i(r[1]) : r[1])
        }), n
    }

    function o(t, e, n) {
        n.isStrict && (t = r(t), e = r(e));
        var o = new Date, i = [t + "=" + e];
        o.setTime(o.getTime() + 1e3 * n.expires), i.push("expires=" + o.toUTCString()), n.path && i.push("path=" + n.path), n.domain && i.push("domain=" + n.domain), n.secure && i.push("secure=secure"), document.cookie = i.join(";") + ";"
    }

    function r(t) {
        return encodeURIComponent(t)
    }

    function i(t) {
        try {
            return decodeURIComponent(t)
        } catch (e) {
            return ""
        }
    }

    var c = t("c"), u = t("l"), s = t("o"), a = {
        isStrict: !0,
        domain: "localhost" === location.hostname ? "" : location.hostname,
        expires: 3600,
        path: "/",
        secure: !1
    }, p = function (t, e, r, i) {
        var u = c.toArray(arguments);
        return r = c.extend(!0, {}, a, r), u.pop(), s.getset({
            get: function (t) {
                return n(r.isStrict)[t]
            }, set: function (t, e) {
                o(t, e, r)
            }
        }, u)
    };
    e.get = function (t, e) {
        return p(t, void 0, e)
    }, e.set = function (t, e, n) {
        p(t, e, n)
    }, e.remove = function (t, n) {
        var o = {};
        return "array" === u(t) ? c.each(t, function (t, e) {
            o[e] = ""
        }) : o[t] = "", n = c.extend(!0, {}, a, n, {expires: -1}), e.set(o, n)
    }
});