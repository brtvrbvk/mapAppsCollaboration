/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 24.02.14.
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "./ElevationWidget"
    ],
    function (
        declare,
        Stateful,
        ElevationWidget
        ) {
        return declare([Stateful],
            {
                constructor: function () {

                },

                activate: function () {
                    this._inst = new ElevationWidget({
                        esriMap: this.esriMap,
                        ct: this.ct,
                        i18n: this._i18n.get().ui,
                        eventService: this._eventService,
                        chartRenderingOptions: this.chartRenderingOptions,
                        decimalPlaces: this.decimalPlaces
                    });
                },

                createInstance: function () {
                    return this._inst;
                },

                destroyInstance: function (i) {
                    if (i) {
                        i.destroy();
                    }
                }
            }
        )
    }
);