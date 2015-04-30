define([
        "doh",
        "dojo/_base/Deferred",
        "dojo/io-query",
        "ct/array",
        "ct/Stateful",
        "ct/mapping/map/MapModel",
        "ct/mapping/map/MapState",
        "ct/mapping/map/GraphicsLayerNode",
        "../selectionhandler/SearchResultParameterResolver",
        "../selectionhandler/DrawGeometryEventReciever",
        "coordinatetransformer/CoordinateTransformer"
    ],
    function (
        doh,
        Deferred,
        d_ioq,
        ct_array,
        Stateful,
        MapModel,
        MapState,
        GraphicsLayerNode,
        SearchResultParameterResolver,
        DrawGeometryEventReceiver,
        CoordinateTransformer
        ) {

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

        doh.register("agiv.bundles.search.SearchResultParameterResolver Tests", [
            {
                name: "Test for encoding/decoding params - no params",
                setUp: function () {
                    this.mapModel = new MapModel();
                },
                runTest: function () {
                    var resolver = this.resolver = new SearchResultParameterResolver();
                    resolver._isEsriMapLoaded = function () {
                        var def = new Deferred();
                        def.callback();
                    };
                    resolver._mapModel = this.mapModel;

                    // encode params
                    var url = resolver.encodeURLParameter();
                    var tmp = {
                        searchResult: '[]'
                    };
                    doh.assertEqual(tmp, url, "Expected empty array");

                    // decode params
                    var mapModel = this.mapModel;
                    var mapState = new MapState();
                    mapState.getSpatialReference = function () {
                        return {
                            wkid: "3857"
                        };
                    };

                    resolver._drawGeometryEventReceiver = new DrawGeometryEventReceiver({
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

                    url = d_ioq.queryToObject('&searchResult=' + tmp.searchResult);
                    resolver.decodeURLParameter(url);
                    doh.assertEqual(0, resolver._mapModel.getGlassPaneLayer().children.length, "Expected 0");
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.resolver = null;
                }
            },
            {
                name: "Test for encoding/decoding params - address search result",
                setUp: function () {
                    var mapModel = this.mapModel = new MapModel();
                    var g = new GraphicsLayerNode({
                        id: "address",
                        nodeType: "SEARCH_RESULT_ADDRESS",
                        graphics: [
                            {
                                attributes: {
                                    FormattedAddress: "Niel",
                                    LocationType: "crab_gemeente",
                                    title: "Niel",
                                    id: 0,
                                    extent: {
                                        xmin: 479590.05698534555,
                                        ymin: 6638145.0496225795,
                                        xmax: 485725.1932420607,
                                        ymax: 6641835.404735017,
                                        spatialReference: {
                                            wkid: 3857
                                        }
                                    },
                                    value: "Niel",
                                    zoomToExtent: true,
                                    type: "SEARCH_RESULT_ADDRESS",
                                    geometry: {
                                        x: 482657.7368522521,
                                        y: 6639990.593957742,
                                        spatialReference: {
                                            wkid: 3857
                                        }
                                    }
                                }
                            }
                        ]
                    });
                    mapModel.getGlassPaneLayer().addChild(g);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                },
                runTest: function () {
                    var resolver = this.resolver = new SearchResultParameterResolver();
                    resolver._isEsriMapLoaded = function () {
                        var def = new Deferred();
                        def.callback();
                    };
                    resolver._mapModel = this.mapModel;

                    // encode params
                    var url = resolver.encodeURLParameter();
                    var tmp = {
                        searchResult: '[{"FormattedAddress":"Niel","LocationType":"crab_gemeente","title":"Niel","id":0,"extent":{"xmin":479590.05698534555,"ymin":6638145.0496225795,"xmax":485725.1932420607,"ymax":6641835.404735017,"spatialReference":{"wkid":3857}},"value":"Niel","zoomToExtent":true,"type":"SEARCH_RESULT_ADDRESS","geometry":{"x":482657.7368522521,"y":6639990.593957742,"spatialReference":{"wkid":3857}}}]'
                    };
                    doh.assertEqual(tmp, url, "Expected same attributes");

                    // decode params
                    var mapModel = this.mapModel;
                    var mapState = new MapState();
                    mapState.getSpatialReference = function () {
                        return {
                            wkid: "3857"
                        };
                    };
                    resolver._drawGeometryEventReceiver = new DrawGeometryEventReceiver({
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

                    mapModel.getGlassPaneLayer().removeChildren();
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    url = d_ioq.queryToObject('&searchResult=' + tmp.searchResult);
                    resolver.decodeURLParameter(url);
                    doh.assertNotEqual(-1, ct_array.arraySearchFirst(resolver._mapModel.getGlassPaneLayer().children,
                            {nodeType: "SEARCH_RESULT_ADDRESS"}).id.indexOf("searchResult"),
                        "Expected address");
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.resolver = null;
                }
            },
            {
                name: "Test for encoding/decoding params - coordinate search result",
                setUp: function () {
                    var mapModel = this.mapModel = new MapModel();
                    var g = new GraphicsLayerNode({
                        id: "coordinate",
                        nodeType: "SEARCH_RESULT_COORDINATE",
                        graphics: [
                            {
                                attributes: {
                                    title: "50, 3",
                                    type: "SEARCH_RESULT_COORDINATE",
                                    geometry: {
                                        x: 333958.4723798207,
                                        y: 6446275.841017158,
                                        spatialReference: {
                                            wkid: 3857
                                        }
                                    }
                                }
                            }
                        ]
                    });
                    mapModel.getGlassPaneLayer().addChild(g);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                },
                runTest: function () {
                    var resolver = this.resolver = new SearchResultParameterResolver();
                    resolver._isEsriMapLoaded = function () {
                        var def = new Deferred();
                        def.callback();
                    };
                    resolver._mapModel = this.mapModel;

                    // encode params
                    var url = resolver.encodeURLParameter();
                    var tmp = {
                        searchResult: '[{"title":"50, 3","type":"SEARCH_RESULT_COORDINATE","geometry":{"x":333958.4723798207,"y":6446275.841017158,"spatialReference":{"wkid":3857}}}]'
                    };
                    doh.assertEqual(tmp, url, "Expected same attributes");

                    // decode params
                    var mapModel = this.mapModel;
                    var mapState = new MapState();
                    mapState.getSpatialReference = function () {
                        return {
                            wkid: "3857"
                        };
                    };
                    resolver._drawGeometryEventReceiver = new DrawGeometryEventReceiver({
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

                    mapModel.getGlassPaneLayer().removeChildren();
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    url = d_ioq.queryToObject('&searchResult=' + tmp.searchResult);
                    resolver.decodeURLParameter(url);
                    doh.assertNotEqual(-1, ct_array.arraySearchFirst(resolver._mapModel.getGlassPaneLayer().children,
                            {nodeType: "SEARCH_RESULT_COORDINATE"}).id.indexOf("searchResult"),
                        "Expected coordinate");
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.resolver = null;
                }
            },
            {
                name: "Test for encoding/decoding params - parcel search result",
                setUp: function () {
                    var mapModel = this.mapModel = new MapModel();
                    var g = new GraphicsLayerNode({
                        id: "parcel",
                        nodeType: "SEARCH_RESULT_PARCEL",
                        graphics: [
                            {
                                attributes: {
                                    FormattedAddress: "44804D0018/00G000",
                                    LocationType: "perceel",
                                    title: "44804D0018/00G000",
                                    id: 0,
                                    extent: {
                                        xmin: 416604.2762441293,
                                        ymin: 6631528.7588091865,
                                        xmax: 416641.3059486475,
                                        ymax: 6631562.664492492,
                                        spatialReference: {
                                            wkid: 3857
                                        }
                                    },
                                    value: "44804D0018/00G000",
                                    type: "SEARCH_RESULT_PARCEL",
                                    geometry: {
                                        rings: [
                                            [
                                                [
                                                    416637.3041027557,
                                                    6631550.4057090515
                                                ],
                                                [
                                                    416628.80867453135,
                                                    6631529.831195698
                                                ],
                                                [
                                                    416615.99385914014,
                                                    6631536.930408808
                                                ],
                                                [
                                                    416604.51548490813,
                                                    6631543.334003922
                                                ],
                                                [
                                                    416622.54307874094,
                                                    6631554.9825879
                                                ],
                                                [
                                                    416635.7573748631,
                                                    6631563.479602467
                                                ],
                                                [
                                                    416641.68333881476,
                                                    6631561.010916062
                                                ],
                                                [
                                                    416637.3041027557,
                                                    6631550.4057090515
                                                ]
                                            ]
                                        ],
                                        spatialReference: {
                                            wkid: 3857
                                        }
                                    }
                                }
                            }
                        ]
                    });
                    mapModel.getGlassPaneLayer().addChild(g);
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                },
                runTest: function () {
                    var resolver = this.resolver = new SearchResultParameterResolver();
                    resolver._isEsriMapLoaded = function () {
                        var def = new Deferred();
                        def.callback();
                    };
                    resolver._mapModel = this.mapModel;

                    // encode params
                    var url = resolver.encodeURLParameter();
                    var tmp = {
                        searchResult: "[{\"FormattedAddress\":\"44804D0018/00G000\",\"LocationType\":\"perceel\",\"title\":\"44804D0018/00G000\",\"id\":0,\"extent\":{\"xmin\":416604.2762441293,\"ymin\":6631528.7588091865,\"xmax\":416641.3059486475,\"ymax\":6631562.664492492,\"spatialReference\":{\"wkid\":3857}},\"value\":\"44804D0018/00G000\",\"type\":\"SEARCH_RESULT_PARCEL\",\"geometry\":{\"rings\":[[[416637.3041027557,6631550.4057090515],[416628.80867453135,6631529.831195698],[416615.99385914014,6631536.930408808],[416604.51548490813,6631543.334003922],[416622.54307874094,6631554.9825879],[416635.7573748631,6631563.479602467],[416641.68333881476,6631561.010916062],[416637.3041027557,6631550.4057090515]]],\"spatialReference\":{\"wkid\":3857}}}]"
                    };
                    doh.assertEqual(tmp.searchResult, url.searchResult, "Expected same attributes");

                    // decode params
                    var mapModel = this.mapModel;
                    var mapState = new MapState();
                    mapState.getSpatialReference = function () {
                        return {
                            wkid: "3857"
                        };
                    };
                    resolver._drawGeometryEventReceiver = new DrawGeometryEventReceiver({
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

                    mapModel.getGlassPaneLayer().removeChildren();
                    mapModel.fireModelStructureChanged({
                        source: this
                    });
                    url = d_ioq.queryToObject('&searchResult=' + tmp.searchResult);
                    resolver.decodeURLParameter(url);
                    doh.assertNotEqual(-1, ct_array.arraySearchFirst(resolver._mapModel.getGlassPaneLayer().children,
                            {nodeType: "SEARCH_RESULT_PARCEL"}).id.indexOf("searchResult"),
                        "Expected parcel");
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.resolver = null;
                }
            }
        ]);
    });