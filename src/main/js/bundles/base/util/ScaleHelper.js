/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 28.07.2014.
 */
define([
        "dojo/_base/declare",
        "esri/geometry/geodesicUtils",
        "esri/geometry/webMercatorUtils",
        "esri/units",
        "esri/geometry/Point",
        "esri/geometry/Polyline",
        "esri/config",
        "./distance"

    ],
    function (
        declare,
        e_geodesicUtils,
        e_webMercatorUtils,
        e_units,
        Point,
        Polyline,
        e_config,
        distance
        ) {
        return {


            getScale: function (
                viewport
                ) {
                var screen = viewport.getScreen(),
                    geo = viewport.getGeo();
                return this._getScaleForExtent(geo, screen);
            },

            //adapted from measurement
            _getScaleForExtent: function (
                extent,
                screen
//                esriMap
                ) {
                var spatialReference = extent.spatialReference;
                var lowerLeft = new Point(extent.xmin, extent.ymin, spatialReference),
                    lowerRight = new Point(extent.xmax, extent.ymin, spatialReference);
//                if ("PCS" === esriMap.cs) {
//                    lowerLeft = this._getGCSLocation(lowerLeft, esriMap);
//                    lowerRight = this._getGCSLocation(lowerRight, esriMap)
//                }

                var length = distance.fromTo(lowerLeft, lowerRight, e_units.CENTIMETERS);
                //result in cm, 1 inch = 2.54 cm
                return (length / screen.getWidth()) * (e_config.defaults.screenDPI / 2.54);
            }

            //adapted from measurement
//            _getGCSLocation: function (
//                a,
//                esriMap
//                ) {
//                if ("Web Mercator" ===
//                    esriMap.cs)a = e_webMercatorUtils.webMercatorToGeographic(a); else if ("PCS" === esriMap.cs && esriMap._newExtent) {
//                    var b = Math.abs((esriMap._newExtent.xmax - esriMap._newExtent.xmin) / (esriMap.extent.xmax - esriMap.extent.xmin)), c = Math.abs((esriMap._newExtent.ymax - esriMap._newExtent.ymin) / (esriMap.extent.ymax - esriMap.extent.ymin));
//                    a = new Point((a.x - esriMap.extent.xmin) * b + esriMap._newExtent.xmin,
//                            (a.y - esriMap.extent.ymin) * c + esriMap._newExtent.ymin,
//                        esriMap.spatialReference)
//                }
//                return a;
//            }
        };
    }
);