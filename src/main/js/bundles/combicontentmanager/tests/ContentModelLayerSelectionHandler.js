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
        "base/ui/controls/themepanel/ContentModelController",
        "../searchintegration/ContentModelLayerSelectionHandler"
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
        ContentModelController,
        ContentModelLayerSelectionHandler
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
            enabled: false
        });
        var cat2 = new CategoryNode({
            id: "cat2",
            enabled: true
        });

        cat1.addChild(service1);
        cat2.addChild(service2);

        doh.register("agiv.bundles.combicontentmanager.ContentModelLayerSelectionHandler Tests", [
            {
                name: "Test for enabling theme/layer from search field",
                setUp: function () {
                    this.mapModel = new MapModel();
                    var contentModel = this.contentModel = new MapModel();
                    contentModel.getOperationalLayer().addChild(service1);
                    contentModel.fireModelStructureChanged({
                        source: this
                    });
                },
                runTest: function () {
                    var handler = this.handler = new ContentModelLayerSelectionHandler();
                    handler.modelctrl = new ContentModelController({
                        _contentModel: this.contentModel,
                        _mapModel: this.mapModel,
                        eventService: {
                            postEvent: function (
                                type,
                                obj
                                ) {
                            }
                        },
                        _approot: domConstruct.create("div", {})
                    });

                    var item = {
                        _properties: {
                            entries: {
                                result: {
                                    id: "service1",
                                    enabled: false
                                },
                                type: "CONTENTMODEL"
                            }
                        }
                    };
                    handler._handleResultSelection(item);
                    doh.assertEqual("service1", handler.modelctrl._mapModel.getNodeById("service1").id,
                        "Expected service1");
                    doh.assertEqual(true, handler.modelctrl._mapModel.getNodeById("service1").get("enabled"),
                        "Expected true");
                    doh.assertEqual(true, handler.modelctrl._contentModel.getNodeById("service1").get("enabled"),
                        "Expected true");
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.contentModel = null;
                    this.handler = null;
                }
            },
            {
                name: "Test for enabling theme/layer from search field when layer is already selected",
                setUp: function () {
                    this.mapModel = new MapModel();
                    var contentModel = this.contentModel = new MapModel();
                    contentModel.getOperationalLayer().addChild(service2);
                    contentModel.fireModelStructureChanged({
                        source: this
                    });
                },
                runTest: function () {
                    var handler = this.handler = new ContentModelLayerSelectionHandler();
                    handler.modelctrl = new ContentModelController({
                        _contentModel: this.contentModel,
                        _mapModel: this.mapModel,
                        eventService: {
                            postEvent: function (
                                type,
                                obj
                                ) {
                            }
                        },
                        _approot: domConstruct.create("div", {})
                    });

                    var item = {
                        _properties: {
                            entries: {
                                result: {
                                    id: "service2",
                                    enabled: true
                                },
                                type: "CONTENTMODEL"
                            }
                        }
                    };
                    handler._handleResultSelection(item);
                    doh.assertEqual("service2", handler.modelctrl._mapModel.getNodeById("service2").id,
                        "Expected service2");
                    doh.assertEqual(true, handler.modelctrl._mapModel.getNodeById("service2").get("enabled"),
                        "Expected true");
                    doh.assertEqual(true, handler.modelctrl._contentModel.getNodeById("service2").get("enabled"),
                        "Expected true");
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.contentModel = null;
                    this.handler = null;
                }
            }
        ]);
    });