define([
        "doh",
        "../POIServerStore",
        "ct/_when",
        "esri/geometry/jsonUtils",
        "ct/_url"
    ],

    function (
        doh,
        POIServerStore,
        ct_when,
        e_geometryUtils,
        ct_url
        ) {

        doh.register("agiv.bundles.poi.tests.POIServerStore Tests", [
            {
                name: "POIServerStore Point Request Parsing Test",
                timeout: 5000,

                runTest: function () {

                    var testDeferred = new doh.Deferred();

                    try {
                        var store = new POIServerStore({
                            target: ct_url.resourceURL("base:store/poi/test/point_request.json")
                        });
                        var p = e_geometryUtils.fromJson({
                            x: 4.700460240564312,
                            y: 50.881881342688914,
                            spatialReference: {
                                wkid: 4326
                            }
                        });
                        var q = {
                            geometry: {
                                $intersects: p
                            }
                        };
                        var opts = {
                            queryRadius: 200
                        };

                        var query = {};
                        store._convertQuery(query, q, opts);

                        ct_when(store.query(q, opts), function (res) {
                            try {
                                doh.assertEqual(opts.queryRadius, query.radius);
                                doh.assertEqual(p.x, query.east);
                                doh.assertEqual(p.y, query.north);
                                doh.assertEqual("4326", query.srsIn);
                                doh.assertEqual("4326", query.srsOut);
                                doh.assertEqual(19, res.length);
                                doh.assertEqual("point", res[0].geometry.type);
                                doh.assertEqual("werkenaannutsleiding", res[0].poitype);
                                doh.assertEqual("2280", res[0].id);
                            } catch (e) {
                                testDeferred.reject(e);
                            }

                            testDeferred.callback(true);
                        }, function (err) {
                            testDeferred.reject(err);
                        });

                    } catch (e) {
                        testDeferred.reject(e);
                    }
                    return testDeferred;

                }
            },

            {
                name: "POIServerStore Parsing Test",
                timeout: 5000,

                runTest: function () {

                    var testDeferred = new doh.Deferred();

                    var store = new POIServerStore({
                        target: ct_url.resourceURL("base:store/poi/test/point_request.json")
                    });
                    var p = e_geometryUtils.fromJson({
                        x: 4.700460240564312,
                        y: 50.881881342688914,
                        spatialReference: {
                            wkid: 4326
                        }
                    });
                    var q = {
                        geometry: {
                            $intersects: p
                        }
                    };
                    var opts = {
                        queryRadius: 200
                    };

                    var query = {};
                    store._convertQuery(query, q, opts);

                    store.target = ct_url.resourceURL("base:store/poi/test/test.json");
                    ct_when(store.query(q, opts), function (res) {
                        try {
                            if (res && res[0]) {
                                var item = res[0];
                                doh.assertEqual("Andere", item.primaryLabel);
//                                doh.assertEqual("http://ws.beta.agiv.be/POI/core?id=1709", item.viaLink);
                                doh.assertEqual("25/10/2012 - 1/12/2012</br>Renovatie Rupeltunnel", item.note);
                                testDeferred.callback(true);
                            }
                        } catch (e) {
                            testDeferred.reject(e);
                        }
                    }, function (err) {
                        testDeferred.reject(err);
                    });

                    return testDeferred;

                }
            },

            {
                name: "POIServerStore Point MaxModel Parsing Test",
                timeout: 5000,

                runTest: function () {

                    var testDeferred = new doh.Deferred();
                    var store = new POIServerStore({
                        target: ct_url.resourceURL("base:store/poi/test/point_request.json")
                    });
                    var p = e_geometryUtils.fromJson({
                        x: 4.700460240564312,
                        y: 50.881881342688914,
                        spatialReference: {
                            wkid: 4326
                        }
                    });
                    var q = {
                        geometry: {
                            $intersects: p
                        }
                    };
                    var opts = {
                        queryRadius: 200
                    };

                    var query = {};
                    store._convertQuery(query, q, opts);

                    store.target = ct_url.resourceURL("base:store/poi/test/point_request_maxmodel.json");
                    ct_when(store.query(q, opts), function (res) {
                        try {
                            if (res && res[0]) {
                                var item = res[0];
                                doh.assertEqual(true, item.description.length > 10);
                                testDeferred.callback(true);
                            }
                        } catch (e) {
                            testDeferred.reject(e);
                        }
                    }, function (err) {
                        testDeferred.reject(err);
                    });

                    return testDeferred;

                }
            },

            {
                name: "POIServerStore Query Test",
                timeout: 5000,

                runTest: function () {

                    var testDeferred = new doh.Deferred();

                    try {
                        var store = new POIServerStore({
                            target: ct_url.resourceURL("base:store/poi/test/test.json")
                        });
                        var ext = e_geometryUtils.fromJson({
                            xmin: 580000,
                            xmax: 630000,
                            ymin: 6650000,
                            ymax: 6695000,
                            spatialReference: {
                                wkid: 3857
                            }
                        });

                        var extQuery = {
                            geometry: {
                                $within: ext
                            }
                        };
                        var content = {};
                        store._convertQuery(content, extQuery, {});
                        doh.assertEqual("3857", content.srsIn);
                        doh.assertEqual("3857", content.srsOut);
//                        doh.assertEqual("580000,6650000|630000,6695000",content.bbox);

                        extQuery = {
                            geometry: {
                                $intersects: ext
                            }
                        };
                        store._convertQuery(content, extQuery, {});
//                        doh.assertEqual("3857", content.srsIn);
                        doh.assertEqual("3857", content.srsOut);
                        doh.assertEqual(605000, content.east);
                        doh.assertEqual(6672500, content.north);
//                        doh.assertEqual("580000,6650000|630000,6695000",content.bbox);

                        extQuery = {
                            geometry: {
                                $overlaps: ext
                            }
                        };
                        store._convertQuery(content, extQuery, {});
                        doh.assertEqual(true, content.fromCache);
                        doh.assertEqual("overlaps", content.spatialRel);

                        extQuery = {
                            $suggest: "gent"
                        };
                        store._convertQuery(content, extQuery, {});
                        doh.assertEqual("gent", content.keyword);

                        testDeferred.callback(true);

                    } catch (e) {
                        testDeferred.reject(e);
                    }

                    return testDeferred;

                }
            },

            {
                name: "POIServerStore radius calculation test",
                timeout: 5000,

                runTest: function () {

                    var testDeferred = new doh.Deferred();

                    try {
                        var store = new POIServerStore({
                            target: ct_url.resourceURL("base:store/poi/test/test.json"),
                            srs: {spatialReference: {
                                wkid: 3857
                            }}
                        });

                        store.currentScale = 288895;

                        var rad = store._calcRadiusForScale();
                        doh.assertEqual(0.0034370650622528205, rad);

                        testDeferred.callback(true);

                    } catch (e) {
                        testDeferred.reject(e);
                    }

                    return testDeferred;

                }
            },

            {
                name: "POIServerStore radius query test",
                timeout: 5000,

                runTest: function () {

                    var testDeferred = new doh.Deferred();

                    try {
                        var store = new POIServerStore({
                            target: ct_url.resourceURL("base:store/poi/test/point_request.json"),
                            poitype: "GewoonKleuteronderwijs",
                            srs: {spatialReference: {
                                wkid: 3857
                            }}
                        });
                        var p = e_geometryUtils.fromJson({
                            x: 4.270276829325415,
                            y: 51.215772384701864,
                            spatialReference: {
                                wkid: 4326
                            }
                        });

                        var extQuery = {
                            geometry: {
                                $intersects: p
                            }
                        };

                        ct_when(store.query(extQuery, {radius: 1000}), function (res) {
                            try {
                                if (res && res[0]) {
                                    var item = res[0];
                                    doh.assertEqual(true, item.distance < 1000);
                                    doh.assertEqual(true, item.distance === 56.051677051579425);
                                    testDeferred.callback(true);
                                }
                            } catch (e) {
                                testDeferred.reject(e);
                            }
                        }, function (err) {
                            testDeferred.reject(err);
                        });

                    } catch (e) {
                        testDeferred.reject(e);
                    }

                    return testDeferred;

                }
            },

            {
                name: "POIServerStore Parsing beta maxmodel",
                timeout: 5000,

                runTest: function () {

                    var testDeferred = new doh.Deferred();

                    var store = new POIServerStore({
                        target: ct_url.resourceURL("base:store/poi/test/41432_beta_maxmodel.json")
                    });
                    var p = e_geometryUtils.fromJson({
                        x: 4.700460240564312,
                        y: 50.881881342688914,
                        spatialReference: {
                            wkid: 4326
                        }
                    });
                    var q = {
                        geometry: {
                            $intersects: p
                        }
                    };
                    var opts = {
                        queryRadius: 200
                    };

                    ct_when(store.query(q, opts), function (res) {
                        try {
                            var item = res[0];
                            doh.assertEqual("+32 9 267 96 11", item.phone);
                            doh.assertEqual("sint.bavohumaniora@sbhg.be", item.email);
                            doh.assertEqual(2, item.links.length);
                            doh.assertEqual("manueel", item.pointQuality);
                            doh.assertEqual("Algemeen Stedelijk Ziekenhuis", item.alias);
                            item = res[1];
                            doh.assertEqual(null, item.alias);
                            item = res[2];
                            doh.assertEqual(null, item.alias);
                            testDeferred.callback(true);
                        } catch (e) {
                            testDeferred.reject(e);
                        }
                    }, function (err) {
                        testDeferred.reject(err);
                    });

                    return testDeferred;

                }
            }

        ]);
    });