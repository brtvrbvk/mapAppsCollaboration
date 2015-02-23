/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 10.04.2014.
 */
define([
        "dojo/_base/declare",
        "dojox/charting/action2d/TouchIndicator"
    ],
    function (declare) {
        return declare([],
            {
                constructor: function () {

                },
                _onTouchSingle: function (
                    event,
                    delayed
                    ) {
                    if (this.chart._delayedRenderHandle && !delayed) {
                        // we have pending rendering from a previous call, let's sync
                        this.chart.render();
                    }
                    var plot = this.chart.getPlot(this._uName);
                    plot.pageCoord = {x: event.touches ? event.touches[0].pageX : event.pageX, y: event.touches ? event.touches[0].pageY : event.pageY};
                    plot.dirty = true;
                    if (delayed) {
                        this.chart.delayedRender();
                    } else {
                        this.chart.render();
                    }
                    //eventUtil.stop(event);
                },

                _onTouchDual: function (event) {
                    // sync
                    if (this.chart._delayedRenderHandle) {
                        // we have pending rendering from a previous call, let's sync
                        this.chart.render();
                    }
                    var plot = this.chart.getPlot(this._uName);
                    plot.pageCoord = {x: event.touches[0].pageX, y: event.touches[0].pageY};
                    plot.secondCoord = {x: event.touches[1].pageX, y: event.touches[1].pageY};
                    plot.dirty = true;
                    this.chart.render();
                    //eventUtil.stop(event);
                }
            }
        )
    }
);