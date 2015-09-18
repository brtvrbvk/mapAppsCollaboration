/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 30.09.13
 * Time: 09:44
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/date/stamp",
        "dojo/date/locale",
        "ct/_lang",
        "ct/array",
        "ct/mapping/geometry",
        "esri/geometry/Polygon",
        "esri/geometry/Polyline",
        "esri/geometry/Point"
    ],
    function (
        declare,
        d_lang,
        d_array,
        d_stamp,
        locale,
        ct_lang,
        ct_array,
        ct_geometry,
        Polygon,
        Polyline,
        Point
        ) {
        return declare([],
            {
                datePattern: "dd/MM/yyyy",
                timePattern: "HH:mm",

                constructor: function () {

                },

                _parseResults: function (
                    results,
                    targetQuery,
                    options
                    ) {

                    var parsedResults = [];

                    if (results && results.length > 0) {

                        d_array.forEach(results, function (res) {

                            parsedResults.push(this._parseSingleItem(res));

                        }, this);

                    } else if (results && d_lang.isObject(results) && results.length == undefined) {

                        parsedResults.push(this._parseSingleItem(results));

                    }

                    return parsedResults;

                },

                _parseSingleItem: function (res) {

                    var item = {
                        detail: res.detail,
                        description: res.description,
                        gipodId: res.gipodId,
                        text: res.gipodId,
                        eventType: res.eventType,
                        owner: res.owner,
                        gipodType: this.gipodType,
                        importantHindrance: res.importantHindrance,
                        cities: res.cities
                    };

                    //"2013-09-25T06:00:00"
                    var startDateTime;
                    if (res.startDateTime) {
                        startDateTime = res.startDateTime;
                    } else if (res.periods && res.periods.length && res.periods.length > 0) {
                        startDateTime = res.periods[0].startDateTime;
                    }
                    item.startdate = d_stamp.fromISOString(startDateTime);

                    var endDateTime;
                    if (res.endDateTime) {
                        endDateTime = res.endDateTime;
                    } else if (res.periods && res.periods.length && res.periods.length > 0) {
                        var lastNum = res.periods.length - 1;
                        endDateTime = res.periods[lastNum].endDateTime;
                    }
                    item.enddate = d_stamp.fromISOString(endDateTime);

                    if (item.startdate && item.enddate) {
                        item.activePeriod = this._getFormattedDate(item.startdate) + " - " + this._getFormattedDate(item.enddate);
                    }

                    if (res.recurrencePattern) {
                        item.recurrencePattern = res.recurrencePattern;
                        item.activePeriod = res.recurrencePattern
                    }

                    if (res.coordinate) {
                        item.geometry = this._parseGeometry(res.coordinate);
                    }
//BartVerbeeck Bug 29855 geen wordt neen
                    if (res.hindrance) {
                        item.hindrance = res.hindrance;
                        item.hindrance.importantString = item.hindrance.important ? "ja" : "neen";
                    }

                    if (res.periods && res.periods.length && res.periods.length > 0) {
                        item.periods = this._formatPeriods(res.periods);
                    }

                    if (res.contactDetails) {
                        item.contact = res.contactDetails;
                        if (item.contact.email) {
                            item.contact.emailPlain = item.contact.email;
                            item.contact.email = "<a href='mailto:" + item.contact.email + "'>" + item.contact.email + "</a>";
                        }
                    }

                    if (res.url) {
                        item.urlPlain = res.url;
                        item.url = "<a href='" + res.url + "' target='_blank'>" + res.url + "</a>";
                    }

                    if (res.state) {
                        item.state = res.state;
                    } else {
                        if (this.gipodType === "manifestation") {
                            item.state = "nvt";
                        }
                    }

                    if (res.comment) {
                        item.comment = res.comment;
                    }

                    if (res.latestUpdate) {
                        item.latestUpdate = this._getFormattedDate(d_stamp.fromISOString(res.latestUpdate));
                    }

                    if (res.contractor) {
                        item.contractor = res.contractor;
                    }
                    //BartVerbeeck Bug29852
                    if (res.mainContractor) {
                        item.maincontractorfirstnamelastname = res.mainContractor.firstName + " " + res.mainContractor.lastName;
                    }
                    if (res.location) {

                        if (res.location.cities) {
                            item.cities = res.location.cities;
                        }

                        if (res.location.coordinate) {
                            item.geometry = this._parseGeometry(res.location.coordinate);
                        }

                        if (res.location.geometry) {
                            var tmp = this._parseGeometry(res.location.geometry);
                            if (!d_lang.isArray(tmp)) {
                                tmp = [tmp];
                            }
                            item.geometries = tmp;
                            item.geometriesExtent = this._createExtentForGeometries(item.geometries);
                        }

                    }

                    if (res.geometry) {
                        item.geometries = this._parseGeometry(res.geometry);
                        if (!d_lang.isArray(item.geometries)) {
                            item.geometries = [item.geometries];
                        }
                        item.geometriesExtent = this._createExtentForGeometries(item.geometries);
                    }

                    if (res.diversions) {

                        item.diversions = d_array.map(res.diversions, function (d) {

                            return this._parseSingleItem(d);

                        }, this);

                    }

                    if (res.diversionTypes) {
                        item.diversionTypes = res.diversionTypes;
                        item.streets = res.streets;
                    }

                    return item;

                },

                _formatPeriods: function (periods) {
                    var calendarDatePattern = "EEE dd/MM/yyyy";
                    var p = d_array.map(periods, function (period) {
                        var enddate = d_stamp.fromISOString(period.endDateTime),
                            startdate = d_stamp.fromISOString(period.startDateTime);
                        var end = this._getFormattedDate(enddate,
                            calendarDatePattern);
                        var start = this._getFormattedDate(startdate,
                            calendarDatePattern);
                        return {
                            enddate: end,
                            startdate: start,
                            enddateObject: enddate,
                            startdateObject: startdate
                        };
                    }, this);
                    return p;
                },

                _getFormattedDate: function (
                    date,
                    datePattern
                    ) {
                    return locale.format(date, {
                        datePattern: datePattern ? datePattern : this.datePattern,
                        timePattern: this.timePattern
                    });
                },

                _createExtentForGeometries: function (geometries) {

                    var ext = null;

                    d_array.forEach(geometries, function (g) {

                        if (g) {
                            ext = ext ? ext.expand(g.getExtent()) : g.getExtent();
                        }

                    });

                    return ext;

                },

                _parseGeometry: function (item) {
                    if (item) {
                        if (item.type === "Point") {

                            return this._parsePoint(item);

                        } else if (item.type === "GeometryCollection") {

                            return d_array.map(item.geometries, function (g) {

                                return this._parseGeometry(g);

                            }, this);

                        } else if (item.type === "Polygon") {

                            return this._parsePolygon(item);

                        } else if (item.type === "MultiPolygon") {

                            return this._parseMultiPolygon(item);

                        } else if (item.type === "LineString") {

                            return this._parseLineString(item);

                        } else if (item.type === "MultiLineString") {

                            return this._parseMultiLineString(item);

                        }
                    }
                },

                /*
                 *{
                 "coordinates": [4.2341796249590784, 50.735169252380111],
                 "type": "Point",
                 "crs": {
                 "type": "name",
                 "properties": {
                 "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                 }
                 }
                 }
                 */

                _parseLineString: function (geom) {

                    if (geom.coordinates) {
                        var srs = this._parseSrs(geom.crs);

                        return new Polyline({
                            paths: [geom.coordinates],
                            spatialReference: srs
                        });

                    }

                },

                _parseMultiLineString: function (geom) {

                    if (geom.coordinates) {
                        var srs = this._parseSrs(geom.crs);

                        return new Polyline({
                            paths: geom.coordinates,
                            spatialReference: srs
                        });

                    }

                },

                _parsePolygon: function (geom) {

                    if (geom.coordinates) {
                        var srs = this._parseSrs(geom.crs);

                        var rings = d_array.map(geom.coordinates, function (l) {
                            return l;
                        });

                        return new Polygon({
                            rings: rings,
                            spatialReference: srs
                        });

                    }

                },

                _parseMultiPolygon: function (geom) {

                    if (geom.coordinates) {
                        var srs = this._parseSrs(geom.crs);

                        var rings = [];

                        d_array.forEach(geom.coordinates, function (l) {

                            d_array.forEach(l, function (ring) {

                                rings.push(ring);

                            });

                        });

                        return new Polygon({
                            rings: rings,
                            spatialReference: srs
                        });

                    }

                },

                _parsePoint: function (geom) {

                    if (geom.coordinates) {
                        var srs = this._parseSrs(geom.crs);
                        return ct_geometry.createPoint(geom.coordinates[0], geom.coordinates[1], srs);
                    }

                },

                _parseSrs: function (crs) {
                    var srs;
                    if (crs && crs.type && crs.properties && crs.properties[crs.type]) {
                        srs = crs.properties[crs.type];
                        var srsSplit = srs.split(":");
                        srs = srsSplit[srsSplit.length - 1];
                    } else {
                        srs = 3857;
                    }
                    srs = ct_geometry.createSpatialReference({wkid: srs || ""});
                    return srs;
                }

            }
        );
    }
);