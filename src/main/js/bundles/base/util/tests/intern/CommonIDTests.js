/**
 * COPYRIGHT 2015 con terra GmbH Germany
 *
 * Created by fba on 15.01.2015.
 */define([
        "intern!object",
        "intern/chai!assert",
        "module",
        "../../CommonID",
        "ct/mapping/mapcontent/MappingResourceRegistryInitializer",
        "ct/mapping/map/MapModel",
        "ct/mapping/map/ServiceNode",
        "ct/mapping/map/RasterLayerNode",
        "ct/mapping/map/CategoryNode"
    ],
    function (
        registerSuite,
        assert,
        md,
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

        registerSuite({
            name: md.id,

            beforeEach: function () {

                var model = this.mapModel = new MapModel();
                model.getOperationalLayer().addChild(cat1);
                model.getOperationalLayer().addChild(cat2);
                model.fireModelStructureChanged({
                    source: this
                });

            },

            "test_.to": function () {

                var id = "abc_def_asd/asd fg_2334562452";
                assert.equal("abc_def_asd/asd fg", commonID.to(id));

                id = "'´abc_de#*+&%f_a{][sd/asd fg_2334562452";
                assert.equal("'´abc_de#*+&%f_a{][sd/asd fg", commonID.to(id));

                id = "abc_def_asd/asd fg_2334562452A";
                assert.equal("abc_def_asd/asd fg_2334562452A", commonID.to(id));

            },

            "test_.findIdInModel": function () {
                //node 1
                var node = commonID.findIdInModel(this.parent.mapModel, "servi_ce_1de#f_45365345436537");
                assert.equal("servi_ce_1de#f_34567", node.id);
                node = null;

                //node 2
                node = commonID.findIdInModel(this.parent.mapModel, "service_2abc_445436537");
                assert.equal("service_2abc", node.id);
                node = null;

                //node 3
                node = commonID.findIdInModel(this.parent.mapModel, "service_1y x_los");
                assert.equal("service_1y x_los_34567", node.id);
                node = null;

                //node 3 again
                node = commonID.findIdInModel(this.parent.mapModel, "service_1y x_los_98764239586");
                assert.equal("service_1y x_los_34567", node.id);
                node = null;

            },

            "test_.findIdsInModel": function () {
                //node 1/2
                var nodes = commonID.findIdsInModel(this.parent.mapModel, [
                    "servi_ce_1de#f_45365345436537",
                    "service_2abc_445436537"
                ]);
                assert.equal("servi_ce_1de#f_34567", nodes[0].id);
                assert.equal("service_2abc", nodes[1].id);
                nodes = null;

                //node 2/3/3
                nodes = commonID.findIdsInModel(this.parent.mapModel, [
                    "service_2abc_445436537",
                    "service_1y x_los",
                    "service_1y x_los_98764239586"
                ]);
                assert.equal("service_2abc", nodes[0].id);
                assert.equal("service_1y x_los_34567", nodes[1].id);
                assert.equal("service_1y x_los_34567", nodes[2].id);
            },

            "test_.get.to": function () {
                var cid = commonID.get("service1/layer1");
                var res = commonID.to(cid);
                assert.equal("service1/layer1", res);
                cid = commonID.get("service1/layer1_1231");
                res = commonID.to(cid);
                assert.equal("service1/layer1_1231", res);
            }
        });
    }
);