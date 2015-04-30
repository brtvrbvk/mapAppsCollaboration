/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 04.04.2014.
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "./SelectionListWidget"
    ],
    function (
        declare,
        Stateful,
        SelectionListWidget
        ) {
        return declare([Stateful],
            {
                constructor: function () {

                },

                createInstance: function () {

                    return new SelectionListWidget({
                        model: this.model,
                        thumbnailUrl: this.thumbnailUrl,
                        widgetRole: this.widgetRole,
                        currentApp: this._appCtx ? this._appCtx.applicationProperties : null,
                        writesToCollapseHandle: this.writesToCollapseHandle,
                        eventService: this._eventService,
                        topic: this.topic,
                        collapseTimeout: this.collapseTimeout,
                        autoCollapseFactor: this.autoCollapseFactor,
                        map: this._map,
                        secondMap: this._secondMap
                    });

                },

                destroyInstance: function (w) {
                    if (w) {
                        w.destroyRecursive();
                    }
                }
            }
        )
    }
);