define([
        "doh",
        "ct/mapping/map/Map",
        "ct/mapping/map/MapState",
        "ct/mapping/map/MapModel",
        "ct/mapping/map/ServiceNode",
        "ct/mapping/map/RasterLayerNode",
        "ct/mapping/map/GraphicsLayerNode",
        "ct/mapping/map/CategoryNode",
        "ct/mapping/map/EsriLayerFactory",
        "ct/mapping/map/EsriService",
        "ct/mapping/mapcontent/MappingResourceRegistryInitializer",
        "ct/mapping/mapcontent/ServiceTypes",
        "base/tests/util/MapModelUtils",
        "../MapController"
    ],
    function (
        doh,
        Map,
        MapState,
        MapModel,
        ServiceNode,
        RasterLayerNode,
        GraphicsLayerNode,
        CategoryNode,
        EsriLayerFactory,
        EsriService,
        MappingResourceRegistryInitializer,
        ServiceTypes,
        MapModelUtils,
        MapController
        ) {

        var mappingResourceRegistry = MapModelUtils.getPopulatedMRR();

        var service1 = new ServiceNode({
            id: "service1",
            service: mappingResourceRegistry.getMappingResourceByUniqueId("agiv_ferraris")
        });
        var service2 = new ServiceNode({
            id: "service2",
            service: mappingResourceRegistry.getMappingResourceByUniqueId("agiv_popp")
        });
        var service3 = new ServiceNode({
            id: "service3",
            service: mappingResourceRegistry.getMappingResourceByUniqueId("uvo_wasser01"),
            children: [
                new RasterLayerNode({
                    id: "service3/0",
                    layer: mappingResourceRegistry.getMappingResourceByUniqueId("uvo_wasser01/0")
                })
            ]
        });
        var service4 = new ServiceNode({
            id: "service4",
            service: mappingResourceRegistry.getMappingResourceByUniqueId("testpoi"),
            children: [
                new RasterLayerNode({
                    id: "service4/0",
                    layer: mappingResourceRegistry.getMappingResourceByUniqueId("testpoi/gewoon_kleuteronderwijs")
                })
            ]
        });

        var cat1 = new CategoryNode({
            id: "cat1",
            enabled: true
        });
        var cat2 = new CategoryNode({
            id: "cat2",
            enabled: true
        });
        var cat3 = new CategoryNode({
            id: "cat3",
            enabled: true
        });

        cat1.addChild(service1);
        cat1.addChild(service2);
        cat2.addChild(service3);
        cat3.addChild(service4);

        doh.register("agiv.bundles.splitviewmap.MapController Tests", [
            {
                name: "Test for historic map node structure sync",
                setUp: function () {
                    var mapState = new MapState();
                    var historicMapModel = this.historicMapModel = new MapModel({
                        id: "historic"
                    });
                    this.historicMap = new Map({
                        mapModel: historicMapModel,
                        mapState: mapState
                    });

                    var mapModel = this.mainMapModel = new MapModel();
                    this.mainMap = new Map({
                        mapModel: mapModel,
                        mapState: mapState
                    });
                },
                runTest: function () {
                    var controller = this.controller = new MapController();
                    controller._mainMap = this.mainMap;
                    controller._historicMap = this.historicMap;
                    var mapModel = this.mainMapModel;
                    var historicMapModel = this.historicMapModel;

                    // add pointer layer
                    var pointer = new GraphicsLayerNode({
                        id: "pointer",
                        nodeType: "POINT"
                    });
                    mapModel.getGlassPaneLayer().addChild(pointer);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    historicMapModel.getGlassPaneLayer().addChild(pointer);
                    historicMapModel.fireModelStructureChanged({
                        source: this
                    });

                    // add geometry layer
                    var g = new GraphicsLayerNode({
                        id: "drawing",
                        nodeType: "POINT" || "GRAPHIC"
                    });
                    mapModel.getGlassPaneLayer().addChild(g);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    controller._syncHistoricMapModelStructure({
                        action: "contentModelLayerRefresh",
                        graphicLayerId: "drawing",
                        source: {}
                    });
                    doh.assertEqual("drawing", controller._historicMap.mapModel.getNodeById("drawing").id,
                        "Expected drawing");

                    // disable geometry layer
                    mapModel.getNodeById("drawing").set("enabled", false);
                    mapModel.fireModelNodeStateChanged({
                        source: this
                    });
                    controller._syncHistoricMapModelState();
                    doh.assertEqual(false, controller._historicMap.mapModel.getNodeById("drawing").get("enabled"),
                        "Expected false");

                    // add poi layer
                    mapModel.getOperationalLayer().addChild(cat3);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    controller._syncHistoricMapModelStructure({
                        action: "contentModelLayerAdd"
                    });
                    doh.assertEqual(undefined, controller._historicMap.mapModel.getNodeById("cat3"),
                        "Expected undefined"); // only poi layer from search result

                    // add operational layer
                    mapModel.getOperationalLayer().addChild(cat2);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    controller._syncHistoricMapModelStructure({
                        action: "contentModelLayerAdd"
                    });
                    doh.assertEqual(undefined, controller._historicMap.mapModel.getNodeById("cat2"),
                        "Expected undefined");

                    // remove geometry layer using X icon
                    layer = mapModel.getNodeById("drawing");
                    mapModel.getGlassPaneLayer().removeChild(layer);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    controller._syncHistoricMapModelStructure({
                        action: "layerRemove",
                        layerId: "drawing"
                    });
                    doh.assertEqual(undefined, controller._historicMap.mapModel.getNodeById("drawing"),
                        "Expected no result");

                    // remove poi layer using X icon
                    mapModel.getOperationalLayer().addChild(cat3);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    controller._syncHistoricMapModelStructure({
                        action: "contentModelLayerAdd"
                    });

                    layer = mapModel.getNodeById("cat3");
                    mapModel.getOperationalLayer().removeChild(layer);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    controller._syncHistoricMapModelStructure({
                        action: "layerRemove",
                        layerId: "cat3"
                    });
                    doh.assertEqual(undefined, controller._historicMap.mapModel.getNodeById("cat3"),
                        "Expected no result");

                    // remove operational layer using X icon
                    mapModel.getOperationalLayer().addChild(cat2);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    controller._syncHistoricMapModelStructure({
                        action: "contentModelLayerAdd"
                    });

                    layer = mapModel.getNodeById("cat2");
                    mapModel.getOperationalLayer().removeChild(layer);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    controller._syncHistoricMapModelStructure({
                        action: "layerRemove",
                        layerId: "cat2"
                    });
                    doh.assertEqual(undefined, controller._historicMap.mapModel.getNodeById("cat2"),
                        "Expected no result");

                    // remove all graphic layers
                    mapModel.getGlassPaneLayer().addChild(g);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    controller._syncHistoricMapModelStructure({
                        action: "contentModelLayerRefresh",
                        graphicLayerId: "drawing",
                        source: {}
                    });

                    layer = mapModel.getNodeById("drawing");
                    mapModel.getGlassPaneLayer().removeChild(layer);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    controller._syncHistoricMapModelStructure({
                        action: "allLayersRemove"
                    });
                    doh.assertEqual(1, controller._historicMap.mapModel.getGlassPaneLayer().children.length,
                        "Expected 1 (pointer layer)");

                    // remove all operational layers
                    mapModel.getOperationalLayer().addChild(cat2);
                    mapModel.getOperationalLayer().addChild(cat3);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    controller._syncHistoricMapModelStructure({
                        action: "contentModelLayerAdd"
                    });

                    mapModel.getOperationalLayer().removeChildren();
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    controller._syncHistoricMapModelStructure({
                        action: "allLayersRemove",
                        layerIds: [
                            "cat2",
                            "cat3"
                        ]
                    });
                    doh.assertEqual(0, controller._historicMap.mapModel.getOperationalLayer().children.length,
                        "Expected 0");
                },
                tearDown: function () {
                    this.controller = null;
                    this.mainMap = null;
                    this.historicMap = null;
                    this.mainMapModel = null;
                    this.historicMapModel = null;
                }
            }
        ]);
    });