define([
        "doh",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/_base/connect",
        "dojo/_base/Deferred",
        "dojo/io-query",
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
        d_array,
        d_lang,
        d_connect,
        Deferred,
        d_ioq,
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
            service: mappingResourceRegistry.getMappingResourceByUniqueId("webCacheDOP01"),
            children: [
                new RasterLayerNode({
                    id: "service1/0",
                    layer: mappingResourceRegistry.getMappingResourceByUniqueId("webCacheDOP01/0")
                })
            ]
        });
        var service2 = new ServiceNode({
            id: "service2",
            service: mappingResourceRegistry.getMappingResourceByUniqueId("webCacheDTK01"),
            children: [
                new RasterLayerNode({
                    id: "service2/0",
                    layer: mappingResourceRegistry.getMappingResourceByUniqueId("webCacheDTK01/0")
                })
            ]
        });

        var cat1 = this.cat1 = new CategoryNode({
            id: "cat1"
        });
        var service3 = new ServiceNode({
            id: "service3",
            service: mappingResourceRegistry.getMappingResourceByUniqueId("uvo_wasser01"),
            children: [
                new RasterLayerNode({
                    id: "service3/0",
                    layer: mappingResourceRegistry.getMappingResourceByUniqueId("uvo_wasser01/0")
                }),
                new RasterLayerNode({
                    id: "service3/1",
                    layer: mappingResourceRegistry.getMappingResourceByUniqueId("uvo_wasser01/3")
                }),
                new RasterLayerNode({
                    id: "service3/2",
                    layer: mappingResourceRegistry.getMappingResourceByUniqueId("uvo_wasser01/6")
                })
            ]
        });

        var cat2 = this.cat2 = new CategoryNode({
            id: "cat2"
        });

        doh.register("agiv.bundles.statestoring.MapModelParameterResolver Tests", [
            {
                name: "Test for no initial children in glasspane/operational/base layers.",
                setUp: function () {
                    this.mapModel = new MapModel();
                },
                runTest: function () {
                    doh.assertEqual(false, this.mapModel.getGlassPaneLayer().hasChildren(),
                        "Expect no initial children at glasspane layer!");
                    doh.assertEqual(false, this.mapModel.getOperationalLayer().hasChildren(),
                        "Expect no initial children at operational layer!");
                    doh.assertEqual(false, this.mapModel.getBaseLayer().hasChildren(),
                        "Expect no initial children at base layer!");
                }
            },
            {
                name: "adding and removing map nodes with different restoreCompleteTocState states",
                href: location.href,
                setUp: function () {
                    var mapModel = new MapModel();
                    cat1.addChild(service1);
                    cat1.addChild(service2);
                    cat2.addChild(service3);
                    mapModel.getOperationalLayer().addChild(cat2);
                    mapModel.getBaseLayer().addChild(cat1);
                    this.mapModel = mapModel;
                },
                runTest: function () {
                    var mapModel = this.mapModel;
                    // no check structure change event
                    var visitingNodes = [
                        mapModel.rootNodeId,
                        mapModel.glassPaneNodeId,
                        mapModel.operationalLayerNodeId,
                        "cat2",
                        "service3",
                        "service3/0",
                        "service3/1",
                        "service3/2",
                        mapModel.baseLayerNodeId,
                        "cat1",
                        "service1",
                        "service1/0",
                        "service2",
                        "service2/0"
                    ]
                    var visitorCalled = 0;
                    var visitingFn = function (
                        n,
                        ctx
                        ) {
                        if (ctx.isStart) {
                            ctx.index = -1;
                        }
                        if (ctx.isDownTraversal) {
                            ++ctx.index;
                            doh.assertEqual(visitingNodes[ctx.index], n.get("id"));
                        }
                        if (ctx.isEnd) {
                            ++ctx.index;
                            doh.assertEqual(visitingNodes.length, ctx.index);
                            visitorCalled = ctx.index;
                        }
                    };
                    var visitingHandle = mapModel.getStructureChangedVistors().connect(visitingFn);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    mapModel.getStructureChangedVistors().disconnect(visitingHandle);
                    mapModel.getNodeById("service2").set("enabled", false);

                    //encode/decode URL tests
                    var cat3 = new CategoryNode({
                        id: "cat3",
                        enabled: false
                    });
                    var cat4 = new CategoryNode({
                        id: "cat4",
                        enabled: false
                    });
                    var cat5 = new CategoryNode({
                        id: "cat5",
                        enabled: true
                    });
                    mapModel.getOperationalLayer().addChild(cat3);
                    mapModel.getOperationalLayer().addChild(cat5);
                    mapModel.getBaseLayer().addChild(cat4);

                    var resolver = new MapModelParameterResolver();
                    resolver._isEsriMapLoaded = function () {
                        var def = new Deferred();
                        def.callback();
                    }
                    resolver._mapModel = mapModel;
                    var url = resolver.encodeURLParameter(),
                        tmp = {
                            sbn: 'cat1',
                            son: '[{"id":"cat2","title":"","renderPriority":0,"enabled":true,"layers":[{"id":"service3","title":"uvo_wasser01"}]},{"id":"cat3","title":"","renderPriority":0,"enabled":false},{"id":"cat5","title":"","renderPriority":0,"enabled":true}]'
                        };
                    doh.assertEqual(tmp, url);
                    url = d_ioq.queryToObject('&sbn=cat1&son=[{"id":"cat2","title":"","renderPriority":0,"enabled":true,"layers":[{"id":"service3","title":"uvo_wasser01"}]}]');
                    resolver.decodeURLParameter(url);

                    var _findSelectedChildren = function (mainNode) {
                        return mainNode.filterNodes(function (node) {
                            return node.get("enabled");
                        });
                    };

                    var tmpArray = _findSelectedChildren(mapModel.getBaseLayer()),
                        array = [];
                    d_array.forEach(tmpArray, function (elem) {
                        array.push(elem.get("id"));
                    });
                    doh.assertEqual([
                        "__baselayer__",
                        "cat1",
                        "service1",
                        "service1/0",
                        "service2/0"
                    ], array);
                    tmpArray = _findSelectedChildren(mapModel.getOperationalLayer());
                    array = [];
                    d_array.forEach(tmpArray, function (elem) {
                        array.push(elem.get("id"));
                    });
                    doh.assertEqual([
                        "__operationallayer__",
                        "cat2",
                        "service3",
                        "service3/0",
                        "service3/1",
                        "service3/2",
                        "cat5"
                    ], array);
                }
            }
        ]);
    });