/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: mma
 * Date: 31.07.13
 * Time: 10:58
 */
define([
        "dojo/_base/lang",
        "dojo/_base/window",
        "dojo/_base/declare",
        "dojo/io-query",
        "ct/_url",
        "ct/_string",
        "ct/util/Redirect"
    ],
    function (
        d_lang,
        d_win,
        declare,
        d_ioq,
        ct_url,
        ct_string,
        Redirect
        ) {
        return declare([Redirect],
            /**
             * @lends ct.util.Redirect.prototype
             */
            {
                constructor: function (opts) {
                    opts = opts || {};
                    this.url = opts.url || "";
                    this.baseURL = opts.baseURL || d_win.doc.location.href.split("?")[0];
                    var urlParam = opts.urlParam;
                    if (urlParam) {
                        this.url = this._getURLFromParameter(urlParam) || this.url;
                    }
                    this.integratedParameter = opts.integratedParameter || {};
//                WHAT WAS THIS FOR?
//                if (this.baseURL.indexOf("geopunt")>-1||d_win.doc.location.href.indexOf("geopunt")>-1) {
//                    this.url=d_win.doc.location.href.split("?")[0];
//                }
                    this.params = opts.params || {};
                    var appendReturnUrl = opts.appendReturnUrl;
                    if (appendReturnUrl === true) {
                        appendReturnUrl = "returnURL";
                    }
                    if (appendReturnUrl) {
                        this.params[appendReturnUrl] = d_win.doc.location.href;
                    }

                    this._useStorage = opts.useStorage;
                },
                redirect: function (objOrEvt) {

                    if (d_win.global.parent && d_win.global.parent.postMessage) {
                        d_win.global.parent.postMessage("LOADING", "*");
                    }

                    var url = this.url;
                    if (!ct_url.isAbsoluteURL(url)) {
                        url = this.baseURL + url;
                    }
                    url = ct_url.toAbsoluteURL(url);
                    var redirectUrl = url;

                    var params = this.params;
                    if (objOrEvt) {
                        objOrEvt = (objOrEvt.getProperties && objOrEvt.getProperties()) || objOrEvt;
                    }
                    if (this._parameterManager) {
                        var pUrl = this._parameterManager.getEncodedURL();
                        var t = d_ioq.queryToObject(pUrl.split("?")[1]);
                        d_lang.mixin(params, t);
                        var tmp = {}, k;
                        for (k in this.integratedParameter) {
                            tmp[k] = ct_string.stringReplace(this.integratedParameter[k], objOrEvt);
                        }
                        d_lang.mixin(params, tmp);
                    }
                    var query = d_ioq.objectToQuery(params);
                    if (query) {
                        if (url.indexOf("?") > -1) {
                            redirectUrl = url + "&" + query;
                        } else {
                            redirectUrl = url + "?" + query;
                        }
                    }

                    if (this._useStorage) {
                        redirectUrl = url + "?" + "restore=true&app=" + params.app + (params.parent_origin ? "&parent_origin=" + params.parent_origin : "");
                    }

                    if (objOrEvt) {
                        objOrEvt = (objOrEvt.getProperties && objOrEvt.getProperties()) || objOrEvt;
                        redirectUrl = ct_string.stringReplace(redirectUrl, objOrEvt);
                    }
                    d_win.doc.location.href = redirectUrl;
                }
            });
    });