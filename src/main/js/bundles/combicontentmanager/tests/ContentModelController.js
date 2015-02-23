define([
        "doh",
        "dojo/dom-construct",
        "ct/mapping/map/MapModel",
        "ct/mapping/map/ServiceNode",
        "ct/mapping/map/RasterLayerNode",
        "ct/mapping/map/CategoryNode",
        "ct/mapping/map/EsriLayerFactory",
        "ct/mapping/map/EsriService",
        "ct/mapping/mapcontent/MappingResourceRegistryInitializer",
        "ct/mapping/mapcontent/ServiceTypes",
        "base/tests/util/MapModelUtils",
        "base/ui/controls/themepanel/ContentModelController"
    ],
    function (
        doh,
        domConstruct,
        MapModel,
        ServiceNode,
        RasterLayerNode,
        CategoryNode,
        EsriLayerFactory,
        EsriService,
        MappingResourceRegistryInitializer,
        ServiceTypes,
        MapModelUtils,
        ContentModelController
        ) {

        var mappingResourceRegistry = MapModelUtils.getPopulatedMRR();

        var service1 = new ServiceNode({
            id: "service1",
            service: mappingResourceRegistry.getMappingResourceByUniqueId("uvo_wasser01"),
            children: [
                new RasterLayerNode({
                    id: "service1/0",
                    layer: mappingResourceRegistry.getMappingResourceByUniqueId("uvo_wasser01/0")
                })
            ]
        });
        var service2 = new ServiceNode({
            id: "service2",
            service: mappingResourceRegistry.getMappingResourceByUniqueId("testpoi"),
            children: [
                new RasterLayerNode({
                    id: "service2/0",
                    layer: mappingResourceRegistry.getMappingResourceByUniqueId("testpoi/gewoon_kleuteronderwijs")
                })
            ]
        });

        var cat1 = new CategoryNode({
            id: "cat1",
            enabled: false,
            renderPriority: 2
        });
        var cat2 = new CategoryNode({
            id: "cat2",
            enabled: false,
            renderPriority: 100
        });

        cat1.addChild(service1);
        cat2.addChild(service2);

        doh.register("agiv.bundles.combicontentmanager.ContentModelController Tests", [
            {
                name: "Test for enabling/disabling layer in contentmodel",
                setUp: function () {
                    this.mapModel = new MapModel();
                    var contentModel = this.contentModel = new MapModel();
                    contentModel.getOperationalLayer().addChild(cat2);
                    contentModel.fireModelStructureChanged({
                        source: this
                    });
                },
                runTest: function () {
                    var controller = this.controller = new ContentModelController({
                        _contentModel: this.contentModel,
                        _mapModel: this.mapModel,
                        eventService: {
                            postEvent: function (
                                type,
                                obj
                                ) {
                            }
                        },
                        _approot: domConstruct.create("div",
                            {})
                    });

                    // enable
                    controller.enableLayerInContentModel({
                        id: "service2"
                    });
                    doh.assertEqual("service2", controller._contentModel.getEnabledServiceNodes()[0].id,
                        "Expected service2");
                    doh.assertEqual("service2", controller._mapModel.getNodeById("service2").id,
                        "Expected service2");

                    // disable
                    var layer = controller._contentModel.getNodeById("service2");
                    controller.disableLayerInContentModel(layer);
                    doh.assertEqual(0, controller._contentModel.getEnabledServiceNodes().length, "Expected 0");
                    doh.assertEqual(undefined, controller._mapModel.getNodeById("service2"), "Expected no result");
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.contentModel = null;
                    this.controller = null;
                }
            },
            {
                name: "Test for removing all layers",
                setUp: function () {
                    this.mapModel = new MapModel();
                    var contentModel = this.contentModel = new MapModel();
                    contentModel.getOperationalLayer().addChild(cat1);
                    contentModel.getOperationalLayer().addChild(cat2);
                    contentModel.fireModelStructureChanged({
                        source: this
                    });
                },
                runTest: function () {
                    var controller = this.controller = new ContentModelController({
                        _contentModel: this.contentModel,
                        _mapModel: this.mapModel,
                        eventService: {
                            postEvent: function (
                                type,
                                obj
                                ) {
                            }
                        },
                        _approot: domConstruct.create("div",
                            {})
                    });

                    // enable layers
                    controller.enableLayerInContentModel({
                        id: "service1"
                    });
                    controller.enableLayerInContentModel({
                        id: "service2"
                    });

                    // remove
                    controller.removeAllLayers();
                    doh.assertEqual(0, controller._contentModel.getEnabledServiceNodes().length, "Expected 0");
                    doh.assertEqual(0, controller._mapModel.getOperationalLayer().children.length, "Expected 0");
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.contentModel = null;
                    this.controller = null;
                }
            },
            {
                name: "Test for setting render priority",
                setUp: function () {
                    var contentModel = this.contentModel = new MapModel();
                    contentModel.getOperationalLayer().addChild(cat1);
                    contentModel.getOperationalLayer().addChild(cat2);
                    contentModel.fireModelStructureChanged({
                        source: this
                    });

                    var mapModel = this.mapModel = new MapModel();
                    mapModel.getOperationalLayer().addChild(cat1);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                },
                runTest: function () {
                    var controller = this.controller = new ContentModelController({
                        _contentModel: this.contentModel,
                        _mapModel: this.mapModel,
                        eventService: {
                            postEvent: function (
                                type,
                                obj
                                ) {
                            }
                        },
                        _approot: domConstruct.create("div",
                            {})
                    });

                    var layer = controller._contentModel.getNodeById("service2");
                    controller._setNextRenderPriority(layer);
                    doh.assertEqual(3, controller._contentModel.getNodeById("service2").renderPriority,
                        "Expected 3");
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.contentModel = null;
                    this.controller = null;
                }
            },
            {
                name: "Test for utility methods in setting enable property",
                setUp: function () {
                    this.mapModel = new MapModel();
                    var contentModel = this.contentModel = new MapModel();
                    contentModel.getOperationalLayer().addChild(cat1);
                    contentModel.getOperationalLayer().addChild(cat2);
                    contentModel.fireModelStructureChanged({
                        source: this
                    });
                },
                runTest: function () {
                    var controller = this.controller = new ContentModelController({
                        _contentModel: this.contentModel,
                        _mapModel: this.mapModel,
                        eventService: {
                            postEvent: function (
                                type,
                                obj
                                ) {
                            }
                        },
                        _approot: domConstruct.create("div",
                            {})
                    });

                    var layer = controller._contentModel.getNodeById("service2");
                    layer.set("enabled", true);
                    doh.assertEqual(true, controller._isOnlyNodeSelected(layer), "Expected true");

                    controller._setEnableProperty(layer, false);
                    doh.assertEqual(false, layer.get("enabled"), "Expected false");
                    doh.assertEqual(false, layer.parent.get("enabled"), "Expected false");
                    doh.assertEqual(false, layer.children[0].get("enabled"), "Expected false");
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.contentModel = null;
                    this.controller = null;
                }
            }
        ]);
    });