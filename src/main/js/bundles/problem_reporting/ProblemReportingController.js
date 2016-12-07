/**
 * COPYRIGHT 2016 con terra GmbH Germany
 * Created by fba on 04-11-16.
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "ct/_Connect",
        "ct/_when",
        "dojo/window",
        "ct/request",
        "dojo/json"
    ],
    function (declare, Stateful, _Connect, ct_when, d_window, ct_request, JSON) {
        return declare([Stateful, _Connect],
            {
                constructor: function () {

                },

                activate: function () {

                },

                _sendReport: function (evt) {
                    this.eventService.postEvent("ct/tool/set/DEACTIVATE", {toolId: "problem_reporting_toggletool"});
                    this.responseWidget.set("loading", true);
                    this.eventService.postEvent("ct/tool/set/ACTIVATE", {toolId: "report_response_toggletool"});
                    var data = evt.getProperty("report");
                    data.browserInfo = {};
                    data.browserInfo.userAgent = navigator.userAgent;
                    var viewport = d_window.getBox();
                    data.browserInfo.width = viewport.w;
                    data.browserInfo.height = viewport.h;
                    data.browserInfo.orientation = viewport.w <= viewport.h ? "portrait" : "landscape";

                    ct_when(ct_request.requestJSON({
                        url: this.reportingUrl + "/sendreport",
                        contentType: "application/json",
                        postData: JSON.stringify(data)
                    }, {usePost: true}), function () {
                        this.responseWidget.set("success", true);
                    }, function (error) {
                        this.responseWidget.set("error", true);
                    }, this);
                }
                ,

                deactivate: function () {

                }
            }
        );
    }
);