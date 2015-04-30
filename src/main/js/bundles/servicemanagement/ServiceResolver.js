define([
    "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/Deferred", "ct/_when", "ct/_lang", "ct/request", "ct/mapping/mapcontent/ServiceTypes", "ct/mapping/layers/WMSLayer", "ct/mapping/layers/InspireViewLayer", "dojo/on"
], function (declare, d_lang, d_array, Deferred, ct_when, ct_lang, ct_request, ServiceTypes, WMSLayer, InspireViewLayer, on) {
    return declare([], {
        constructor: function (opts) {
            opts = opts || {};
            this.url = opts.url;
            this.type = opts.type;
            this.options = opts.options;
        },
        resolve: function () {
            if (this._isAGSUrl()) {
                return this._fetchAGSMetadata();
            }
            if (this._isINSPIRE()) {
                return this._fetchWMSMetadata(true);
            } else if (this._isWMS()) {
                return this._fetchWMSMetadata();
            }
            var d = new Deferred();
            d.reject({
                error: "Unsupported Service Type!"
            });
            return d;
        },
        _isAGSUrl: function () {
            var url = this.url;
            return (/\/(MapServer|FeatureServer)\/?$/).test(url)
        },
        _isWMS: function () {
            //TODO: works only for ags wms services
            var url = this.url;
            return this.type === "WMS" || (/WMS/i).test(url);
        },
        _isINSPIRE: function () {
            //TODO: works only for ags wms services
            var url = this.url;
            return this.type === "INSPIRE_VIEW" || (/INSPIRE/i).test(url);
        },
        _fetchAGSMetadata: function () {
            return ct_when(ct_request({
                url: this.url,
                content: {
                    f: "json"
                },
                handleAs: "json",
                callbackParamName: "callback"
            }), "_analyzeAGSResponse", this);
        },
        _fetchWMSMetadata: function (isInspire) {
            isInspire = !!isInspire;
            var opts = this.options || {};
            var esriLayer = isInspire ? new InspireViewLayer(this.url, opts) : new WMSLayer(this.url, opts);
            var d = new Deferred();
            on(esriLayer, "load", d_lang.hitch(this, function () {
                if (d.isFulfilled()) {
                    return;
                }
                var layerInfos = esriLayer.layerInfos;
                d.resolve({
                    description: esriLayer.description,
                    title: esriLayer.title || "",
                    type: isInspire ? "INSPIRE_VIEW" : "WMS",
                    options: d_lang.mixin({}, opts, {
                        version: esriLayer.version
                    }),
                    layers: this._analyzeWMSLayerInfos(layerInfos)
                });
            }));
            on(esriLayer, "error", function (e) {
                if (d.isFulfilled()) {
                    return;
                }
                d.reject(e);
            });
            return d;
        },
        _analyzeWMSLayerInfos: function (layerInfos) {
            var layers = [];
            d_array.forEach(layerInfos, function (layer, i) {
                this._parseWMSLayer(layers, layer, undefined, i);
            }, this);
            return layers;
        },
        _parseWMSLayer: function (layers, layer, parentItem, index) {
            if (!layer.name) {
                // MappingResourceItems need ids!
                layer.name = parentItem ? parentItem.name + "-" + index : "parent-" + index;
            }
            if (parentItem) {
                layer.parentLayerId = parentItem.id;
            }
            var item = this._toLayerDefinition(layer);
            layers.push(item);
            d_array.forEach(layer.subLayers || [], function (sublayer, i) {
                this._parseWMSLayer(layers, sublayer, item, i);
            }, this);
        },
        _analyzeAGSResponse: function (serviceResponse) {
            var isFeatureServer = (/\/FeatureServer/).test(this.url);
            if (isFeatureServer) {
                return this._createAGSService(serviceResponse, ServiceTypes.AGS_FEATURE);
            } else if (serviceResponse.singleFusedMapCache) {
                return this._createAGSService(serviceResponse, ServiceTypes.AGS_TILED);
            } else {
                return this._createAGSService(serviceResponse, ServiceTypes.AGS_DYNAMIC);
            }
        },
        _createAGSService: function (json, type) {
            return {
                description: json.description || json.serviceDescription,
                title: (json.documentInfo && json.documentInfo.Title) || "",
                type: type,
                layers: this._toLayers(json.layers)
            };
        },
        _toLayers: function (serviceLayers) {
            return d_array.map(serviceLayers || [], this._toLayerDefinition, this);
        },
        _toLayerDefinition: function (serviceLayer) {
            /* props in servicelayer
             id: 0
             maxScale: 0
             minScale: 0
             name: "Topographic Info"
             parentLayerId: -1
             defaultVisibility : true | false
             */
            var layer = {
                id: String(ct_lang.chk(serviceLayer.id, serviceLayer.name)),
                title: serviceLayer.title || serviceLayer.name
            };
            if (serviceLayer.description) {
                layer.description = serviceLayer.description;
            }
            if (serviceLayer.queryable !== undefined) {
                layer.queryable = serviceLayer.queryable;
            }
            if ((serviceLayer.subLayerIds || serviceLayer.subLayers || []).length) {
                // group layer are not queryable
                delete layer.queryable;
            }
            if (serviceLayer.parentLayerId !== undefined && serviceLayer.parentLayerId !== -1) {
                layer.parentId = String(serviceLayer.parentLayerId);
            }
            if (serviceLayer.maxScale) {
                layer.maxScale = serviceLayer.maxScale;
            }
            if (serviceLayer.minScale) {
                layer.minScale = serviceLayer.minScale;
            }
            if (serviceLayer.defaultVisibility !== undefined) {
                layer.enabled = serviceLayer.defaultVisibility;
            }
            return layer;
        }
    });
});