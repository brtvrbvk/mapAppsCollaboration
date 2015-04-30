/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 04.04.2014.
 */
define([
        "doh",
        "base/tests/util/MapModelUtils",
        "ct/_when",
        "../SelectionListController",
        "../adapters/MapModelAdapter",
        "base/ui/SelectionModel"
    ],

    function (
        doh,
        MapModelUtils,
        ct_when,
        SelectionListController,
        MapModelAdapter,
        SelectionModel
        ) {

        doh.register("SelectionListController tests", [
            {
                name: "SelectionListController setup",
                timeout: 5000,

                setUp: function () {
                    this.ctrl = new SelectionListController();
                    var mapmodel = this.mapmodel = MapModelUtils.getPopulatedMapModel();
                    var model = new SelectionModel();
                    var adapter = this.adapter = new MapModelAdapter();
                    adapter._mapModel = mapmodel;
                    this.ctrl.adapter = adapter;
                    this.ctrl.model = model;
                },

                runTest: function () {

                    this.adapter.activate();
                    this.ctrl.activate();
                    doh.assertEqual(1, this.ctrl.model._data.data.length);

                    MapModelUtils.addRandomLayer(this.mapmodel.getBaseLayer(), this.mapmodel);
                    doh.assertEqual(2, this.ctrl.model._data.data.length);

                    this.mapmodel.removeNodeById(this.mapmodel.getBaseLayer().get("children")[0].id);
                    this.mapmodel.fireModelStructureChanged();

                    doh.assertEqual(1, this.ctrl.model._data.data.length);

//                    var deferred = new doh.Deferred();
//                    return deferred;
                }
            },

            {
                name: "SelectionListController initial selection",
                timeout: 5000,

                setUp: function () {
                    this.ctrl = new SelectionListController();
                    var mapmodel = this.mapmodel = MapModelUtils.getPopulatedMapModel();
                    MapModelUtils.addRandomLayer(this.mapmodel.getBaseLayer(), this.mapmodel);
                    MapModelUtils.addRandomLayer(this.mapmodel.getBaseLayer(), this.mapmodel);
                    this.mapmodel.fireModelStructureChanged();
                    var model = this.model = new SelectionModel();
                    var adapter = this.adapter = new MapModelAdapter();
                    adapter._mapModel = mapmodel;
                    this.ctrl.adapter = adapter;
                    this.ctrl.model = model;
                },

                runTest: function () {

                    var deferred = new doh.Deferred();

                    this.adapter.activate();
                    this.ctrl.activate();

                    ct_when(this.model.getSelected(), function (results) {

                        doh.assertEqual(1, results.length);
                        deferred.callback(true);

                    }, function (error) {
                        deferred.reject(error);
                    }, this);

                    return deferred;
                }
            },

            {
                name: "SelectionListController selection",
                timeout: 5000,

                setUp: function () {
                    this.ctrl = new SelectionListController();
                    var mapmodel = this.mapmodel = MapModelUtils.getPopulatedMapModel();
                    MapModelUtils.addRandomLayer(mapmodel.getBaseLayer(), mapmodel);
                    MapModelUtils.addRandomLayer(mapmodel.getBaseLayer(), mapmodel);
                    mapmodel.fireModelStructureChanged();
                    var model = this.model = new SelectionModel();
                    var adapter = this.adapter = new MapModelAdapter();
                    adapter._mapModel = mapmodel;
                    this.ctrl.adapter = adapter;
                    this.ctrl.model = model;
                },

                runTest: function () {

                    var deferred = new doh.Deferred();

                    this.adapter.activate();
                    this.ctrl.activate();

                    var id = this.mapmodel.getBaseLayer().get("children")[0].id;

                    this.model.setSelected(id, true);

                    ct_when(this.model.getSelected(), function (results) {

                        doh.assertEqual(1, results.length);
                        doh.assertEqual(id, results[0].id);
                        doh.assertEqual(true, this.mapmodel.getNodeById(id).get("enabled"));
                        doh.assertEqual(false, this.mapmodel.getBaseLayer().get("children")[1].get("enabled"));
                        deferred.callback(true);

                    }, function (error) {
                        deferred.reject(error);
                    }, this);

                    return deferred;
                }
            }
        ]);
    });