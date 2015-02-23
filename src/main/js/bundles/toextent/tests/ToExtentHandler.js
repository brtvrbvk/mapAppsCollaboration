define([
        "doh",
        "ct/mapping/map/MapState",
        "../ToExtentHandler"
    ],
    function (
        doh,
        MapState,
        ToExtentHandler
        ) {

        doh.register("agiv.bundles.toextent.ToExtentHandler Tests", [
            {
                name: "Test for setting extent",
                setUp: function () {
                    this.mapState = new MapState();
                },
                runTest: function () {
                    var handler = this.handler = new ToExtentHandler();
                    handler._mapState = this.mapState;
                    handler._extent = {
                        xmin: 416604.2762441293,
                        ymin: 6631528.7588091865,
                        xmax: 416641.3059486475,
                        ymax: 6631562.664492492,
                        type: "extent",
                        spatialReference: {
                            wkid: 3857
                        }
                    };
                    handler.toExtent();
                    var extent = handler._mapState.getExtent();
//                    doh.assertEqual(handler._extent, extent, "Expected same attributes");
                    doh.assertEqual(handler._extent.xmin, extent.xmin, "Expected " + handler._extent.xmin);
                    doh.assertEqual(handler._extent.xmax, extent.xmax, "Expected " + handler._extent.xmax);
                    doh.assertEqual(handler._extent.ymin, extent.ymin, "Expected " + handler._extent.ymin);
                    doh.assertEqual(handler._extent.ymax, extent.ymax, "Expected " + handler._extent.ymax);
                },
                tearDown: function () {
                    this.handler = null;
                    this.mapState = null;
                }
            }
        ]);
    });