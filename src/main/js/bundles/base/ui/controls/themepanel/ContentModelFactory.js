define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "ct/mapping/map/MapModel",
        "ct/mapping/map/MapModelInitializer"
    ],
    function (
        d_lang,
        declare,
        MapModel,
        MapModelInitializer
        ) {
        /*
         * COPYRIGHT 2011 con terra GmbH Germany
         */
        return declare([],
            {
                constructor: function () {
                },

                activate: function () {
                    this._props = this._properties;
                    var mapModel = new MapModel({
                        id: this._props.mapModelId
                    });
                    var d = this._initMapModel(mapModel);
                    d.then(d_lang.hitch(this, this._setMapModel),
                        function (err) {
                            console.error("ContentModel:", err);
                        });
                    return d;
                },

                _initMapModel: function (mapModel) {
                    var mapModelInitializer = new MapModelInitializer({
                        mapInitData: {
                            maps: [this._props.serviceDefinitions]
                        },
                        mapResourceRegistry: this._mrr,
                        mapModel: mapModel
                    });
                    return mapModelInitializer.initMapModel();
                },

                _setMapModel: function (mapModel) {
                    this._contentModel = mapModel;
                },

                createInstance: function () {
                    return this._contentModel;
                },

                destroyInstance: function (w) {
                    this._contentModel = null;
                },

                deactivate: function () {
                    this._contentModel = null;
                }
            });
    });