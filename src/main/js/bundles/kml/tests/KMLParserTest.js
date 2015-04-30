/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 17.10.2014.
 */
define([
        "doh",
        "base/tests/util/MapModelUtils",
        "../KMLParser",
        "kmltogeojson/Transformer",
        "geojson/Transformer",
        "coordinatetransformer/CoordinateTransformer",
        "ct/_when",
        "ct/request",
        "ct/_url",
        "../GeojsonExtender"
    ],

    function (
        doh,
        MapModelUtils,
        KMLParser,
        KMLTransformer,
        GeoJSONTransformer,
        CoordinateTransformer,
        ct_when,
        ct_request,
        ct_url
        ) {

        var coordinateTransformer = new CoordinateTransformer();
        coordinateTransformer._properties = {
            "libPath": "../../bundles/coordinatetransformer/lib/",
            "supportedSrs": [
                "EPSG:32632",
                "EPSG:4326",
                "EPSG:25832",
                "EPSG:3857"
            ]
        };
        var mapState = {
            getExtent: function () {
                return{
                    spatialReference: {
                        wkid: 3857
                    }
                }
            }
        };

        function init() {
            var bundleCtx = {
                getBundleContext: function () {
                    return {
                        registerService: function () {
                            console.debug("registered");
                            d.callback(true);
                        }
                    }
                }
            };
            var d = coordinateTransformer.activate(bundleCtx);
            return d;
        };
        var parser = new KMLParser();
        parser.togeojsonTransformer = new KMLTransformer();
        parser.geojsonTransformer = new GeoJSONTransformer();
        parser.mapState = mapState;

        doh.register("kml/tests/KMLParser", [
//            {
//                name: "NetworkLink Tests Deprecated Tag",
//                timeout: 5000,
//
//                setUp: function () {
//                    this.parser = new KMLParser();
//                },
//
//                runTest: function () {
//
//                    var deferred = new doh.Deferred();
//
//                    ct_when(ct_request.request({
//                                url: ct_url.resourceURL("kml:tests/ps-ps_unesco.kml",
//                                handleAs: "xml"},
//                            {usePost: false}),
//                        function (res) {
//
//                            var result = this.parser.parse(res);
//
//                            try {
//                                doh.assertEqual(1, result.wms.length);
//                                doh.assertEqual("https://www.mercator.vlaanderen.be:443/raadpleegdienstenmercatorpubliek/ps/wms",
//                                    result.wms[0].url);
//                                doh.assertEqual("ps:ps_unesco", result.wms[0].layers);
//                                doh.assertEqual("ps_unesco_std", result.wms[0].styles);
//                            } catch (e) {
//                                deferred.reject(e);
//                            }
//
//                            deferred.callback(true);
//
//                        }, function (error) {
//                            deferred.reject(error);
//                        }, this);
//
//                    return deferred;
//                },
//
//                tearDown: function () {
//
//                }
//            },
//
//            {
//                name: "NetworkLink Tests",
//                timeout: 5000,
//
//                setUp: function () {
//                    this.parser = new KMLParser();
//                },
//
//                runTest: function () {
//
//                    var deferred = new doh.Deferred();
//
//                    ct_when(ct_request.request({
//                                url: ct_url.resourceURL("kml:tests/ps-ps_unesco_correct_link.kml",
//                                handleAs: "xml"},
//                            {usePost: false}),
//                        function (res) {
//
//                            var result = this.parser.parse(res);
//
//                            try {
//                                doh.assertEqual(1, result.wms.length);
//                                doh.assertEqual("https://www.mercator.vlaanderen.be:443/raadpleegdienstenmercatorpubliek/ps/wms",
//                                    result.wms[0].url);
//                                doh.assertEqual("ps:ps_unesco", result.wms[0].layers);
//                                doh.assertEqual("ps_unesco_std", result.wms[0].styles);
//                            } catch (e) {
//                                deferred.reject(e);
//                            }
//
//                            deferred.callback(true);
//
//                        }, function (error) {
//                            deferred.reject(error);
//                        }, this);
//
//                    return deferred;
//                },
//
//                tearDown: function () {
//
//                }
//            }
            {
                name: "BuildingAreasExtension",
                timeout: 5000,

                setUp: function () {
                    this.url = ct_url.resourceURL("kml:resources/" + this.name + ".kml");
                },

                runTest: function () {

                    var deferred = new doh.Deferred();
                    ct_when(ct_request.request({
                                url: this.url,
                                handleAs: "xml"},
                            {usePost: false}),
                        function (res) {

                            ct_when(init(), function () {

                                parser.coordinateTransformer = coordinateTransformer;

                                ct_when(parser.parse(res, this.url), function (collection) {

                                    var firstFeature = collection.features[0];

                                    try {
                                        doh.assertEqual(5241, collection.features.length);
                                        doh.assertEqual("209.66", firstFeature.attributes.LENGTE);
                                        doh.assertEqual(0, firstFeature.attributes.OBJECTID);
                                        doh.assertEqual("bebouwd", firstFeature.attributes.OORZAAK);
                                        doh.assertEqual("polygon", firstFeature.geometry.type);
                                        doh.assertEqual(538769.728192234, firstFeature.geometry.rings[0][0][0]);
                                    } catch (e) {
                                        deferred.reject(e);
                                        return;
                                    }

                                    deferred.resolve(true);

                                }, function (error) {
                                    deferred.reject(error);
                                }, this);

                            }, function (error) {
                                deferred.reject(error);
                            }, this);

                        }, function (error) {
                            deferred.reject(error);
                        }, this);

                    return deferred;
                },

                tearDown: function () {

                }
            },

            {
                name: "geopunt_sample",
                timeout: 5000,

                setUp: function () {
                    this.url = ct_url.resourceURL("kml:resources/" + this.name + ".kml");
                },

                runTest: function () {

                    var deferred = new doh.Deferred();
                    ct_when(ct_request.request({
                                url: this.url,
                                handleAs: "xml"},
                            {usePost: false}),
                        function (res) {

                            ct_when(init(), function () {

                                parser.coordinateTransformer = coordinateTransformer;

                                ct_when(parser.parse(res, this.url), function (collection) {

                                    var firstFeature = collection.features[0];

                                    try {
                                        doh.assertEqual(3798, collection.features.length);
                                        doh.assertEqual(0, firstFeature.attributes.OBJECTID);
                                        doh.assertEqual("polyline", firstFeature.geometry.type);
                                        doh.assertEqual(485964.3759683786, firstFeature.geometry.paths[0][0][0]);
                                    } catch (e) {
                                        deferred.reject(e);
                                        return;
                                    }

                                    deferred.resolve(true);

                                }, function (error) {
                                    deferred.reject(error);
                                }, this);

                            }, function (error) {
                                deferred.reject(error);
                            }, this);

                        }, function (error) {
                            deferred.reject(error);
                        }, this);

                    return deferred;
                },

                tearDown: function () {

                }
            },
            {
                name: "percelen",
                timeout: 5000,

                setUp: function () {
                    this.url = ct_url.resourceURL("kml:resources/" + this.name + ".kml");
                },

                runTest: function () {

                    var deferred = new doh.Deferred();
                    ct_when(ct_request.request({
                                url: this.url,
                                handleAs: "xml"},
                            {usePost: false}),
                        function (res) {

                            ct_when(init(), function () {

                                parser.coordinateTransformer = coordinateTransformer;

                                ct_when(parser.parse(res, this.url), function (collection) {

                                    var firstFeature = collection.features[0];

                                    try {
                                        doh.assertEqual(2417, collection.features.length);
                                        doh.assertEqual(0, firstFeature.attributes.OBJECTID);
                                        doh.assertEqual("PR", firstFeature.attributes.CAPATY);
                                        doh.assertEqual("41079A0998/00B000", firstFeature.attributes.CAPAKEY);
                                        doh.assertEqual("polygon", firstFeature.geometry.type);
                                        doh.assertEqual(425994.70838096127, firstFeature.geometry.rings[0][0][0]);
                                    } catch (e) {
                                        deferred.reject(e);
                                        return;
                                    }

                                    deferred.resolve(true);

                                }, function (error) {
                                    deferred.reject(error);
                                }, this);

                            }, function (error) {
                                deferred.reject(error);
                            }, this);

                        }, function (error) {
                            deferred.reject(error);
                        }, this);

                    return deferred;
                },

                tearDown: function () {

                }
            },

            {
                name: "point_test",
                timeout: 5000,

                setUp: function () {
                    this.url = ct_url.resourceURL("kml:resources/" + this.name + ".kml");
                },

                runTest: function () {

                    var deferred = new doh.Deferred();

                    ct_when(ct_request.request({
                                url: this.url,
                                handleAs: "xml"},
                            {usePost: false}),
                        function (res) {

                            ct_when(init(), function () {

                                parser.coordinateTransformer = coordinateTransformer;

                                ct_when(parser.parse(res, this.url), function (collection) {

                                    var firstFeature = collection.features[0];

                                    try {
                                        doh.assertEqual(1, collection.features.length);
                                        doh.assertEqual(0, firstFeature.attributes.OBJECTID);
                                        doh.assertEqual("665", firstFeature.attributes.description);
                                        doh.assertEqual("665", firstFeature.attributes.name);
                                        doh.assertEqual("point", firstFeature.geometry.type);
                                        doh.assertEqual(542560.351277684, firstFeature.geometry.x);
                                    } catch (e) {
                                        deferred.reject(e);
                                        return;
                                    }

                                    deferred.resolve(true);

                                }, function (error) {
                                    deferred.reject(error);
                                }, this);

                            }, function (error) {
                                deferred.reject(error);
                            }, this);

                        }, function (error) {
                            deferred.reject(error);
                        }, this);

                    return deferred;
                },

                tearDown: function () {

                }
            },

            {
                name: "Watercourses",
                timeout: 5000,

                setUp: function () {
                    this.url = ct_url.resourceURL("kml:resources/" + this.name + ".kml");
                },

                runTest: function () {

                    var deferred = new doh.Deferred();

                    ct_when(ct_request.request({
                                url: this.url,
                                handleAs: "xml"},
                            {usePost: false}),
                        function (res) {

                            ct_when(init(), function () {

                                parser.coordinateTransformer = coordinateTransformer;

                                ct_when(parser.parse(res, this.url), function (collection) {

                                    var firstFeature = collection.features[0];

                                    try {
                                        doh.assertEqual(2569, collection.features.length);
                                        doh.assertEqual(0, firstFeature.attributes.OBJECTID);
                                        doh.assertEqual("Boven-Scheldebekken", firstFeature.attributes.BEKNAAM);
                                        doh.assertEqual("2", firstFeature.attributes.CATC);
                                        doh.assertEqual("polyline", firstFeature.geometry.type);
                                        doh.assertEqual(396244.56594859465, firstFeature.geometry.paths[0][0][0]);
                                    } catch (e) {
                                        deferred.reject(e);
                                        return;
                                    }

                                    deferred.resolve(true);

                                }, function (error) {
                                    deferred.reject(error);
                                }, this);

                            }, function (error) {
                                deferred.reject(error);
                            }, this);

                        }, function (error) {
                            deferred.reject(error);
                        }, this);

                    return deferred;
                },

                tearDown: function () {

                }
            },

            {
                name: "OGCKML",
                timeout: 5000,

                setUp: function () {
                    this.url = ct_url.resourceURL("kml:resources/" + this.name + ".kml");
                },

                runTest: function () {

                    var deferred = new doh.Deferred();

                    ct_when(ct_request.request({
                                url: this.url,
                                handleAs: "xml"},
                            {usePost: false}),
                        function (res) {

                            ct_when(init(), function () {

                                parser.coordinateTransformer = coordinateTransformer;

                                ct_when(parser.parse(res, this.url), function (collection) {

                                    var firstFeature = collection.features[0];

                                    try {
                                        doh.assertEqual(936, collection.features.length);
                                        doh.assertEqual("67", firstFeature.attributes.HOEHE_M);
                                        doh.assertEqual("05515000", firstFeature.attributes.GKZ);
                                        doh.assertEqual("polygon", firstFeature.geometry.type);
                                        doh.assertEqual(848600.7234839267, firstFeature.geometry.rings[0][0][0]);
                                    } catch (e) {
                                        deferred.reject(e);
                                        return;
                                    }

                                    deferred.resolve(true);

                                }, function (error) {
                                    deferred.reject(error);
                                }, this);

                            }, function (error) {
                                deferred.reject(error);
                            }, this);

                        }, function (error) {
                            deferred.reject(error);
                        }, this);

                    return deferred;
                },

                tearDown: function () {

                }
            },

            {
                name: "Afschakelplan_gemeenten",
                timeout: 5000,

                setUp: function () {
                    this.url = ct_url.resourceURL("kml:resources/" + this.name + ".kml");
                },

                runTest: function () {

                    var deferred = new doh.Deferred();

                    ct_when(ct_request.request({
                                url: this.url,
                                handleAs: "xml"},
                            {usePost: false}),
                        function (res) {

                            ct_when(init(), function () {

                                parser.coordinateTransformer = coordinateTransformer;

                                ct_when(parser.parse(res, this.url), function (collection) {

                                    var firstFeature = collection.features[0];

                                    try {
                                        doh.assertEqual(306, collection.features.length);
                                        doh.assertEqual("polygon", firstFeature.geometry.type);
                                    } catch (e) {
                                        deferred.reject(e);
                                        return;
                                    }

                                    deferred.resolve(true);

                                }, function (error) {
                                    deferred.reject(error);
                                }, this);

                            }, function (error) {
                                deferred.reject(error);
                            }, this);

                        }, function (error) {
                            deferred.reject(error);
                        }, this);

                    return deferred;
                },

                tearDown: function () {

                }
            },

            {
                name: "GRBGebL",
                timeout: 5000,

                setUp: function () {
                    this.url = ct_url.resourceURL("kml:resources/" + this.name + ".kml");
                },

                runTest: function () {

                    var deferred = new doh.Deferred();

                    ct_when(ct_request.request({
                                url: this.url,
                                handleAs: "xml"},
                            {usePost: false}),
                        function (res) {

                            ct_when(init(), function () {

                                parser.coordinateTransformer = coordinateTransformer;

                                ct_when(parser.parse(res, this.url), function (collection) {

                                    var firstFeature = collection.features[0];

                                    try {
                                        doh.assertEqual(414, collection.features.length);
                                        doh.assertEqual("3.47", firstFeature.attributes.HN_MAX);
                                        doh.assertEqual("4195922", firstFeature.attributes.GRB_OIDN);
                                        doh.assertEqual("polygon", firstFeature.geometry.type);
                                        doh.assertEqual(403129.9399061781, firstFeature.geometry.rings[0][0][0]);
                                    } catch (e) {
                                        deferred.reject(e);
                                        return;
                                    }

                                    deferred.resolve(true);

                                }, function (error) {
                                    deferred.reject(error);
                                }, this);

                            }, function (error) {
                                deferred.reject(error);
                            }, this);

                        }, function (error) {
                            deferred.reject(error);
                        }, this);

                    return deferred;
                },

                tearDown: function () {

                }
            }
        ]);
    });
