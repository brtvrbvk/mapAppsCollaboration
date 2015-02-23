/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 31.03.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojox/charting/action2d/_IndicatorElement"
    ],
    function (
        declare,
        array,
        IndicatorElement
        ) {

        return declare([IndicatorElement],
            {
                _updateIndicator: function () {
                    var coordinates = this._updateCoordinates(this.pageCoord, this.secondCoord);
                    if (coordinates.length > 1) {
                        var v = this.opt.vertical;
                        this._data = [];
                        this.opt.values = [];
                        array.forEach(coordinates, function (value) {
                            if (value) {
                                this.opt.values.push(v ? value.x : value.y);
                                this._data.push([v ? value.y : value.x]);
                            }
                        }, this);
                        if (this.opt.values) {
                            var data = this.chart.series[0].data;
                            var yList = array.map(data, function (item) {
                                return item["x"];
                            });
                            var value = this.opt.values[0];
                            if (value === yList[0] || value === yList[1]) {
                                this.opt.offset["x"] += 40;
                            } else if (value === yList[data.length - 1] || value === yList[data.length - 2]) {
                                this.opt.offset["x"] -= 40;
                            }
                        }
                    } else {
                        this.inter.onChange({});
                        return;
                    }
                    this.inherited(arguments);
                }
            }
        )
    }
);