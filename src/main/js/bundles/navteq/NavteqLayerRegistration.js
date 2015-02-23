/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ct/mapping/mapcontent/ServiceTypes",
        "ct/mapping/map/EsriLayerFactory",
        "ct/mapping/map/EsriService",
        "./NavteqLayer"
    ],
    function (
        declare,
        d_lang,
        ServiceTypes,
        EsriLayerFactory,
        EsriService,
        NavteqLayer
        ) {
        return declare([], {
            activate: function () {
                ServiceTypes.NAVTEQ = "NAVTEQ";
                EsriLayerFactory.globalServiceFactories[ServiceTypes.NAVTEQ] = {
                    create: function (
                        node,
                        url
                        ) {
                        return new EsriService({
                            mapModelNode: node,
                            createEsriLayer: function () {
                                var opts = node.get("options");
                                var children = node.get("children");
                                if (children.length > 1) {
                                    //TODO better exceptionhandling
                                    return null;
                                }
                                d_lang.mixin(opts, {
                                    layer: children[0].layer.layerId
                                });
                                return new NavteqLayer(url, opts);
                            }
                        });
                    }
                };
            },
            deactivate: function () {
                delete EsriLayerFactory.globalServiceFactories[ServiceTypes.NAVTEQ];
                delete ServiceTypes.NAVTEQ;
            }
        });
    });
