define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ct/mapping/map/MapState"
    ],
    function (
        declare,
        d_lang,
        MapState
        ) {
        /*
         * COPYRIGHT 2010-2011 con terra GmbH Germany
         */
        return declare([MapState],
            /**
             * @lends agiv.bundles.splitviewmap.HistoricMapStateFactory.prototype
             */
            {
                activate: function () {
                    this._properties = d_lang.mixin(this._properties, {
                        viewport: this._mainMapState.getViewPort(),
                        initialExtent: this._mainMapState.getInitialExtent(),
                        lods: this._mainMapState.getLODs()
                    });
                },

                createInstance: function () {
                    this.activate();
                    return (this._mapState = new MapState(this._properties));
                },

                destroyInstance: function () {
                    this._mapState = null;
                }
            });
    });