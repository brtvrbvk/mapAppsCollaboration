define([
        "doh",
        "dojo/io-query",
        "ct/array",
        "ct/mapping/map/MapModel",
        "ct/mapping/map/ServiceNode",
        "ct/mapping/map/RasterLayerNode",
        "ct/mapping/map/CategoryNode",
        "ct/mapping/mapcontent/MappingResourceRegistryInitializer",
        "base/tests/util/MapModelUtils",
        "../MapModelParameterResolver"
    ],
    function (
        doh,
        d_ioq,
        ct_array,
        MapModel,
        ServiceNode,
        RasterLayerNode,
        CategoryNode,
        MappingResourceRegistryInitializer,
        MapModelUtils,
        MapModelParameterResolver
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

        var cat1 = new CategoryNode({
            id: "cat1",
            enabled: true
        });
        var cat2 = new CategoryNode({
            id: "cat2",
            enabled: true
        });

        cat1.addChild(service1);
        cat1.addChild(service2);
        cat2.addChild(service3);

        doh.register("agiv.bundles.splitviewmap.MapModelParameterResolver Tests", [
            {
                name: "Test for encoding/decoding params",
                setUp: function () {
                    this.agivMapModel = new MapModel({
                        id: "agiv"
                    });
                    this.agivMapModel.getBaseLayer().addChild(cat1);

                    var mapModel = this.mapModel = new MapModel();
                    mapModel.getOperationalLayer().addChild(cat2);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                },
                runTest: function () {
                    var resolver = this.resolver = new MapModelParameterResolver();
                    resolver._mapModel = this.mapModel;
                    resolver._secondMapModel = this.agivMapModel;

                    var url = resolver.encodeURLParameter();
                    var tmp = {
                        histSbn: "cat1"
                    };
                    doh.assertEqual(tmp, url, "Expected same attributes");

                    url = d_ioq.queryToObject('&histSbn=cat1&son=[{"id":"cat2","title":"","renderPriority":0,"enabled":true,"layers":[{"id":"service3","title":"uvo_wasser01"}]}]');
                    resolver.decodeURLParameter(url);
                    doh.assertEqual("cat1",
                        ct_array.arraySearchFirst(resolver._secondMapModel.getBaseLayer().children,
                            {enabled: true}).id, "Expected cat1");
                    doh.assertEqual("cat2",
                        ct_array.arraySearchFirst(resolver._secondMapModel.getOperationalLayer().children,
                            {enabled: true}).id, "Expected cat2");
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.agivMapModel = null;
                    this.resolver = null;
                }
            }
        ]);
    });