define([
        "doh",
        "../GipodStore",
        "ct/_when",
        "ct/_url",
        "esri/geometry/jsonUtils"
    ],

    function (
        doh,
        GipodStore,
        ct_when,
        ct_url,
        e_geometryUtils
        ) {

        doh.register("agiv.bundles.gipod.tests.GipodStore Tests", [
            {
                name: "GipodStore compley query parsing",
                timeout: 5000,

                runTest: function () {

                    var testDeferred = new doh.Deferred();

                    try {
                        var store = new GipodStore({

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
                        var p = e_geometryUtils.fromJson({
                            x: 4.700460240564312,
                            y: 50.881881342688914,
                            spatialReference: {
                                wkid: 4326
                            }
                        });

                        var q =
                        {
                            geometry: {
                                $bbox: ext
                            }
                        };
                        var opts = {
                            crs: 3857,
                            startdate: new Date(2009, 9, 26, 13, 37, 43, 777)
                        };

                        var query = store._convertQuery(q, opts);

                        doh.assertEqual("2009-10-26", query.startdate);
                        doh.assertEqual("EPSG3857", query.crs);
                        doh.assertEqual("580000,6650000|630000,6695000", query.bbox);

                        delete query;
                        delete q;

                        q =
                        {
                            geometry: {
                                $intersects: p
                            }
                        };

                        delete query;

                        query = store._convertQuery(q);

                        doh.assertEqual("4.700460240564312,50.881881342688914", query.point);

                        testDeferred.callback(true);

                    } catch (e) {
                        testDeferred.reject(e);
                    }
                    return testDeferred;

                }
            },

            {
                name: "GipodStore parsing test",
                timeout: 5000,

                runTest: function () {

                    var testDeferred = new doh.Deferred();

                    try {

                        var store = new GipodStore({
                            target: ct_url.resourceURL("base:store/gipod/test/manifestations.json")
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

                        var q =
                        {
                            geometry: {
                                $bbox: ext
                            }
                        };
                        var opts = {
                            crs: 3857
                        };

                        ct_when(store.query(q, opts), function (resp) {

                            try {
                                //                            doh.assertEqual("Torenkraan", resp[0].description);
                                var item = resp[0];
                                doh.assertEqual(false, item.isCluster);
                                doh.assertEqual("(Werf)kraan", item.items[0].eventType);
                                doh.assertEqual(449635.0792646464, item.items[0].geometry.x);
                                doh.assertEqual(763214, item.items[0].gipodId);
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
                name: "GipodStore maxmodel parsing test",
                timeout: 5000,

                runTest: function () {

                    var testDeferred = new doh.Deferred();

                    try {

                        var store = new GipodStore({
                            target: ct_url.resourceURL("base:store/gipod/test/327799.json")
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

                        var q =
                        {
                            geometry: {
                                $bbox: ext
                            }
                        };
                        var opts = {
                            crs: 3857
                        };

                        ct_when(store.query(q, opts), function (resp) {

                            try {
                                var item = resp[0];
                                doh.assertEqual(false, item.isCluster);
                                var hinder = item.items[0];

                                doh.assertEqual(327799, hinder.gipodId);

                                var div1 = hinder.diversions[0];
                                var div2 = hinder.diversions[1];
                                var div1geom = div1.geometries[0];
                                var div2geom = div2.geometries[0];
                                doh.assertEqual("polyline", div1geom.type);
                                doh.assertEqual("polyline", div2geom.type);

                                doh.assertEqual("wo 01/01/2014 12:00", hinder.periods[0].startdate);

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
            }

        ])
        ;
    })
;