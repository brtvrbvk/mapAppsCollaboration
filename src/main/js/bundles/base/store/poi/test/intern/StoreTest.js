/**
 * COPYRIGHT 2015 con terra GmbH Germany
 *
 * Created by fba on 15.01.2015.
 */
define([
        "intern!object",
        "intern/chai!assert",
        "module",
        "../../POIServerStore",
        "ct/_when",
        "esri/geometry/jsonUtils",
        "ct/_url"
    ],
    function (
        registerSuite,
        assert,
        md,
        POIServerStore,
        ct_when,
        e_geometryUtils,
        ct_url
        ) {

        registerSuite({
            name: md.id,

            test_PointParsing: function () {

                var testDeferred = this.async(1000);

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

                    ct_when(store.query(q, opts), testDeferred.callback(function (res) {
                        assert.equal(opts.queryRadius, query.radius);
                        assert.equal(p.x, query.east);
                        assert.equal(p.y, query.north);
                        assert.equal("4326", query.srsIn);
                        assert.equal("4326", query.srsOut);
                        assert.equal(19, res.length);
                        assert.equal("point", res[0].geometry.type);
                        assert.equal("werkenaannutsleiding", res[0].poitype);
                        assert.equal("2280", res[0].id);
                    }), function (err) {
                        testDeferred.reject(err);
                    });

                } catch (e) {
                    testDeferred.reject(e);
                }
                return testDeferred;

            },

            test_PointParsing2: function () {
                var testDeferred = this.async(1000);

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
                ct_when(store.query(q, opts), testDeferred.callback(function (res) {
                    if (res && res[0]) {
                        var item = res[0];
                        assert.equal("Andere", item.primaryLabel);
//                                assert.equal("http://ws.beta.agiv.be/POI/core?id=1709", item.viaLink);
                        assert.equal("25/10/2012 - 1/12/2012</br>Renovatie Rupeltunnel", item.note);
                    }
                }), function (err) {
                    testDeferred.reject(err);
                });

                return testDeferred;

            },

            test_MaxModelParsing: function () {
                var testDeferred = this.async(1000);
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
                ct_when(store.query(q, opts), testDeferred.callback(function (res) {
                    if (res && res[0]) {
                        var item = res[0];
                        assert.equal(true, item.description.length > 10);
                    }
                }), function (err) {
                    testDeferred.reject(err);
                });

                return testDeferred;

            },

            test_QueryBuilding: function () {

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
                assert.equal("3857", content.srsIn);
                assert.equal("3857", content.srsOut);
//                        assert.equal("580000,6650000|630000,6695000",content.bbox);

                extQuery = {
                    geometry: {
                        $intersects: ext
                    }
                };
                store._convertQuery(content, extQuery, {});
//                        assert.equal("3857", content.srsIn);
                assert.equal("3857", content.srsOut);
                assert.equal(605000, content.east);
                assert.equal(6672500, content.north);
//                        assert.equal("580000,6650000|630000,6695000",content.bbox);

                extQuery = {
                    geometry: {
                        $overlaps: ext
                    }
                };
                store._convertQuery(content, extQuery, {});
                assert.equal(true, content.fromCache);
                assert.equal("overlaps", content.spatialRel);

                extQuery = {
                    $suggest: "gent"
                };
                store._convertQuery(content, extQuery, {});
                assert.equal("gent", content.keyword);

            },

            test_radiusCalculation: function () {

                var store = new POIServerStore({
                    target: ct_url.resourceURL("base:store/poi/test/test.json"),
                    srs: {spatialReference: {
                        wkid: 3857
                    }}
                });

                store.currentScale = 288895;

                var rad = store._calcRadiusForScale();
                assert.equal(0.0034370650622528205, rad);

            },

            test_RadiusQuery: function () {

                var testDeferred = this.async(1000);

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

                    ct_when(store.query(extQuery, {radius: 1000}), testDeferred.callback(function (res) {
                        if (res && res[0]) {
                            var item = res[0];
                            assert.equal(true, item.distance < 1000);
                            assert.equal(true, item.distance === 56.051677051579425);
                        }
                    }), function (err) {
                        testDeferred.reject(err);
                    });

                } catch (e) {
                    testDeferred.reject(e);
                }

                return testDeferred;

            },

            test_MaxModelBetaParsing: function () {

                var testDeferred = this.async(1000);

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

                ct_when(store.query(q, opts), testDeferred.callback(function (res) {
                    var item = res[0];
                    assert.equal("+32 9 267 96 11", item.phone);
                    assert.equal("sint.bavohumaniora@sbhg.be", item.email);
                    assert.equal(2, item.links.length);
                    assert.equal("manueel", item.pointQuality);
                    assert.equal("Algemeen Stedelijk Ziekenhuis", item.alias);
                    item = res[1];
                    assert.equal(null, item.alias);
                    item = res[2];
                    assert.equal(null, item.alias);
                }), function (err) {
                    testDeferred.reject(err);
                });

                return testDeferred;

            }
        });
    }
);