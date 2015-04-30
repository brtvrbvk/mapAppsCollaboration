define([
        "ct/_when",
        "ct/request",
        "ct/array",
        "ct/_Connect",
        "dojo/_base/declare",
        "dojo/_base/Deferred",
        "dojo/_base/array",
        "ct/mapping/map/EsriService",
        "base/mapping/layers/DelayedFeatureLayer",
        "esri/geometry/jsonUtils"
    ],
    function (
        ct_when,
        ct_request,
        ct_array,
        Connect,
        declare,
        Deferred,
        d_array,
        EsriService,
        DelayedFeatureLayer,
        jsonUtils
        ) {
        return declare([], {
            constructor: function() {
                this._listeners = new Connect();
            },

            createInstance: function () {
                var that = this;
                return {
                    create: function (
                        node,
                        url
                        ) {
                        return new EsriService({
                            mapModelNode: node,
                            isGraphicLayer: true,
                            url: url,
                            createEsriLayer: function () {
                                var options = {};
                                var def = new Deferred();
                                ct_when(ct_request({
                                    url: this.url,
                                    handleAs: "json"
                                }), function (geojson) {
                                    ct_when(that._getGeoJsonTransformer(), function(transformer) {
                                        var features = that.geoJsonTransformer.geojsonToGeometry(geojson);
                                        var geometryType = this._getMapping(features);
                                        var idFieldName = this._addIdProperty(features);
                                        var fields = this._getFields(features);
                                        var layerDefinition = {
                                            geometryType: geometryType,
                                            fields: fields,
                                            objectIdField: idFieldName,
                                            drawingInfo: {renderer: {
                                                type: "simple",
                                                label: "directkml",
                                                description: "",
                                                symbol: features[0].symbol
                                            }}
                                        };
                                        var collection = {
                                            featureSet: {
                                                features: features,
                                                geometryType: geometryType,
                                                spatialReference: {
                                                    wkid: 3857
                                                }
                                            },
                                            layerDefinition: layerDefinition
                                        };
                                        def.resolve(collection);
                                    }, this);
                                }, function (e) {
                                    def.reject(e);
                                }, this);
                                return new DelayedFeatureLayer(def, options);
                            },

                            _getMapping: function (features) {
                                return jsonUtils.getJsonType(features[0].geometry);
                            },
                            _addIdProperty: function (features) {
                                var options = this.mapModelNode.options || {};
                                var idProperty = options.idProperty ? options.idProperty : "OBJECTID";
                                var i = 0;
                                d_array.forEach(features, function (feature) {
                                    feature.attributes[idProperty] = i++;
                                }, this);
                                return idProperty;
                            },
                            _getFields: function (features) {
                                var fields = [];
                                d_array.forEach(features, function (feature) {
                                    var attr = feature.attributes;
                                    for (var prop in attr) {
                                        if (ct_array.arraySearchFirst(fields, {name: prop})) {
                                            return;
                                        }
                                        fields.push(
                                            {
                                                "name": prop,
                                                "type": "esriFieldTypeString"
                                            });
                                    }
                                });
                                return fields;
                            }

                        });
                    }
                }
            },

            setGeoJsonTransformer: function(geoJsonTransformer) {
                this.geoJsonTransformer = geoJsonTransformer;
            },

            _getGeoJsonTransformer: function() {
                var d = new Deferred();
                if (this.geoJsonTransformer) {
                    d.resolve(this.geoJsonTransformer);
                } else {
                    this._listeners.connect(this, "setGeoJsonTransformer", this, function() {
                        d.resolve(this.geoJsonTransformer);
                    });
                }
                return d;
            },

            deactivate: function() {
                this._listeners.disconnect();
            }
        });
    });