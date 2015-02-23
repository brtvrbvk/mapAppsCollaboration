/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 31.03.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/Evented",
        "dojox/charting/Chart"
    ],
    function (
        declare,
        Evented,
        Chart
        ) {
        return declare([
                Chart,
                Evented
            ],
            {
                constructor: function () {

                },

                zoomIn: function (
                    name,
                    range,
                    delayed
                    ) {
                    this.inherited(arguments);
                    var axis = this.axes[name];
                    if (axis) {
                        var scale, offset, bounds = axis.getScaler().bounds;
                        var lower = Math.min(range[0], range[1]);
                        var upper = Math.max(range[0], range[1]);
                        lower = range[0] < bounds.lower ? bounds.lower : lower;
                        upper = range[1] > bounds.upper ? bounds.upper : upper;
                        this.emit("chartZoom", {
                            lower: lower,
                            upper: upper
                        });
                    }
                }
            }
        )
    }
);