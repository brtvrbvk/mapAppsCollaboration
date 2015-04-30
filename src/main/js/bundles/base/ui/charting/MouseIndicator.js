/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 31.03.2014.
 */
define([
        "dojo/_base/declare",
        "dojox/charting/action2d/MouseIndicator",
        "base/ui/charting/_IndicatorElement"
    ],
    function (
        declare,
        MouseIndicator,
        IndicatorElement
        ) {
        return declare([MouseIndicator],
            {
                constructor: function () {

                },

                _onMouseSingle: function (event) {
                    var plot = this.chart.getPlot(this._uName);
                    plot.pageCoord = {x: event.pageX, y: event.pageY};
                    plot.dirty = true;
                    this.chart.render();
                    //here we removed the event.stop call to make panning work
                },

                connect: function () {
                    // summary:
                    //		Connect this action to the chart. This adds a indicator plot
                    //		to the chart that's why Chart.render() must be called after connect.
                    this.inherited(arguments);
                    // add plot with unique name
                    this.chart.addPlot(this._uName, {type: IndicatorElement, inter: this });
                }
            }
        )
    }
);