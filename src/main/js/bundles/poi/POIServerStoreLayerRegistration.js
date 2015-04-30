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
        "ct/_when",
        "ct/Stateful",
        "ct/mapping/mapcontent/ServiceTypes",
//    "ct/mapping/mapcontent/NodeTypes",
        "ct/mapping/map/EsriLayerFactory",
        "ct/mapping/map/EsriService",
        "./POILookupGraphicResolver",
        "./POISymbolLookupStrategyFactory",
        "./POISymbolLookupStrategy",
        "base/store/model/GraphicLayerDataModel",
        "base/mapping/graphics/StoreGraphicsLayer",
        "base/store/poi/POIServerStore"
    ],

    function (
        declare,
        d_lang,
        ct_when,
        Stateful,
        ServiceTypes,
        EsriLayerFactory,
        EsriService,
        POILookupGraphicResolver,
        POISymbolLookupStrategyFactory,
        POISymbolLookupStrategy,
        GraphicLayerDataModel,
        StoreGraphicsLayer,
        POIServerStore
        ) {
        return declare([Stateful], {


            activate: function (componentCtx) {

                ServiceTypes.POI = "POI";
                var bCtx = componentCtx.getBundleContext();

                var that = this;
                EsriLayerFactory.globalServiceFactories[ServiceTypes.POI] = {
                    create: function (
                        node,
                        url
                        ) {
                        if (node.children.length !== 1) {
                            console.error("No valid POI layer defined");
                            return null;
                        }
                        return new EsriService({
                            mapModelNode: node,
                            isGraphicLayer: true,
                            createEsriLayer: function () {
                                var poitype = null,
                                    poiID = null,
                                    elem;
                                if (node.hasChildren()) {
                                    if (node.children.length === 1) {
                                        elem = node.children[0];
                                        if (!elem) {
                                            throw new Error("No valid POI layer defined");
                                        }
                                        poiID = elem.layer.poiID;
                                        if (!poiID) {
                                            poitype = elem.layer.layerId;
                                        }
                                    } else {
                                        throw new Error("not a valid POI descriptor");
                                    }
                                } else {
                                    throw new Error("No valid POI layer defined");
                                }

                                if (!that.symbolLookupStrategyFactory) {
                                    var opts = d_lang.mixin(that.symbolFactoryOpts,
                                        {mapState: that.mapState});
                                    that.symbolLookupStrategyFactory = new POISymbolLookupStrategyFactory(opts);
                                }

                                var store = new POIServerStore({
                                    target: node.service.serviceUrl,
                                    poitype: poitype,
                                    poiID: poiID,
                                    id: "POILayerStore" + new Date().getTime(),
                                    currentScale: that.mapState ? that.mapState.getViewPort().getScale() : null,
                                    srs: that.mapState ? that.mapState.getSpatialReference().wkid : null,
                                    queryOptions: {
                                        "maxcount": that.maxcount
                                    }
                                });

                                var s = bCtx.registerService(["ct.framework.api.EventHandler"],
                                    store, {
                                        "Event-Topics": [
                                            {
                                                "topic": "ct/mapstate/SCALE_CHANGED",
                                                "method": "_handleScaleChanged"
                                            }
                                        ]
                                    });
                                var model = new GraphicLayerDataModel({
                                    "datasourceFilter": {
                                        "query": {},
                                        "queryOptions": {
                                            "enableCaching": true
                                        }
                                    },
                                    "id": elem ? elem.parent.id + "model" : "POILayerStore" + new Date().getTime() + "model"
                                });

                                var graphicResolver, lookupTable,
                                    layerElem = node.children && node.children[0] && node.children[0].layer && node.children[0].layer;
                                if (layerElem) {
                                    lookupTable = layerElem.lookupTable,
                                        lookupAttributeName = layerElem.lookupAttributeName;
                                }

                                if (lookupTable) {
                                    graphicResolver = new POILookupGraphicResolver({
                                        symbolLookupStrategy: new POISymbolLookupStrategy({
                                            lookupTable: lookupTable,
                                            lookupAttributeName: lookupAttributeName ? lookupAttributeName : null,
                                            mapState: that.mapState
                                        })
                                    });
                                } else {
                                    graphicResolver = new POILookupGraphicResolver({
                                        symbolLookupStrategyFactory: that.symbolLookupStrategyFactory
                                    });
                                }

                                var clusterGraphicResolver = new POILookupGraphicResolver({
                                    symbolLookupStrategy: new POISymbolLookupStrategy({
                                        lookupTable: that.clusterLookupTable,
                                        mapState: that.mapState
                                    })
                                });

                                var layer = new StoreGraphicsLayer({
                                    store: model,
                                    showClusterLabels: that.showClusterLabels,
                                    graphicResolver: graphicResolver,
                                    clusterGraphicResolver: clusterGraphicResolver,
                                    highlightFeatures: elem ? elem.highlightFeatures || [] : []
                                });
                                model.setDatasource(store);
                                var dm = bCtx.registerService(["poi.POIDataModel"], model,
                                    {});

                                var osm = layer._setMap;
                                layer._setMap = function () {
                                    if (!dm) {
                                        dm = bCtx.registerService(["poi.POIDataModel"], model,
                                            {});
                                    }
                                    if (!s) {
                                        s = bCtx.registerService(["ct.framework.api.EventHandler"],
                                            store, {
                                                "Event-Topics": [
                                                    {
                                                        "topic": "ct/mapstate/SCALE_CHANGED",
                                                        "method": "_handleScaleChanged"
                                                    }
                                                ]
                                            });
                                    }
                                    return osm.apply(this, arguments);
                                };

                                var oc = layer._unsetMap;
                                layer._unsetMap = function () {
                                    oc.apply(this, arguments);
                                    if (s) {
                                        s.unregister();
                                        s = null;
                                    }
                                    if (dm) {
                                        dm.unregister();
                                        dm = null;
                                    }
                                };
                                model.layer = layer;
                                node.set("store", model);
                                node.set("graphicResolver", layer.get("graphicResolver"));
                                node.set("layerObject", layer);
                                model.setMapModelNode(node);
                                // sync changes on store property
                                this.connectP(node, "store", function (
                                    name,
                                    oldStore,
                                    newStore
                                    ) {
                                    layer.set("store", newStore);
                                });
                                this.connectP(elem, "highlightFeatures", function (
                                    name,
                                    oldhighlightFeatures,
                                    newhighlightFeatures
                                    ) {
                                    layer.set("highlightFeatures", newhighlightFeatures);
                                });
                                // sync graphic resolver property
                                this.connectP(node, "graphicResolver", function (
                                    name,
                                    oldResolver,
                                    newResolver
                                    ) {
                                    layer.set("graphicResolver", newResolver);
                                });
                                this.connectP(node, "enablePaging", function (
                                    name,
                                    oldValue,
                                    newValue
                                    ) {
                                    layer.set("enablePaging", newValue);
                                });
                                this.connectP(node, "startItemIndex", function (
                                    name,
                                    oldValue,
                                    newValue
                                    ) {
                                    layer.set("startItemIndex", newValue);
                                });
                                this.connectP(node, "itemsPerPage", function (
                                    name,
                                    oldValue,
                                    newValue
                                    ) {
                                    layer.set("itemsPerPage", newValue);
                                });
                                return layer;
                            }
                        });
                    }
                };
//            EsriLayerFactory.globalNodeTypeLayerFactories[NodeTypes.POI_STORE]= {
//                create : function(node) {
//                    var show = !d_kernel.isIE;
//                    var opts = d_lang.mixin({
//                        displayOnPan : show
//                    },node.get("options"),{
//                        store : node.get("store"),
//                        graphicResolver :  node.get("graphicResolver"),
//                        enablePaging: node.get("enablePaging"),
//                        startItemIndex: node.get("startItemIndex"),
//                        itemsPerPage:  node.get("itemsPerPage")
//                    });
//                    return new EsriService({
//                        mapModelNode: node,
//                        isGraphicLayer : true,
//                        createEsriLayer : function() {
//                            var layer = new POIServerStoreLayer(opts);
//                            // sync changes on store property
//                            this.connectP(node,"store",function(name, oldStore, newStore){
//                                layer.set("store",newStore);
//                            });
//                            // sync graphic resolver property
//                            this.connectP(node,"graphicResolver",function(name, oldResolver, newResolver){
//                                layer.set("graphicResolver",newResolver);
//                            });
//                            this.connectP(node, "enablePaging", function(name, oldValue, newValue) {
//                                layer.set("enablePaging", newValue);
//                            });
//                            this.connectP(node, "startItemIndex", function(name, oldValue, newValue) {
//                                layer.set("startItemIndex", newValue);
//                            });
//                            this.connectP(node, "itemsPerPage", function(name, oldValue, newValue) {
//                                layer.set("itemsPerPage", newValue);
//                            });
//                            return layer;
//                        }
//                    });
//                }
//            };
            },
            deactivate: function () {
                delete EsriLayerFactory.globalServiceFactories[ServiceTypes.POI];
//                delete EsriLayerFactory.globalNodeTypeLayerFactories[NodeTypes.POI_STORE];
                delete ServiceTypes.POI;
//                delete NodeTypes.POI_STORE;
            }
        });
    });