define([
        "dojo/_base/declare"
    ],
    function (declare) {
        return declare([],
            {
                constructor: function (props) {
                    var appInsightsId = props.appInsightsId || "00991a4a-ac8d-4ceb-ab90-14476778c5d3";
                    var scriptUrl = props.scriptUrl || "//az416426.vo.msecnd.net/scripts/v/ai.0.7.js";

                    window.appInsights = {
                        queue : [],
                        applicationInsightsId : null,
                        accountId : null,
                        appUserId : null,
                        configUrl : null,
                        start : function (n) {
                            function u(n) {
                                t[n] = function () {
                                    var i = arguments;
                                    t.queue.push(function () {
                                        t[n].apply(t, i)
                                    })
                                }
                            }
                            function f(n, t) {
                                if (n) {
                                    var u = r.createElement("script");
                                    u.type = "text/javascript";
                                    u.src = n;
                                    u.async = !0;
                                    u.onload = t;
                                    u.onerror = t;
                                    r.getElementsByTagName("script")[0].parentNode.appendChild(u) // Append script tag as last child
                                } else
                                    t()
                            }
                            var r = document,
                                t = this;
                            t.applicationInsightsId = n;
                            u("logEvent");
                            u("logPageView");
                            f(t.configUrl, function () {
                                f(scriptUrl)
                            });
                            t.start = function () {}
                        }
                    };
                    appInsights.start(appInsightsId);
                },

                logEvent: function() {
                    appInsights.logEvent();
                },

                logPageView: function() {
                    appInsights.logPageView();
                },

                deactivate: function () {
                    delete window.appInsights;
                }
            });
    });