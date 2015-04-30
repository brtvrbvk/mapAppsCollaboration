/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 10.01.14
 * Time: 14:25
 */
define([
        "doh",
        "../CommonID",
        "ct/mapping/mapcontent/MappingResourceRegistryInitializer",
        "ct/mapping/map/MapModel",
        "ct/mapping/map/ServiceNode",
        "ct/mapping/map/RasterLayerNode",
        "ct/mapping/map/CategoryNode"
    ],

    function (
        doh,
        commonID,
        MappingResourceRegistryInitializer,
        MapModel,
        ServiceNode,
        RasterLayerNode,
        CategoryNode
        ) {

        var mappingResourceRegistry = new MappingResourceRegistryInitializer().initFromData({
            "services": [
                {
                    "id": "service_1",
                    "type": "AGS_DYNAMIC",
                    "url": "http://abc.de",
                    "layers": [
                        {
                            "id": "y x_los"
                        },
                        {
                            "id": "def"
                        }
                    ]
                },
                {
                    "id": "service_2",
                    "type": "WMS",
                    "url": "http://abc.de",
                    "layers": [
                        {
                            "id": "0"
                        },
                        {
                            "id": "abc"
                        }
                    ]
                }
            ]
        });

        var servicenode1 = new ServiceNode({
            id: "servi_ce_1de#f_34567",
            service: mappingResourceRegistry.getMappingResourceByUniqueId("service_1"),
            children: [
                new RasterLayerNode({
                    id: "1",
                    layer: mappingResourceRegistry.getMappingResourceByUniqueId("service_1/def")
                })
            ]
        });
        var servicenode2 = new ServiceNode({
            id: "service_2abc",
            service: mappingResourceRegistry.getMappingResourceByUniqueId("service_2"),
            children: [
                new RasterLayerNode({
                    id: "2",
                    layer: mappingResourceRegistry.getMappingResourceByUniqueId("service_2/abc")
                })
            ]
        });
        var servicenode3 = new ServiceNode({
            id: "service_1y x_los_34567",
            service: mappingResourceRegistry.getMappingResourceByUniqueId("service_1"),
            children: [
                new RasterLayerNode({
                    id: "3",
                    layer: mappingResourceRegistry.getMappingResourceByUniqueId("service_1/y x_los")
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

        cat1.addChild(servicenode1);
        cat1.addChild(servicenode2);
        cat2.addChild(servicenode3);

        doh.register("agiv.base.util.CommonID Tests", [
            {
                name: "CommonID .to Tests",
                timeout: 5000,

                runTest: function () {

                    var id = "abc_def_asd/asd fg_2334562452";
                    doh.assertEqual("abc_def_asd/asd fg", commonID.to(id));

                    id = "'´abc_de#*+&%f_a{][sd/asd fg_2334562452";
                    doh.assertEqual("'´abc_de#*+&%f_a{][sd/asd fg", commonID.to(id));

                    id = "abc_def_asd/asd fg_2334562452A";
                    doh.assertEqual("abc_def_asd/asd fg_2334562452A", commonID.to(id));

                }
            },
            {
                name: "CommonID .findIdInModel Tests",
                timeout: 5000,

                setUp: function () {

                    var model = this.mapModel = new MapModel();
                    model.getOperationalLayer().addChild(cat1);
                    model.getOperationalLayer().addChild(cat2);
                    model.fireModelStructureChanged({
                        source: this
                    });

                },

                runTest: function () {

                    //node 1
                    var node = commonID.findIdInModel(this.mapModel, "servi_ce_1de#f_45365345436537");
                    doh.assertEqual("servi_ce_1de#f_34567", node.id);
                    node = null;

                    //node 2
                    node = commonID.findIdInModel(this.mapModel, "service_2abc_445436537");
                    doh.assertEqual("service_2abc", node.id);
                    node = null;

                    //node 3
                    node = commonID.findIdInModel(this.mapModel, "service_1y x_los");
                    doh.assertEqual("service_1y x_los_34567", node.id);
                    node = null;

                    //node 3 again
                    node = commonID.findIdInModel(this.mapModel, "service_1y x_los_98764239586");
                    doh.assertEqual("service_1y x_los_34567", node.id);
                    node = null;

                }
            },
            {
                name: "CommonID .findIdsInModel Tests",
                timeout: 5000,

                setUp: function () {

                    var model = this.mapModel = new MapModel();
                    model.getOperationalLayer().addChild(cat1);
                    model.getOperationalLayer().addChild(cat2);
                    model.fireModelStructureChanged({
                        source: this
                    });

                },

                runTest: function () {

                    //node 1/2
                    var nodes = commonID.findIdsInModel(this.mapModel, [
                        "servi_ce_1de#f_45365345436537",
                        "service_2abc_445436537"
                    ]);
                    doh.assertEqual("servi_ce_1de#f_34567", nodes[0].id);
                    doh.assertEqual("service_2abc", nodes[1].id);
                    nodes = null;

                    //node 2/3/3
                    nodes = commonID.findIdsInModel(this.mapModel, [
                        "service_2abc_445436537",
                        "service_1y x_los",
                        "service_1y x_los_98764239586"
                    ]);
                    doh.assertEqual("service_2abc", nodes[0].id);
                    doh.assertEqual("service_1y x_los_34567", nodes[1].id);
                    doh.assertEqual("service_1y x_los_34567", nodes[2].id);

                }
            },

            {
                name: "CommonID .get .to Tests",
                timeout: 5000,

                setUp: function () {

                },

                runTest: function () {

                    var cid = commonID.get("service1/layer1");
                    var res = commonID.to(cid);
                    doh.assertEqual("service1/layer1", res);
                    cid = commonID.get("service1/layer1_1231");
                    res = commonID.to(cid);
                    doh.assertEqual("service1/layer1_1231", res);

                }
            }

        ]);
    });