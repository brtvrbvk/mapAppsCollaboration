define([
        "dojo/_base/declare"
    ],
    function (declare) {
        return declare([],
            {
                constructor: function (props) {

                    var createAppInsights = function (ai) {
                        function f(t) {
                            ai[t] = function () {
                                var i = arguments;
                                ai.queue.push(function () {
                                    ai[t].apply(ai, i)
                                })
                            }
                        }

                        var t = document,
                            r = "script",
                            u = t.createElement(r),
                            i;
                        for (u.src = ai.url, t.getElementsByTagName(r)[0].parentNode.appendChild(u), ai.cookie = t.cookie, ai.queue = [], i = [
                            "Event",
                            "Exception",
                            "Metric",
                            "PageView",
                            "Trace"
                        ]; i.length;)
                            f("track" + i.pop());
                        return ai;
                    };

                    window.appInsights = window.appInsights || createAppInsights({
                        iKey: props.iKey || "e9ee8707-117b-4d4f-a898-ba70b5478078",
                        url: props.scriptUrl || "//az416426.vo.msecnd.net/scripts/a/ai.0.js"
                    });
                },

                trackEvent: function () {
                    var args = arguments.length > 0 ? arguments : undefined;
                    appInsights.trackEvent(args);
                },

                trackException: function () {
                    var args = arguments.length > 0 ? arguments : undefined;
                    appInsights.trackException(args);
                },

                trackMetric: function () {
                    var args = arguments.length > 0 ? arguments : undefined;
                    appInsights.trackMetric(args);
                },

                trackPageView: function () {
                    var args = arguments.length > 0 ? arguments : undefined;
                    appInsights.trackPageView(args);
                },

                trackTrace: function () {
                    var args = arguments.length > 0 ? arguments : undefined;
                    appInsights.trackTrace(args);
                },

                deactivate: function () {
                    delete window.appInsights;
                }
            });
    });