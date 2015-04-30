define([
        "doh",
        "dojo/_base/array",
        "dojo/io-query",
        "ct/mapping/map/MapModel",
        "ct/mapping/mapcontent/MappingResourceRegistry",
        "ct/mapping/mapcontent/MappingResourceFactory",
        "../GeopuntParameterResolver"
    ],
    function (
        doh,
        d_array,
        d_ioq,
        MapModel,
        MappingResourceRegistry,
        MappingResourceFactory,
        GeopuntParameterResolver
        ) {

        doh.register("agiv.bundles.geopunt.GeopuntParameterResolver Tests", [
            {
                name: "Test for encoding/decoding params",
                setUp: function () {
                    this.mapModel = new MapModel();
                },
                runTest: function () {
                    var resolver = this.resolver = new GeopuntParameterResolver();
                    resolver.mapModel = this.mapModel;
                    resolver.mrr = new MappingResourceRegistry();
                    resolver._mrFactory = new MappingResourceFactory();
                    resolver.insertionNode = this.mapModel.getOperationalLayer(); //this.mapModel.getNodeById("__operationallayer__");
                    resolver.combicontentmanagerTool = {
                        get: function (param) {
                            return true;
                        }
                    }

                    // encode addServices params
                    var url = resolver.encodeURLParameter();
                    var tmp = {
                        addServices: ''
                    };
                    doh.assertEqual(tmp, url, "Expected empty string");

                    // decode params
                    url = d_ioq.queryToObject('&addDatasets=[]');
                    resolver.decodeURLParameter(url);
                    doh.assertEqual(0, resolver.mapModel.getOperationalLayer().children.length, "Expected 0");

                    // decode params
                    url = d_ioq.queryToObject('&addDatasets=[{"url":"http://nlbtest.agiv.be/inspire/wms/beschermde_gebieden","title":"Dynamic Bosres","type":"INSPIRE","layers":[{"id":"Bosres","title":"My bosres"}]},{"url":"http://nlbtest.agiv.be/inspire/wms/administratieve_eenheden","type":"INSPIRE","title":"admin","layers":[{"id":"Watering","title":"My watering"}]}]');
                    resolver.decodeURLParameter(url);
                    var items = [
                        "Bosres",
                        "Watering"
                    ];
                    var layers = resolver.mapModel.getOperationalLayer().children;
                    doh.assertEqual(2, layers.length, "Expected 2");
                    d_array.forEach(layers, function (
                        layer,
                        i
                        ) {
                        doh.assertEqual(items[i], layer.children[0].id, "Expected " + items[i]);
                    });

//                    url = d_ioq.queryToObject('&addServices=["http://wms.agiv.be/ogc/wms/RVV"]');
//                    resolver.loadServiceController = new LoadServiceController();
//                    resolver.decodeURLParameter(url);
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.resolver = null;
                }
            }
        ]);
    });