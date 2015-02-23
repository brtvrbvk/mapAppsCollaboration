define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/Deferred",
        "ct/_when",
        "ct/request",
        "ct/mapping/mapcontent/ServiceTypes"
    ],
    function (
        declare,
        d_array,
        Deferred,
        ct_when,
        ct_request,
        ServiceTypes
        ) {
        return declare([],
            /**
             * @lends mrrbuilder.ServiceResolver.prototype
             */
            {
                constructor: function (opts) {
                    opts = opts || {};
                    this.url = opts.url;
                },

                resolve: function () {
                    if (this._isAGSUrl()) {
                        return ct_when(ct_request({
                            url: this.url,
                            content: {
                                f: "json"
                            },
                            handleAs: "json",
                            callbackParamName: "callback"
                        }), "_analyzeResponse", this);
                    }
                    var d = new Deferred();
                    d.reject({
                        error: "Unsupported Service Type!"
                    });
                    return d;
                },
                _isAGSUrl: function () {
                    var url = this.url;
                    return (/\/(MapServer|FeatureServer)/).test(url);
                },
                _isWMS: function () {
                    //TODO: works only for ags wms services
                    var url = this.url;
                    return (/\/WMS/).test(url);
                },
                _analyzeResponse: function (serviceResponse) {
                    var isFeatureServer = (/\/FeatureServer/).test(this.url);
                    if (isFeatureServer) {
                        return this._createAGSService(serviceResponse, ServiceTypes.AGS_FEATURE);
                    } else if (serviceResponse.singleFusedMapCache) {
                        return this._createAGSService(serviceResponse, ServiceTypes.AGS_TILED);
                    } else {
                        return this._createAGSService(serviceResponse, ServiceTypes.AGS_DYNAMIC);
                    }
                },

                _createAGSService: function (
                    json,
                    type
                    ) {
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
                     */
                    var layer = {
                        id: String(serviceLayer.id),
                        title: serviceLayer.name
                    }
                    if ((serviceLayer.subLayerIds || []).length) {
                        // group layer are not queryable
                        layer.queryable = false;
                    }
                    if (serviceLayer.parentLayerId !== undefined && serviceLayer.parentLayerId != -1) {
                        layer.parentId = String(serviceLayer.parentLayerId);
                    }
                    if (serviceLayer.maxScale) {
                        layer.maxScale = serviceLayer.maxScale;
                    }
                    if (serviceLayer.minScale) {
                        layer.minScale = serviceLayer.minScale;
                    }
                    return layer;
                }
            });
    });