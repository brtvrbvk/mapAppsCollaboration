define([
        "dojo/_base/declare"
    ],
    function (declare) {
        return declare([],
            {
                activate: function() {
                    var appInsights = this.appInsights;

                    appInsights.trackPageView && appInsights.trackPageView();
                    appInsights.logPageView && appInsights.logPageView();
                }
            });
    });