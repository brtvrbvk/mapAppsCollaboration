/**
 * PATCH for the esri/dijit/Scalebar to achive the following goals:
 * - Insert a SPACE character between the number and the unit.
 * - Write distance in meters, when unit is kilometers and distance < 1.
 */
define([
        "dojo/_base/array",
        "dojo/query",
        "esri/dijit/Scalebar"
    ],
    function (m, k, Scalebar) {
        Scalebar.prototype._drawScaleBar = function (a,
            c, b) {

            var unit = b;
            var distance = c;
            if (unit === "km" && Math.round(distance) < 1) {
                c *= 1000;
                b = "m";
            }

            var f = 2 * Math.round(a),
                e,
                d;
            "mi" === b || "ft" === b ? (this.englishScalebar.style.width = f + "px", a = k(".esriScalebarFirstNumber", this.englishScalebar), e = k(".esriScalebarSecondNumber", this.englishScalebar), d = k(".esriScalebarMetricLineBackground", this.englishScalebar)) : (this.metricScalebar.style.width = f + "px", a = k(".esriScalebarFirstNumber", this.metricScalebar), e = k(".esriScalebarSecondNumber", this.metricScalebar), d = k(".esriScalebarMetricLineBackground", this.metricScalebar));
            m.forEach(d, function (a, b) {
                a.style.width =
                    f - 2 + "px"
            }, this);
            m.forEach(a, function (a, b) {
                a.innerHTML = c
            }, this);
            m.forEach(e, function (a, d) {
                a.innerHTML = "esriUnknown" !== this.mapUnit ? 2 * c + " " + b : 2 * c + " " + "Unknown Unit"
            }, this)
        };
    });