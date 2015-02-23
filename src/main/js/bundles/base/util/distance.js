/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 06.08.2014.
 */
define([
        "dojo/_base/declare",
        "esri/geometry/geodesicUtils",
        "esri/geometry/webMercatorUtils",
        "esri/units",
        "esri/geometry/Point",
        "esri/geometry/Polyline"
    ],
    function (
        declare,
        e_geodesicUtils,
        e_webMercatorUtils,
        e_units,
        Point,
        Polyline
        ) {
        return {

            fromTo: function (
                p1,
                p2,
                esriUnit
                ) {

                var spatialReference = p1.spatialReference;
                var line = new Polyline(spatialReference);
//                if ("PCS" === esriMap.cs) {
//                    lowerLeft = this._getGCSLocation(lowerLeft, esriMap);
//                    lowerRight = this._getGCSLocation(lowerRight, esriMap)
//                }
                line.addPath([
                    p1,
                    p2
                ]);
                if (spatialReference.isWebMercator()) {
                    line = e_webMercatorUtils.webMercatorToGeographic(line);
                }
                return e_geodesicUtils.geodesicLengths([line], esriUnit || e_units.METERS)[0];

            }

        };
    }
);