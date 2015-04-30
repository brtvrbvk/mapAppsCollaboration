/**
 * COPYRIGHT 2015 con terra GmbH Germany
 *
 * Created by fba on 15.01.2015.
 */define([
        "intern!object",
        "intern/chai!assert",
        "module",
        "../../GipodStore",
        "ct/_when",
        "ct/_url",
        "esri/geometry/jsonUtils"
    ],
    function (
        registerSuite,
        assert,
        md,
        GipodStore,
        ct_when,
        ct_url,
        e_geometryUtils
        ) {

        registerSuite({
            name: md.id,

            test_ComplexQueryParsing: function () {

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

                assert.equal("2009-10-26", query.startdate);
                assert.equal("EPSG3857", query.crs);
                assert.equal("580000,6650000|630000,6695000", query.bbox);

                delete query;
                delete q;

                q = {
                    geometry: {
                        $intersects: p
                    }
                };

                delete query;

                query = store._convertQuery(q);

                assert.equal("4.700460240564312,50.881881342688914", query.point);

            },

            test_Parsing: function () {

                var testDeferred = this.async(1000);

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

                    ct_when(store.query(q, opts), testDeferred.callback(function (resp) {

                        //                            assert.equal("Torenkraan", resp[0].description);
                        var item = resp[0];
                        assert.equal(false, item.isCluster);
                        assert.equal("(Werf)kraan", item.items[0].eventType);
                        assert.equal(449635.0792646464, item.items[0].geometry.x);
                        assert.equal(763214, item.items[0].gipodId);

                    }), function (err) {
                        testDeferred.reject(err);
                    });

                } catch (e) {
                    testDeferred.reject(e);
                }
                return testDeferred;

            },

            test_MaxModelParsing: function () {

                var testDeferred = this.async(1000);

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

                    ct_when(store.query(q, opts), testDeferred.callback(function (resp) {

                        var item = resp[0];
                        assert.equal(false, item.isCluster);
                        var hinder = item.items[0];

                        assert.equal(327799, hinder.gipodId);

                        var div1 = hinder.diversions[0];
                        var div2 = hinder.diversions[1];
                        var div1geom = div1.geometries[0];
                        var div2geom = div2.geometries[0];
                        assert.equal("polyline", div1geom.type);
                        assert.equal("polyline", div2geom.type);

                        assert.equal("wo 01/01/2014 12:00", hinder.periods[0].startdate);

                    }), function (err) {
                        testDeferred.reject(err);
                    });

                } catch (e) {
                    testDeferred.reject(e);
                }
                return testDeferred;

            }
        });
    }
)
;