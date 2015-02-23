/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 17.10.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/Deferred",
        "ct/Stateful",
        "ct/_Connect",
        "ct/async",
        "ct/array",
        "ct/_when",
        "base/util/XMLUtils",
        "base/util/CommonID"
    ],
    function (
        declare,
        d_array,
        Deferred,
        Stateful,
        _Connect,
        ct_async,
        ct_array,
        ct_when,
        XMLUtils,
        CommonID
        ) {
        return declare([
                Stateful,
                _Connect
            ],
            {
                i18n: {ui: {errors: {400: "No KML"}}},
                _cache : {},

                constructor: function () {

                },

                activate: function () {

                    this.i18n = this._i18n.get();

                },

                deactivate: function () {

                },

                parse: function (
                    kml,
                    url,
                    options
                    ) {

                    var options = options || {};

                    var def = new Deferred();

                    if (this._getCachedCollection(url)) {
                        def.resolve(this._getCachedCollection(url));
                        return def;
                    }

//                    var meta = {};
//
//                    var networkLinks = XMLUtils.getTags("NetworkLink", kml);
//                    if (networkLinks && networkLinks.length > 0) {
//                        meta.wms = this._parseNetworkLinks(networkLinks);
//                    }
//
//                    return meta;

                    ct_async.hitch(this, function () {

                        try {

                            var extent;
                            var geojson = this.togeojsonTransformer.kmlToGeojson(kml);
                            var geojsonTypeMap = {};
                            //map features according to their type
                            d_array.forEach(geojson.features, function (feature) {

                                if (!geojsonTypeMap[feature.type]) {
                                    geojsonTypeMap[feature.type] = [];
                                }
                                geojsonTypeMap[feature.type].push(feature);

                            }, this);

                            var esrijsonFeatures = [];
                            var idProperty = options.idProperty ? options.idProperty : "OBJECTID";
                            var i = 0;
                            var fields = [];
                            //iterate typed featured and translate them to esrijson
                            for (var key in geojsonTypeMap) {
                                var features = this.geojsonTransformer.geojsonToGeometry({
                                    type: "FeatureCollection",
                                    features: geojsonTypeMap[key]
                                });

                                features = d_array.map(features, function (f) {

                                    //transform geometries to current srs
                                    f.geometry = this.coordinateTransformer.transform(f.geometry,
                                        this.mapState.getExtent().spatialReference.wkid);

                                    if (!extent) {
                                        extent = f.geometry.getExtent();
                                    } else {
                                        extent = extent.union(f.geometry.getExtent());
                                    }
                                    var attr = f.attributes;
                                    for (var prop in attr) {
                                        if (ct_array.arraySearchFirst(fields, {name: prop})) {
                                            //skip
                                        } else {
                                            fields.push({
                                                "name": prop,
                                                "type": "esriFieldTypeString"
                                            });
                                        }
                                    }

                                    f.attributes[idProperty] = i++;
                                    return f;

                                }, this);
                                esrijsonFeatures = esrijsonFeatures.concat(features);
                            }

                            var collection = {
                                features: esrijsonFeatures,
                                fields: fields,
                                objectIdField: idProperty,
                                extent: extent
                            };

                            this._cacheCollection(collection, url);

                            def.resolve(collection);
                        } catch (ex) {
                            def.reject(ex);
                        }

                    })();

                    return def;

                },

                _cacheCollection: function (
                    collection,
                    url
                    ) {

                    this._cache[url] = collection;

                },

                _getCachedCollection: function (url) {

                    return this._cache[url];

                },

                isValid: function (
                    kml,
                    url,
                    options
                    ) {

                    var def = new Deferred();

                    try {

                        ct_when(this.parse(kml, url, options), function (collection) {

                            if (collection.features.length === 0) {
                                def.reject({
                                    label: this.i18n.ui.errors[400],
                                    type: "error"
                                });
                            } else {
                                def.resolve(true);
                            }

                        }, function (error) {
                            def.reject({
                                label: this.i18n.ui.errors[400],
                                type: "error"
                            });
                        }, this);

                    } catch (ex) {
                        def.reject({
                            label: this.i18n.ui.errors[400],
                            type: "error"
                        })
                    }

                    return def;

                },

                _parseNetworkLinks: function (networkLinks) {

                    var services = [];

                    d_array.forEach(networkLinks, function (nwl) {

                        //also support deprecated Url Tag
                        var urls = XMLUtils.getTags("Url", nwl);
                        if (urls && urls.length > 0) {
                            services = services.concat(this._parseReferenceAttribute(urls));
                        }
                        var links = XMLUtils.getTags("Link", nwl);
                        if (links && links.length > 0) {
                            services = services.concat(this._parseReferenceAttribute(links));
                        }

                    }, this);

                    return services;

                },

                _parseReferenceAttribute: function (urls) {

                    var meta = [];

                    d_array.forEach(urls, function (url) {

                        var href = XMLUtils.getTagValue("href", url);
                        if (href && href.length > 0) {
                            var res = this._parseWMSMetadata(href);
                            if (res) {
                                meta.push(res);
                            }
                        }

                    }, this);

                    return meta;

                },

                _parseWMSMetadata: function (url) {

                    url = decodeURIComponent(url);
                    var parts = url.split("&");
                    var wms = {
                        url: url.split("?")[0],
                        layers: [],
                        styles: []
                    };
                    d_array.forEach(parts, function (part) {

                        var elem = part.split("=");
                        var attributeName = elem[0].toUpperCase();
                        switch (attributeName) {
                            case "LAYERS":
                                var layers = elem[1].split(",");
                                d_array.forEach(layers, function (layer) {

                                    var l = layer.split(":");
                                    wms.layers.push(l[l.length - 1]);

                                }, this);
                                break;
                            case "STYLES":
                                wms.styles.push(elem[1]);
                                break;
                        }

                    }, this);

                    return wms.layers.length > 0 ? wms : null;

                }
            }
        );
    }
);
