/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/string",
        "ct/_lang",
        "ct/array",
        "ct/mapping/geometry",
        "esri/geometry/jsonUtils"
    ],

    function (
        declare,
        d_array,
        d_string,
        ct_lang,
        ct_array,
        ct_geometry,
        e_geometryUtils
        ) {
        return declare([], {


            constructor: function () {
            },

            _parseResults: function (results) {
                var parsedResults = [];
                if (results && results.pois) {
                    var totalCount;
                    if (results.label && results.label.term === "Count") {
                        totalCount = results.label.value;
                    }
                    d_array.forEach(results.pois, function (poi) {
                        if (!poi[this.idProperty]) {
                            //cannot parse
                            return null;
                        }
                        var p = {};
                        p[this.idProperty] = poi[this.idProperty];

                        var loc = poi.location;
                        if (loc && loc.points) {
                            var point = ct_array.arraySearchFirst(loc.points, {
                                "term": "center",
                                "type": "Pinpoint"
                            });
                            if (point) {
                                p.geometry = this._parseGeometry(point);
                                p.pointQuality = point.pointQuality;
                            }
                        }

                        if (!p.geometry) {
                            console.warn("Item has no geometry, can not be used! Discarding!", poi);
                            return null;
                        }

                        if (loc && loc.address) {
                            this._parseAddress(loc.address, p);
                        }

                        if (loc && loc.polygon) {
                            p.polygon = this._parseGeometry(loc.polygon);
                        }

                        if (poi.symbol) {

                        }

                        if (totalCount) {
                            p.totalCount = totalCount;
                        }

                        if (poi.categories) {
                            var type = ct_array.arraySearchFirst(poi.categories, {
                                "type": "Type"
                            });
                            p.poitype = type.term;
                            if (type.symbol) {
                                p.poisymbol = type.symbol;
                            }
                            p.poitypetitle = type.value;
                        }

                        if (poi.distance) {
                            try {
                                p.distance = parseFloat(poi.distance.value);
                            } catch (e) {
                                p.distance = poi.distance.value;
                            }

                        }

                        if (poi.labels) {
                            var primary = ct_array.arraySearchFirst(poi.labels, {
                                "term": "primary"
                            });
                            p.primaryLabel = primary ? primary.value : null;
                            p.title = p.primaryLabel;
                            var note = "";
                            var notes = d_array.filter(poi.labels, function (l) {
                                if (l.term === "note") {
                                    return l;
                                }
                                return null;
                            });
                            d_array.forEach(notes, function (
                                n,
                                idx
                                ) {
                                if (idx === 0) {
                                    note += n.value;
                                } else {
                                    note += "</br>" + n.value;
                                }
                            }, this);
                            p.note = note;
                            var alias = ct_array.arraySearchFirst(poi.labels, {
                                "term": "alternate"
                            });
                            p.alias = alias && alias.value.toUpperCase() !== p.primaryLabel.toUpperCase() ? alias.value : null;
//                            ct_array.arraySearchFirst(poi.labels, {
//                                "term": "note"
//                            });
//                            p.note = note?note.value:null;
                        }

                        if (poi.description) {
                            p.description = poi.description.value;
                        }

                        p.email = poi.email || null;

                        p.phone = poi.phone || null;

                        if (poi.links) {
                            var via = ct_array.arraySearchFirst(poi.links, {
                                "term": "related"
                            });
                            p.viaLink = via ? via.href : null;
                            p.links = poi.links;
                        }

                        p.type = "POI";

                        parsedResults.push(p);
                    }, this);
                }

                if (results.clusters) {

                    d_array.forEach(results.clusters, function (cluster) {

                        var c = {};

                        c.count = cluster.count;

                        c[this.idProperty] = (new Date().getTime() + Math.round(100 * Math.random())) + "";

                        c.isCluster = true;

                        c.poitype = this.poitype || "";

                        if (cluster.point) {
                            c.geometry = this._parseGeometry(cluster.point);
                        } else {
                            //we can´t do anything without geometry
                            return;
                        }

                        parsedResults.push(c);

                    }, this);

                }

                return parsedResults;
            },

            _parseGeometry: function (geom) {
                if (geom.Point) {
                    return this._parsePoint(geom);
                } else if (geom.MultiPolygon) {
                    return this._parseMultiPolygon(geom);
                }
            },

            _resolveSrs: function (item) {
                var srs;
                if (item.crs && item.crs.type === "link") {
                    srs = item.crs.properties.href.split("/");
                    srs = srs[srs.length - 1];
                }
                return srs;
            },

            _parseMultiPolygon: function (poly) {
                var polygon = poly.MultiPolygon;
                if (polygon.type === "MultiPolygon") {
                    var srs = this._resolveSrs(polygon) || ct_geometry.createSpatialReference({wkid: this.srs || ""});
                    var jsongeom = {
                        spatialReference: {wkid: srs},
                        rings: polygon.coordinates
                    };
                    var geometry = e_geometryUtils.fromJson(jsongeom);
                    return geometry;
                }
                return null;
            },

            _parsePoint: function (point) {
                var p = point.Point;
                if (p.type === "Point") {
                    var srs = this._resolveSrs(p) || ct_geometry.createSpatialReference({wkid: this.srs || ""});
                    //TODO find out if srs has switched axis
                    var t = ct_geometry.createPoint(p.coordinates[0], p.coordinates[1], srs);
                    return t;
                }
                return null;
            },

            _parseAddress: function (
                address,
                p
                ) {
                if (address.value) {
                    this._parseOldPOIVersionAddress(address, p);
                } else {
                    this._parseNewPOIVersionAddress(address, p);
                }
            },

            _parseOldPOIVersionAddress: function (
                address,
                p
                ) {
                p.address = address.value;
                if (p.address) {
                    p.address = p.address.replace("<br />", ", ");
                    p.address = p.address.replace("<br/>", ", ");
                    p.address = d_string.trim(p.address);
                    if (p.address.charAt(0) === ",") { // Some items from the service miss street information. So we have to omit the comma at the beginning.
                        p.address = p.address.substr(2); // omit leading comma
                    }
                }
                var splitIdx = p.address.lastIndexOf(" ");
                p.municipality = p.address.substring(splitIdx + 1);
            },

            _parseNewPOIVersionAddress: function (
                address,
                p
                ) {
                p.address = address;
            }

        });
    });