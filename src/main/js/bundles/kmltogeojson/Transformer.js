/*
 * Copyright (C) con terra GmbH (http://www.conterra.de) All rights reserved
 * All rights reserved
 */
/**
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "./togeojson",
    "esri/geometry/jsonUtils",
    "dojo/_base/array",
    "ct/array"
], function (
    declare,
    d_lang,
    togeojson,
    esri_geometry_jsonUtils,
    d_array,
    ct_array
    ) {
    return declare([], {

        kmlToGeojson: function (kml) {

            if (typeof kml === 'string') {
                var parser = new DOMParser();
                return this._fixGeometry(togeojson.parse.kml(parser.parseFromString(kml, "text/xml")));
            }
            return this._fixGeometry(togeojson.parse.kml(kml));
        },

        _fixGeometry: function (geojson) {
            var test = function (c) {
                return isNaN(c) ? true : false;
            };
            geojson.features = d_array.filter(geojson.features, function (feature) {

                var geom = feature.geometry,
                    coords = geom.coordinates;

                if (!coords || coords.length === 0) {
                    return null;
                }

                if (geom.type === "Polygon" ||
                    geom.type === "MultiPolygon") {
                    d_array.forEach(coords, function (coordinate) {
                        d_array.forEach(coordinate, function (c) {
                            if (d_lang.isArray(c))
                                ct_array.arrayRemove(c, null, test);
                            if (c[2] !== "undefined") {
                                c.splice(2, 1);
                            }
                        });
                    });

                } else if (geom.type === "Point") {

                    if (coords[2] !== "undefined") {
                        coords.splice(2, 1);
                    }

                } else if (geom.type === "LineString" ||
                    geom.type === "MultiLineString") {

                    d_array.forEach(coords, function (coordinate) {
                        if (d_lang.isArray(coordinate))
                            ct_array.arrayRemove(coordinate, null, test);
                        if (coordinate[2] !== "undefined") {
                            coordinate.splice(2, 1);
                        }
                    }, this);
                }

                return feature;

            }, this);
            return geojson;
        }
    });
});

