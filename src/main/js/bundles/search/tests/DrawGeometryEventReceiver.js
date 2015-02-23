define([
        "doh",
        "ct/array",
        "ct/mapping/map/MapModel",
        "ct/mapping/map/MapState",
        "ct/Stateful",
        "../selectionhandler/DrawGeometryEventReciever",
        "coordinatetransformer/CoordinateTransformer"
    ],
    function (
        doh,
        ct_array,
        MapModel,
        MapState,
        Stateful,
        DrawGeometryEventReceiver,
        CoordinateTransformer
        ) {

        var item1 = {
            title: "50, 3",
            type: "SEARCH_RESULT_COORDINATE",
            geometry: {
                x: 33233958.4723798207,
                y: 6446275.841017158,
                spatialReference: {
                    wkid: 3857
                },
                type: "point"
            }
        };
        var item2 = {
            title: "50, 33",
            type: "SEARCH_RESULT_COORDINATE",
            geometry: {
                x: 3332958.4723798207,
                y: 64446275.841017158,
                spatialReference: {
                    wkid: 3857
                },
                type: "point"
            }
        };
        var item3 = {
            title: "66, 33",
            type: "SEARCH_RESULT_COORDINATE",
            geometry: {
                x: 3332958.4723798207,
                y: 55464446275.841017158,
                spatialReference: {
                    wkid: 3857
                },
                type: "point"
            }
        };

        var symbolTableProvider = new Stateful({
            "lookupAttributeName": "resultNumber",
            "symbolTable": {
                "point": {
                    "url": "resource('images/mapMarker_sun.png')",
                    "width": 16,
                    "height": 26,
                    "xoffset": 0,
                    "yoffset": 10,
                    "type": "esriPMS"
                }
            }
        });
        var mapModel = new MapModel();
        var mapState = this.mapState = new MapState();
        mapState.getSpatialReference = function () {
            return {
                wkid: "3857"
            };
        };
        var ct = new CoordinateTransformer();
        ct._properties = {
            "libPath": "../../bundles/coordinatetransformer/lib/",
            "supportedSrs": [
                "EPSG:32632",
                "EPSG:4326",
                "EPSG:25832",
                "EPSG:3857"
            ]
        };
        ct.activate();
        var receiver = new DrawGeometryEventReceiver({
            _mapModel: mapModel,
            _mapState: mapState,
            _ct: ct,
            _i18n: {
                get: function () {
                    return {
                        defaultInfoTemplate: {
                            title: "",
                            content: ""
                        }
                    };
                }
            },
            symbolTableProvider: symbolTableProvider
        });

        doh.register("agiv.bundles.search.DrawGeometryEventReceiver Tests", [
            {
                name: "Test for drawing geometry",
                setUp: function () {
                    receiver._handleResultSelection(item1, false);
                },
                runTest: function () {

                    doh.assertNotEqual(-1, ct_array.arraySearchFirst(receiver._mapModel.getGlassPaneLayer().children,
                            {nodeType: "SEARCH_RESULT_COORDINATE"}).id.indexOf("searchResult"),
                        "Expected coordinate");
                    doh.assertEqual(1, receiver._nodes.length, "Expected only one node left");
                    doh.assertEqual(1, receiver._results.length, "Expected only one result left");

                    var tmp = {
                        resultNumber: 1,
                        renderPriority: 1,
                        title: "50, 3",
                        type: "SEARCH_RESULT_COORDINATE"
                    };
                    var attr = receiver._getAttributesFromItem(item1);
                    doh.assertEqual(tmp, attr, "Expected same attributes");

                },
                tearDown: function () {
                }
            },

            {
                name: "Test for drawing second geometry",
                setUp: function () {
                    receiver._handleResultSelection(item2, false);
                },
                runTest: function () {
                    var tmp = {
                        resultNumber: 2,
                        renderPriority: 2,
                        title: "50, 33",
                        type: "SEARCH_RESULT_COORDINATE"
                    };
                    var attr = receiver._getAttributesFromItem(item2);
                    doh.assertEqual(tmp, attr, "Expected same attributes");
                    doh.assertEqual(2, receiver._nodes.length, "Expected only two node left");
                    doh.assertEqual(2, receiver._results.length, "Expected only two result left");

                },
                tearDown: function () {
                }
            },

            {
                name: "Test for clearing geometry",
                setUp: function () {
                    receiver._handleClearAll();
                },
                runTest: function () {
                    doh.assertEqual(undefined,
                        ct_array.arraySearchFirst(receiver._mapModel.getGlassPaneLayer().children,
                            {nodeType: "SEARCH_RESULT_COORDINATE"}),
                        "Expected no result");
                    doh.assertEqual(0, receiver._nodes.length, "Expected only 0 node left");
                    doh.assertEqual(0, receiver._results.length, "Expected only 0 result left");
                },
                tearDown: function () {
                }
            },

            {
                name: "Test removing and adding items 1",
                setUp: function () {
                    receiver._handleResultSelection(item1, false);
                    receiver._handleResultSelection(item2, false);
                    setTimeout(function () {
                        receiver._handleRemove({
                            getProperty: function () {
                                return receiver._nodes[0].id;
                            }
                        });
                    }, 200);
                },
                runTest: function () {
                    var d = new doh.Deferred();
                    setTimeout(function () {
                        doh.assertEqual(1, receiver._nodes.length, "Expected only one result left");
                        doh.assertEqual(1, receiver._results.length, "Expected only one result left");

                        var modelChildren = ct_array.arraySearch(receiver._mapModel.getGlassPaneLayer().children,
                            {nodeType: "SEARCH_RESULT_COORDINATE"});
                        doh.assertEqual(1, modelChildren.length, "Expected only one model child left");

                        var tmp = {
                            resultNumber: 1,
                            renderPriority: 2,
                            title: "50, 33",
                            type: "SEARCH_RESULT_COORDINATE"
                        };
                        var attr = receiver._getAttributesFromItem(receiver._results[0].item);
                        doh.assertEqual(tmp, attr, "Expected only second result left");
                        d.callback(true);
                    }, 500);
                    return d;

                },
                tearDown: function () {
                }
            },
            {
                name: "Test removing and adding items 2",
                setUp: function () {
                    receiver._handleResultSelection(item3, false);
                },
                runTest: function () {
                    doh.assertEqual(2, receiver._nodes.length, "Expected two result left");
                    doh.assertEqual(2, receiver._results.length, "Expected only two result left");

                    var modelChildren = ct_array.arraySearch(receiver._mapModel.getGlassPaneLayer().children,
                        {nodeType: "SEARCH_RESULT_COORDINATE"});
                    doh.assertEqual(2, modelChildren.length, "Expected two model child left");

                    var tmp = {
                        resultNumber: 2,
                        renderPriority: 3,
                        title: "66, 33",
                        type: "SEARCH_RESULT_COORDINATE"
                    };
                    var attr = receiver._getAttributesFromItem(receiver._results[1].item);
                    doh.assertEqual(tmp, attr, "Expected new result as second conf");

                },
                tearDown: function () {
                }
            }
        ]);
    });