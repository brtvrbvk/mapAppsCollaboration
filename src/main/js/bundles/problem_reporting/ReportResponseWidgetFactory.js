/**
 * COPYRIGHT 2016 con terra GmbH Germany
 * Created by fba on 04-11-16.
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "ct/_Connect",
        "./ReportResponseWidget"
    ],
    function (declare, Stateful, _Connect, ReportResponseWidget) {
        return declare([Stateful, _Connect],
            {
                constructor: function () {

                },

                activate: function () {
                    this.instance = new ReportResponseWidget({eventService: this.eventService, i18n: this._i18n.get()});
                },

                createInstance: function () {
                    return this.instance;
                },

                deactivate: function () {

                }
            }
        );
    }
);