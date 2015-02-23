/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 10.04.2014.
 */
define([
        "dojo/_base/declare",
        "dojox/charting/action2d/MouseZoomAndPan",
        "dojo/Evented"
    ],
    function (
        declare,
        MouseZoomAndPan,
        Evented
        ) {
        return declare([
                MouseZoomAndPan,
                Evented
            ],
            {
                constructor: function () {

                },

                onTouchEnd: function (evt) {
                    this.inherited(arguments);
                    var chart = this.chart, axis = chart.getAxis(this.axis);
                    var bounds = axis.getScaler().bounds;
                    this.emit("chartPan", {
                        lower: bounds.from,
                        upper: bounds.to
                    });
                }
            }
        )
    }
);