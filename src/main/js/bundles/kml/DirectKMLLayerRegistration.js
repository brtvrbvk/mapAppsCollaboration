define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/Deferred",
        "ct/_when",
        "ct/Stateful",
        "ct/async",
        "ct/mapping/mapcontent/ServiceTypes",
        "./DelayedFeatureLayer",
        "ct/mapping/map/EsriLayerFactory",
        "ct/mapping/map/EsriService",
        "ct/request",
        "ct/array",
        "esri/geometry/jsonUtils",
        "esri/geometry/Extent"
    ],
    function (
        declare,
        d_lang,
        d_array,
        Deferred,
        ct_when,
        Stateful,
        ct_async,
        ServiceTypes,
        FeatureLayer,
        EsriLayerFactory,
        EsriService,
        ct_request,
        ct_array,
        geom_jsonUtils,
        Extent
        ) {
        return declare([Stateful],
            {
                constructor: function () {

                },

                activate: function () {

                    ServiceTypes.DirectKML = "DirectKML";
                    var that = this;
                    EsriLayerFactory.globalServiceFactories[ServiceTypes.DirectKML] = {
                        create: function (
                            node,
                            url
                            ) {
                            return new EsriService({
                                mapModelNode: node,
                                isGraphicLayer: true,
                                url: url,
                                createEsriLayer: function () {
                                    var options = {},
                                        def = new Deferred();
                                    ct_when(ct_request({
                                        url: this.url,
                                        handleAs: "xml"
                                    }), function (kml) {

                                        ct_when(that.kmlParser.parse(kml, url, this.mapModelNode.options),
                                            function (collection) {
                                                def.resolve(collection);
                                            }, function (error) {
                                                def.reject(error);
                                            }, this);

                                    }, function (e) {
                                        def.reject(e);
                                    }, this);
                                    return FeatureLayer(def, options);
                                }
                            });
                        }
                    };

                },

                deactivate: function () {
                    delete EsriLayerFactory.globalServiceFactories[ServiceTypes.DirectKML];
                    delete ServiceTypes.DirectKML;

                }
            }
        );
    }
);