/**
 * COPYRIGHT 2016 con terra GmbH Germany
 * Created by fba on 04-11-16.
 */
define([
        "dojo/_base/declare",
        "./ProblemReportingWidget",
        "ct/Stateful"
    ],
    function (declare, ProblemReportingWidget, Stateful) {
        return declare([Stateful],
            {
                constructor: function () {

                },

                activate: function () {
                    this.i18n = this._i18n.get();

                },

                createInstance: function () {
                    return new ProblemReportingWidget(
                        {
                            i18n: this.i18n,
                            reportTypes: this.reportTypes,
                            dataTypes: this.dataTypes,
                            mapModel: this.mapModel,
                            copyTooltipTimeout: this.copyTooltipTimeout,
                            valueForDataLayerSelection: this.valueForDataLayerSelection,
                            eventService: this.eventService,
                            windowManager: this.windowManager,
                            stateStorer: this.stateStorer,
                            shareUrlProvider: this.shareUrlProvider
                        }
                    );
                }
            }
        );
    }
);