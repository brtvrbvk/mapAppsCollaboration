/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 28.03.2014.
 */
define([
        "doh",
        "../ParcelSelectionModel",
        "base/tests/util/MapModelUtils",
        "ct/_when"
    ],

    function (
        doh,
        ParcelSelectionModel,
        MapModelUtils,
        ct_when
        ) {

        var mapmodel = MapModelUtils.getPopulatedMapModel();
        //mock getNodeById
        mapmodel.getNodeById = function () {
            return true;
        };

        doh.register("agiv.parcelselection.tests.ParcelSelectionModel", [
            {
                name: "Empty ParcelSelectionModel",
                timeout: 5000,
                psm: new ParcelSelectionModel({
                    _mapModel: mapmodel,
                    idProperty: "ID"
                }),

                setUp: function () {

                },

                runTest: function () {

                    var deferred = new doh.Deferred();

                    ct_when(this.psm.getSelected(), deferred.getTestCallback(function (sel) {

                        doh.assertEqual(0, sel.length);

                    }), deferred.getTestCallback(function (error) {
                        doh.assertEqual(null, error);
                    }), this);

                    return deferred;
                }
            },
            {
                name: "Add parcel to ParcelSelectionModel",
                timeout: 5000,
                psm: new ParcelSelectionModel({
                    _mapModel: mapmodel,
                    idProperty: "ID"
                }),

                setUp: function () {

                    this.psm.add({
                        ID: "ABC",
                        attributes: {}
                    });

                },

                runTest: function () {

                    var deferred = new doh.Deferred();

                    ct_when(this.psm.query(), deferred.getTestCallback(function (sel) {

                        doh.assertEqual(1, sel.length);
                        doh.assertEqual("ABC", sel[0].ID);

                    }), deferred.getTestCallback(function (error) {
                        doh.assertEqual(null, error);
                    }), this);

                    return deferred;
                }
            },
            {
                name: "Select parcel ParcelSelectionModel",
                timeout: 5000,
                psm: new ParcelSelectionModel({
                    _mapModel: mapmodel,
                    idProperty: "ID"
                }),

                setUp: function () {

                    ct_when(this.psm.add({
                        ID: "ABC",
                        attributes: {}
                    }), function () {

                        this.psm.setSelected("ABC");

                    }, function (error) {
                        //TODO
                    }, this);

                },

                runTest: function () {

                    var deferred = new doh.Deferred();

                    ct_when(this.psm.getSelected(), deferred.getTestCallback(function (sel) {

                        doh.assertEqual(1, sel.length);
                        doh.assertEqual("ABC", sel[0].ID);

                    }), deferred.getTestCallback(function (error) {
                        doh.assertEqual(null, error);
                    }), this);

                    return deferred;
                }
            },

            {
                name: "Add new parcel ParcelSelectionModel",
                timeout: 5000,
                psm: new ParcelSelectionModel({
                    _mapModel: mapmodel,
                    idProperty: "ID"
                }),

                setUp: function () {

                    ct_when(this.psm.add({
                        ID: "ABC",
                        attributes: {}
                    }), function () {

                        this.psm.add({
                            ID: "DEF",
                            attributes: {}
                        });

                    }, function (error) {
                        //TODO
                    }, this);

                },

                runTest: function () {

                    var deferred = new doh.Deferred();

                    ct_when(this.psm.query(), deferred.getTestCallback(function (sel) {

                        doh.assertEqual(2, sel.length);
                        doh.assertEqual("ABC", sel[0].ID);
                        doh.assertEqual("DEF", sel[1].ID);

                    }), deferred.getTestCallback(function (error) {
                        doh.assertEqual(null, error);
                    }), this);

                    return deferred;
                }
            },

            {
                name: "Get unselected parcel ParcelSelectionModel",
                timeout: 5000,
                psm: new ParcelSelectionModel({
                    _mapModel: mapmodel,
                    idProperty: "ID"
                }),

                setUp: function () {

                    ct_when(this.psm.add({
                        ID: "ABC",
                        attributes: {}
                    }), function () {

                        this.psm.add({
                            ID: "DEF",
                            attributes: {}
                        });

                    }, function (error) {
                        //TODO
                    }, this);

                },

                runTest: function () {

                    var deferred = new doh.Deferred();

                    ct_when(this.psm.getUnselected(), deferred.getTestCallback(function (sel) {

                        doh.assertEqual(2, sel.length);
                        doh.assertEqual("ABC", sel[0].ID);
                        doh.assertEqual("DEF", sel[1].ID);

                    }), deferred.getTestCallback(function (error) {
                        doh.assertEqual(null, error);
                    }), this);

                    return deferred;
                }
            },

            {
                name: "Select parcel ParcelSelectionModel",
                timeout: 5000,
                psm: new ParcelSelectionModel({
                    _mapModel: mapmodel,
                    idProperty: "ID"
                }),

                setUp: function () {

                    ct_when(this.psm.add({
                        ID: "ABC",
                        attributes: {}
                    }), function () {

                        ct_when(this.psm.add({
                            ID: "DEF",
                            attributes: {}
                        }), function () {

                            this.psm.setSelected("ABC", true);

                        }, function (error) {
                            //TODO
                        }, this);

                    }, function (error) {
                        //TODO
                    }, this);

                },

                runTest: function () {

                    var deferred = new doh.Deferred();

                    ct_when(this.psm.getSelected(), deferred.getTestCallback(function (sel) {

                        doh.assertEqual(1, sel.length);
                        doh.assertEqual("ABC", sel[0].ID);

                    }), deferred.getTestCallback(function (error) {
                        doh.assertEqual(null, error);
                    }), this);

                    return deferred;
                }
            }
        ]);
    });