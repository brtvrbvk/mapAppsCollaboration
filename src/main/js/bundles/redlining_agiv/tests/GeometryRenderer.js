define([
        "doh",
        "ct/array",
        "ct/mapping/map/MapModel",
        "ct/mapping/map/MapState",
        "../GeometryRenderer"
    ],
    function (
        doh,
        ct_array,
        MapModel,
        MapState,
        GeometryRenderer
        ) {

        doh.register("agiv.bundles.drawing_agiv.GeometryRenderer Tests", [
            {
                name: "Test for drawing/erasing graphics",
                setUp: function () {
                    var mapModel = this.mapModel = new MapModel();
                    var mapState = this.mapState = new MapState();
                    mapState.getExtent = function () {
                        return {
                            spatialReference: {
                                wkid: "3857"
                            }
                        }
                    }
                },
                runTest: function () {
                    var renderer = this.renderer = new GeometryRenderer();
                    renderer.i18n = {
                        ui: {
                            types: {}
                        }
                    }
                    renderer._mapModel = this.mapModel;
                    renderer.symbolTable = {};
                    renderer.templateTable = {};
                    renderer._nodes = [];

                    var geometry = {
                        x: 519836.9424419109,
                        y: 6645908.073111366,
                        type: "point",
                        spatialReference: {
                            wkid: 3857
                        }
                    };
                    var attr = {
                        type: "DRAWING",
                        nodeid: "drawingtoolsetNode123"
                        //comment: "Test"
                    };
                    renderer.renderGeometry(geometry, attr, "drawingtoolsetNode123"); // attr and nodeId could be undefined
                    doh.assertEqual(1, renderer._mapModel.getGlassPaneLayer().children.length, "Expected 1");
                    doh.assertNotEqual(-1, ct_array.arraySearchFirst(renderer._mapModel.getGlassPaneLayer().children,
                            {nodeType: "POINT"}).id.indexOf("drawingtoolsetNode"),
                        "Expected drawing layer");

                    renderer.clearGraphics();
                    doh.assertEqual(0, renderer._mapModel.getGlassPaneLayer().children.length, "Expected 0");

                    renderer.grapicLayerId = "drawingtoolsetNode";
                    renderer.renderGeometry(geometry, undefined, undefined);
                    doh.assertEqual(1, renderer._mapModel.getGlassPaneLayer().children.length, "Expected 1");
                    doh.assertNotEqual(-1, ct_array.arraySearchFirst(renderer._mapModel.getGlassPaneLayer().children,
                            {nodeType: "POINT"}).id.indexOf("drawingtoolsetNode"),
                        "Expected drawing layer");
                },
                tearDown: function () {
                    this.mapModel = null;
                    this.mapState = null;
                    this.resolver = null;
                }
            }
        ]);
    });