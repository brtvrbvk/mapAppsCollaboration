define([
        "doh",
        "dojo/_base/array",
        "dojo/io-query",
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
        "base/ui/controls/themepanel/ParametrizedURLResolver",
        "base/ui/controls/themepanel/ContentModelController"
    ],
    function (
        doh,
        d_array,
        d_ioq,
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
        ParametrizedURLResolver,
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
            enabled: true
        });
        var cat2 = new CategoryNode({
            id: "cat2",
            enabled: true
        });

        cat1.addChild(service1);
        cat2.addChild(service2);

        doh.register("agiv.bundles.combicontentmanager.ParametrizedURLResolver Tests", [
            {
                name: "Test for encoding/decoding params - no params",
                setUp: function () {
                    this.mapModel = new MapModel();
                    this.contentModel = new MapModel();
                },
                runTest: function () {
                    var resolver = this.resolver = new ParametrizedURLResolver();
                    resolver._contentModel = this.contentModel;
                    resolver._mapModel = this.mapModel;
                    resolver._contentModelController = new ContentModelController({
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

                    var url = d_ioq.queryToObject('&son=[]');
                    resolver.decodeURLParameter(url);
                    doh.assertEqual(0, resolver._contentModel.getOperationalLayer().children.length, "Expected 0");
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.contentModel = null;
                    this.resolver = null;
                }
            },
            {
                name: "Test for encoding/decoding params",
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
                    var resolver = this.resolver = new ParametrizedURLResolver();
                    resolver._contentModel = this.contentModel;
                    resolver._mapModel = this.mapModel;
                    resolver._contentModelController = new ContentModelController({
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

                    var tmp = [
                        "service1",
                        "service2"
                    ];

                    var url = d_ioq.queryToObject('&son=[{"id":"service2","title":"","renderPriority":5,"opacity":0.5,"enabled":true,"layers":[{"id":"testpoi/gewoon_kleuteronderwijs","title":""}]}]');
                    resolver.decodeURLParameter(url);

                    var resultNode = this.mapModel.getNodeById("service2");
                    doh.assertEqual(true, resultNode.get("enabled"), "Expected true");
                    doh.assertEqual(0.5, resultNode.get("opacity"), "Expected 0.5");
                    doh.assertEqual(5, resultNode.get("renderPriority"), "Expected 5");
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.contentModel = null;
                    this.resolver = null;
                }
            }
        ]);
    });