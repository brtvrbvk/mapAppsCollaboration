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
        "dojo/_base/Deferred",
        "dojo/json",
        "ct/request",
        "ct/_when",
        "ct/Stateful",
        "ct/Locale",
        "ct/Exception",
        "esri/geometry/jsonUtils"
    ],
    function (
        declare,
        d_array,
        Deferred,
        d_json,
        ct_request,
        ct_when,
        Stateful,
        Locale,
        Exception,
        e_geometryUtils
        ) {

        var illegalArgumentError = Exception.illegalArgumentError;

        return declare([Stateful], {

            _routerSRS: "4326",

            route: function (opts) {
                this._checkOpts(opts);
                var requestObject = {
                    app_id: this.appid || "APPID",
                    token: this.token || "TOKEN"
                };

                d_array.forEach(opts.targets, function (
                    target,
                    idx
                    ) {

                    var paramName = "waypoint" + idx;
                    if (!target.geometry) {
                        throw illegalArgumentError("No targetgeometry found");
                    }
                    var geom = this._ct.transform(target.geometry, this._routerSRS);
                    requestObject[paramName] = "geo!" + geom.y + "," + geom.x;

                }, this);

                if (opts.transportMode && opts.type) {
                    //example: fastest;car
                    requestObject.mode = opts.type + ";" + opts.transportMode;
                } else if (opts.transportMode && !opts.type) {
                    requestObject.mode = "fastest;" + opts.transportMode;
                } else {
                    requestObject.mode = "fastest;car";
                }

                requestObject.maneuverattributes = "shape";
                requestObject.routerepresentationmode = "navigation";

                requestObject.language = Locale.getCurrent().getLanguageISO3166Digit2();

                var def = new Deferred();
                var srs = this._mapState.getExtent().spatialReference.wkid;
                ct_when(ct_request.requestJSON({
                    url: this.routingService,
                    content: requestObject
                }), function (data) {
                    var results = {
                        routes: []
                    };
                    if (data.response && data.response.route) {
                        var routes = data.response.route;
                        results.routes = d_array.map(routes, function (r) {
                            var tmp = {
                                type: r.mode.type,
                                transportation: r.mode.transportModes
                            };
                            var tmproute = [],
                                ext, time = 0, l = 0;
                            d_array.forEach(r.leg, function (leg) {

                                time += leg.travelTime;
                                l += leg.length;
                                var part = {
                                    distance: leg.length,
                                    time: time,
                                    parts: [],
                                    end: {
                                        label: leg.end.label
                                    }
                                };
                                d_array.forEach(leg.maneuver, function (maneuver) {
                                    var tmpManeuver = {
                                        instruction: maneuver.instruction,
                                        distance: maneuver.length
                                    };
                                    if (maneuver.shape) {
                                        var shapes = d_array.map(maneuver.shape, function (s) {
                                            s = s.split(",");
                                            s.reverse();
                                            return s;
                                        });
                                        var t = {
                                            spatialReference: {
                                                wkid: this._routerSRS
                                            },
                                            paths: [shapes]
                                        };
                                        var geom = e_geometryUtils.fromJson(t);
                                        if (!ext) {
                                            ext = geom.getExtent();
                                        } else {
                                            ext = ext.union(geom.getExtent());
                                        }
                                        tmpManeuver.geometry = this._ct.transform(geom, srs);
                                    }
                                    part.parts.push(tmpManeuver);
                                }, this);
                                tmproute.push(part);
                            }, this);

                            tmp.stopovers = tmproute;
                            tmp.time = time;
                            tmp.distance = l;
                            tmp.extent = this._ct.transform(ext, srs);
                            tmp.destination = opts.targets[opts.targets.length - 1];
                            tmp.start = opts.targets[0];
                            return tmp;

                        }, this);

                    }
                    def.callback(results);
                }, function (error) {
//                    this.logger.error(this._i18n.get().error, error.responseText);
                    def.callback(dojo.fromJson(error.responseText));
                }, this);
                return def;
            },

            _checkOpts: function (opts) {
                if (!opts.targets) {
                    throw illegalArgumentError("No targets found");
                }
            }

        });
    });
