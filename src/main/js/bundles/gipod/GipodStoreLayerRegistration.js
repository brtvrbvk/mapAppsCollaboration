/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 30.09.13
 * Time: 09:55
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ct/_when",
        "ct/Stateful",
        "ct/mapping/mapcontent/ServiceTypes",
        "ct/mapping/map/EsriLayerFactory",
        "ct/mapping/map/EsriService",
        "base/store/gipod/GipodStore",
        "base/store/model/GraphicLayerDataModel",
        "base/mapping/graphics/StoreGraphicsLayer",
        "base/mapping/graphics/StoreLookupGraphicResolver",
        "./GipodSymbolLookupStrategy"
    ],
    function (
        declare,
        d_lang,
        ct_when,
        Stateful,
        ServiceTypes,
        EsriLayerFactory,
        EsriService,
        GipodStore,
        GraphicLayerDataModel,
        StoreGraphicsLayer,
        StoreLookupGraphicResolver,
        GipodSymbolLookupStrategy
        ) {
        return declare([Stateful],
            {
                constructor: function () {

                },

                activate: function (componentCtx) {

                    ServiceTypes.GIPOD = "GIPOD";

                    var bCtx = componentCtx.getBundleContext();

                    var that = this;

                    EsriLayerFactory.globalServiceFactories[ServiceTypes.GIPOD] = {

                        create: function (
                            node,
                            url
                            ) {

                            return new EsriService({

                                mapModelNode: node,
                                isGraphicLayer: true,
                                createEsriLayer: function () {

                                    var gipodType;

                                    if (node.hasChildren()) {
                                        if (node.children.length > 1) {
                                            //handle exception
                                        } else {
                                            var elem = node.children[0];
                                            gipodType = elem.layer.layerId;
                                        }
                                    }

                                    var today = new Date();
                                    today.setHours(0);
                                    today.setMinutes(0);
                                    today.setSeconds(0);
                                    today.setMilliseconds(0);

                                    var ed = new Date();
                                    ed.setTime(today.getTime());
//                                    if (ed.getMonth()===11){
//                                        ed.setFullYear(ed.getFullYear()+1);
//                                    }
//                                    ed.setMonth((ed.getMonth()+1)%12);

                                    var t = Math.round(new Date().getTime() * Math.random());
                                    var store = new GipodStore({
                                        target: node.service.serviceUrl,
                                        id: "GipodLayerStore" + t,
                                        gipodType: gipodType,
                                        fixedQueryOptions: {
                                            crs: 3857,
                                            limit: 5000,
                                            offset: 0
                                        },
                                        queryOptions: {
                                            startdate: today,
                                            enddate: ed
                                        },
                                        filterOptions: elem.layer.filterOptions || [],
                                        scaleThreshold: that.clusterScaleThreshold
                                    });

//                                    var s = bCtx.registerService(["ct.framework.api.EventHandler"], store, {
//                                        "Event-Topics":[
//                                            {
//                                                "topic":"ct/mapstate/SCALE_CHANGED",
//                                                "method":"_handleScaleChanged"
//                                            }
//                                        ]
//                                    });

                                    var id = "gipod.GipodStore." + gipodType;
                                    var s = bCtx.registerService([id], store, {});

                                    var model = new GraphicLayerDataModel({
                                        "datasourceFilter": {
                                            "query": {},
                                            "queryOptions": {
                                                "enableCaching": true
//                                        ,
//                                        "count": 10,
//                                        "start": 0
                                            }
                                        },
                                        "id": "GipodLayerStoreModel" + t + "model"
                                    });

                                    var graphicResolver = new StoreLookupGraphicResolver({
                                        symbolLookupStrategy: new GipodSymbolLookupStrategy({
                                            lookupAttributeName: "gipodType",
                                            lookupTable: that.lookupTable
                                        })
                                    });

                                    var clusterGraphicResolver = new StoreLookupGraphicResolver({
                                        symbolLookupStrategy: new GipodSymbolLookupStrategy({
                                            lookupAttributeName: "gipodType",
                                            lookupTable: that.clusterLookupTable
                                        })
                                    });

                                    var layer = new StoreGraphicsLayer({
                                        store: model,
                                        showClusterLabels: that.showClusterLabels,
                                        graphicResolver: graphicResolver,
                                        clusterGraphicResolver: clusterGraphicResolver
                                    });

                                    model.setDatasource(store);
                                    var dm = bCtx.registerService(["gipod.GipodDataModel"],
                                        model,
                                        {});

                                    var oc = layer._unsetMap;
                                    layer._unsetMap = function () {
                                        oc.apply(this,
                                            arguments);
                                        if (dm) {
                                            dm.unregister();
                                        }
                                        if (s) {
                                            s.unregister();
                                        }
                                        s = null;
                                        dm = null;
                                    };

                                    var osm = layer._setMap;
                                    layer._setMap = function () {
                                        if (!dm) {
                                            dm = bCtx.registerService(["gipod.GipodDataModel"],
                                                model,
                                                {});
                                        }
                                        if (!s) {
                                            s = bCtx.registerService([id], store, {});
                                        }
                                        return osm.apply(this,
                                            arguments);
                                    };
                                    node.set("store",
                                        model);
                                    node.set("graphicResolver",
                                        layer.get("graphicResolver"));
                                    node.set("layerObject",
                                        layer);
                                    model.setMapModelNode(node);
                                    // sync changes on store property
                                    this.connectP(node,
                                        "store",
                                        function (
                                            name,
                                            oldStore,
                                            newStore
                                            ) {
                                            layer.set("store",
                                                newStore);
                                        });
                                    // sync graphic resolver property
                                    this.connectP(node,
                                        "graphicResolver",
                                        function (
                                            name,
                                            oldResolver,
                                            newResolver
                                            ) {
                                            layer.set("graphicResolver",
                                                newResolver);
                                        });
                                    this.connectP(node,
                                        "enablePaging",
                                        function (
                                            name,
                                            oldValue,
                                            newValue
                                            ) {
                                            layer.set("enablePaging",
                                                newValue);
                                        });
                                    this.connectP(node,
                                        "startItemIndex",
                                        function (
                                            name,
                                            oldValue,
                                            newValue
                                            ) {
                                            layer.set("startItemIndex",
                                                newValue);
                                        });
                                    this.connectP(node,
                                        "itemsPerPage",
                                        function (
                                            name,
                                            oldValue,
                                            newValue
                                            ) {
                                            layer.set("itemsPerPage",
                                                newValue);
                                        });
                                    return layer;
                                }
                            });
                        }
                    }

                },

                deactivate: function () {

                    delete EsriLayerFactory.globalServiceFactories[ServiceTypes.GIPOD];
                    delete ServiceTypes.GIPOD;

                }
            }
        )
    }
);