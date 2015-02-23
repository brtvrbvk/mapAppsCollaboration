/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author mss
 */

define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "esri/geometry/jsonUtils",
        "ct/mapping/geometry",
        "dojo/_base/json"
    ],

    function (
        declare,
        d_array,
        e_geometryUtils,
        ct_geometry,
        d_json
        ) {
        var RoutingParameterResolver = declare([], {


            constructor: function () {

            },

            activate: function () {
                console.debug("prj.ct.bundles.routing.RoutingParameterResolver.activate");
            },

            deactivate: function () {
                console.debug("prj.ct.bundles.routing.RoutingParameterResolver.deactivate");
            },

            persist: function () {
                return this.encodeURLParameter();
            },

            read: function (obj) {
                return this.decodeURLParameter(obj);
            },

            encodeURLParameter: function () {
                var info = this.routingController.getRoutingInfo();
                var items = info.items;
                var temp = {};
                if (items && items.length >= 2) {
                    var points = this._encodePoints(items);
                    if (!points || points.length < 2) {
                        return "";
                    }
                    temp.routingPoints = points;
                    var item = items[0].get("item");
                    if (item && item.geometry) {
                        temp.wkid = item.geometry.spatialReference.wkid;
                    }
                }
                temp.type = info.type;
                temp.transportMode = info.mode;
                return {
                    routing: d_json.toJson(temp)
                };
            },

            decodeURLParameter: function (
            /**JSON*/
                urlObject
                ) {
                var routing = urlObject && urlObject.routing && d_json.fromJson(urlObject.routing);
                if (routing && routing !== "undefined") {
                    var transportMode = routing.transportMode ? routing.transportMode : "car";
                    var type = routing.type ? routing.type : "fastest";
                    var wkid = routing.wkid;
                    var points = this._extractPoints(routing.routingPoints, wkid);
                    var evt = {
                        targets: points,
                        transportMode: transportMode,
                        type: type,
                        zoom: false
                    };
                    this.routingController.startRouting(evt);
                }
            },

            _encodePoints: function (boxes) {
                var points = new Array();
                d_array.forEach(boxes, function (
                    box,
                    idx
                    ) {
                    var item = box.get("item");
                    if (item && item.geometry) {
                        var point = {
                            x: item.geometry.x,
                            y: item.geometry.y
                        };
                        points.push(point);
                    }
                });
                return points;
            },

            _extractPoints: function (
                points,
                wkid
                ) {
                if (!points || points.length == 0) {
                    return new Array();
                }
                var result = new Array();
                d_array.forEach(points, function (
                    point,
                    idx
                    ) {
                    var esriPoint = e_geometryUtils.fromJson(point);
                    esriPoint.setSpatialReference(ct_geometry.createSpatialReference(wkid));
                    if (esriPoint) {
                        var obj = {
                            geometry: esriPoint
                        };
                        result.push(obj);
                    }
                }, this);
                return result;
            }

        });
        return RoutingParameterResolver;
    });