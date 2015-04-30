/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 06.08.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/Deferred",
        "ct/_when",
        "ct/array",
        "ct/Stateful",
        "ct/request",
        "ct/mapping/store/MapServerLayerStore",
        "base/util/distance",
        "esri/geometry/jsonUtils"
    ],
    function (
        declare,
        d_lang,
        d_array,
        Deferred,
        ct_when,
        ct_array,
        Stateful,
        ct_request,
        MapServerLayerStore,
        distance,
        e_jsonUtils
        ) {
        return declare([Stateful],
            {
                constructor: function () {
                    this._stores = {};
                },

                _calculatedNearestDistance: function (
                    point,
                    geom
                    ) {
//                    point = this.coordinateTransformer.transform(point, "EPSG:4326");
                    var currentDistance = Number.POSITIVE_INFINITY;
                    if (geom.rings) {
                        currentDistance = this._calcDistArrayBasedGeometry(geom.rings, geom, point);
                    } else if (geom.paths) {
                        currentDistance = this._calcDistArrayBasedGeometry(geom.paths, geom, point);
                    } else if (geom.x) {
                        currentDistance = distance.fromTo(point, geom);
                    }

                    return currentDistance;

                },

                _calcDistArrayBasedGeometry: function (
                    array,
                    geom,
                    point
                    ) {

                    var currentDistance = Number.POSITIVE_INFINITY;
                    d_array.forEach(array, function (e) {
                        d_array.forEach(e, function (coordinatePair) {
                            var p = e_jsonUtils.fromJson({
                                x: coordinatePair[0],
                                y: coordinatePair[1],
                                spatialReference: geom.spatialReference
                            });
//                            p = this.coordinateTransformer.transform(p, "EPSG:4326");
//                            var d = Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2));
                            var d = distance.fromTo(point, p);
                            if (d < currentDistance) {
                                currentDistance = d;
                            }
                        }, this);
                    }, this);
                    return currentDistance;

                },

                _searchWithExtendingRadius: function (
                    node,
                    service,
                    position,
                    radius,
                    restConfig,
                    factor,
                    deferred
                    ) {
                    var store = this._stores[node.id];
                    var q = {
                        geometry: {
                            $envelopeintersects: e_jsonUtils.fromJson({
                                spatialReference: position.spatialReference,
                                xmin: position.x - radius * factor,
                                xmax: position.x + radius * factor,
                                ymin: position.y - radius * factor,
                                ymax: position.y + radius * factor
                            })
                        }
                    };
                    ct_when(store.query(q, {
                        fields: {
                            geometry: true
                        }
                    }), function (res) {
                        if (res && res.length > 0) {
                            var nearestFeature, currentDistance = Number.POSITIVE_INFINITY;
                            d_array.forEach(res, function (result) {

                                if (result && result.geometry) {
                                    var d = this._calculatedNearestDistance(position, result.geometry);
                                    if (d < currentDistance) {
                                        currentDistance = d;
                                        nearestFeature = result;
                                    }
                                }

                            }, this);

                            if (restConfig.titleAttribute) {
                                nearestFeature.title = nearestFeature[restConfig.titleAttribute];
                            } else {
                                nearestFeature.title = nearestFeature.OBJECTID;
                            }
                            nearestFeature.distance = currentDistance;
                            nearestFeature.category = node.parent.parent.title;
                            nearestFeature.layer = node.parent.title;
                            deferred.resolve([nearestFeature]);
                        } else if (factor < 1) {
                            this._searchWithExtendingRadius(node, service, position, radius, restConfig, factor + 0.2,
                                deferred);
                        } else {
                            deferred.resolve(undefined);
                        }
                    }, function (error) {
                        deferred.reject(error);
                    }, this);
                },

                _continueAfterCapabilitiesParsed: function (
                    node,
                    service,
                    position,
                    radius,
                    deferred
                    ) {
                    var restConfig = this._getRestConfig(node, service);
                    if (restConfig) {
                        this._searchWithExtendingRadius(node, service, position, radius, restConfig, 0.2, deferred);
                    }
                },

                _getRestConfig: function (
                    node,
                    service
                    ) {

                    var parent = node.parent,
                        restConfig = d_lang.mixin({}, (service.options && service.options.REST) || {});
                    restConfig.url = parent.RESTurl || restConfig.url;
                    if (!restConfig.url) {
                        var restUrl = service.serviceUrl.split("//")[1];
                        restUrl = restUrl.split("/");
                        restConfig.url = "http://" + restUrl[0] + "/ArcGIS/rest/services/" + restUrl[restUrl.length - 1] + "/MapServer";
                    }
                    restConfig.layerId = node.RESTlayerId || parent.RESTlayerId || restConfig.layerId;
                    restConfig.titleAttribute = node.RESTtitleAttribute || parent.RESTtitleAttribute || restConfig.titleAttribute;
                    if (node.RESTignoreLayer || parent.RESTignoreLayer){
                        delete restConfig.url;
                    }
                    return restConfig;

                },

                canHandleRequest: function (
                    node,
                    service
                    ) {

                    var restConfig = this._getRestConfig(node, service);
                    return restConfig && restConfig.url;

                },

                requestInfo: function (
                    node,
                    service,
                    position,
                    radius
                    ) {

                    var restConfig = this._getRestConfig(node, service);

                    var d = new Deferred();

                    if (restConfig && restConfig.url) {
                        var store = this._stores[node.id];
                        if (!store) {

                            ct_when(ct_request.requestJSON({
                                url: restConfig.url + "?f=json"
                            }), function (res) {
                                var layerId = restConfig.layerId || node.layer.layerId;
                                if (res && res.layers) {
                                    d_array.forEach(res.layers, function (layer) {
                                        if (layer.name === layerId) {
                                            layerId = layer.id;
                                        }
                                    }, this);
                                }
                                store = new MapServerLayerStore({
                                    target: restConfig.url + "/" + layerId
                                });
                                this._stores[node.id] = store;
                                this._continueAfterCapabilitiesParsed(node, service, position, radius, d);

                            }, function (error) {
                                d.reject(error);
                            }, this);

                        } else {
                            this._continueAfterCapabilitiesParsed(node, service, position, radius, d);
                        }

                    } else {
                        d.resolve(undefined);
                    }

                    return d;
                }
            }
        );
    }
);