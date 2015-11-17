define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/aspect",
        "ct/_lang",
        "ct/array",
        "ct/_when",
        "ct/request",
        "ct/_string",
        "ct/_Connect",
        "dojo/Deferred",
        "dojo/DeferredList",
        "ct/mapping/mapcontent/ServiceTypes",
        "ct/mapping/store/MapServerLayerStore",
        "./WMSFeatureInfoStore",
        "./WMTSFeatureInfoStore",
        "./AttributeConfigHelper",
        "ct/store/ComplexMemory"

    ],
    function (
        declare,
        d_array,
        d_lang,
        d_aspect,
        ct_lang,
        ct_array,
        ct_when,
        ct_request,
        ct_string,
        Connect,
        Deferred,
        DeferredList,
        ServiceTypes,
        MapServerLayerStore,
        WMSFeatureInfoStore,
        WMTSFeatureInfoStore,
        AttributeConfigHelper,
        ComplexMemory
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         * @fileOverview This file provides the means to retrieves stores from the mapModel.
         */
        return declare([Connect],
            /**
             * @lends ct.bundles.featureinfo.MapModelStoreHelper.prototype
             */
            {
                /**
                 * @constructs
                 * @param args arguments
                 */
                constructor: function (args) {
                    this._ignoreLayers = ct_lang.chkProp(args, "ignoreLayers", []);
                    this._i18n = ct_lang.chkProp(args, "_i18n", []);
                    this._ignoreVisibility = ct_lang.chkProp(args, "ignoreVisibility", false);
                    this._useAllOperationalNodes = ct_lang.chkProp(args, "useAllOperationalNodes", false);
                    this._configHelper = new AttributeConfigHelper();
                },

                activate: function () {
                    this._generalTypeMapping = [];
                    ct_when(this._identifyConfigStore.query({generalMapping: true}, {}), function (resp) {
                        var appGeneralTypeMapping = this._properties.generalTypeMapping;
                        if (resp.length === 0) {
                            // if no general mapping defined (db config), use only app config
                            this._generalTypeMapping = appGeneralTypeMapping;
                        } else {
                            ct_when(this._getConfigList(resp), function (configList) {
                                // merge app config and db config
                                var mergedAttr;
                                d_array.forEach(configList, function (config) {
                                    if (config[0]) {
                                        mergedAttr = this._configHelper.mergeAttributes(appGeneralTypeMapping,
                                            config[1]);
                                    }
                                }, this);
                                this._generalTypeMapping = mergedAttr;
                            }, this);
                        }
                    }, this);

                    this._layerTypeMapping = this._properties.layerTypeMapping;

                    this._configuredServices = this._mrr.getServiceResources();
                    this._configuredServices = d_array.map(this._configuredServices, function (item) {
                        return {
                            serviceUrl: item.serviceUrl.toLowerCase().split("?")[0],
//BartVerbeeck Bug32185                            
                            serviceQuerystring: item.serviceUrl.toLowerCase().split("?")[1],
                            item: item
                        };
                    });
                },

                _getConfigList: function (resp) {
                    var configList = [];
                    d_array.forEach(resp, function (item) {
                        var d = new Deferred();
                        var id = item.id;
                        ct_when(ct_request.requestJSON({
                            url: ct_string.stringReplace(this._properties.target, {id: id})
                        }), function (config) {
                            d.resolve(config);
                        }, this);
                        configList.push(d);
                    }, this);
                    return new DeferredList(configList);
                },

                deactivate: function () {
                    this._ignoreLayers = null;
                },

                _checkLayerVisibility: function (layerNode) {
                    return layerNode.get("visibleInMap");
                },

                _createAGSStore: function (
                    serviceNode,
                    layerNode
                    ) {
                    //title?
                    //useIn?
                    //filterOptions? -> metadata
                    var d = new Deferred();
                    var mapModelNodeId = layerNode.get("id");
                    var storeId = mapModelNodeId;
                    var layerId = layerNode.get("layerId");
                    var service = serviceNode.get("service");
                    var target = layerNode.get("url") || (service.get("serviceUrl") + "/" + layerId);
                    var parentNode = layerNode.get("parent");
                    var preConfiguredIdProperty = layerNode.get("idProperty") || parentNode.get("idProperty");
                    var store = new MapServerLayerStore({
                        target: target,
                        idProperty: preConfiguredIdProperty || "OBJECTID",
                        id: storeId,
                        mapModelNodeId: mapModelNodeId
                    });
                    d.resolve({
                        supportsIndividualFeatures: true,
                        layerId: layerId,
                        layerTitle: layerNode.get("title"),
                        serviceId: service.get("id"),
                        serviceType: service.get("serviceType"),
                        store: store,
                        storeId: storeId,
                        mapModelNodeId: mapModelNodeId,
                        order: 4,
                        idProperty: !preConfiguredIdProperty && store.fetchIdPropertyFromMetadata ? ct_when(store.fetchIdPropertyFromMetadata(),
                            function (idProperty) {
                                layerNode.set("idProperty", idProperty);
                                return idProperty;
                            }) : store.idProperty
                    });
                    return d;
                },

                createWMTSStoreKVP: function (
                    serviceNode,
                    layerId
                    ) {
                    var d = new Deferred();
                    var service = serviceNode.get("service"),
                        selformat = "text/xml",
                        resultType = "xml";
                    var storeId = "temporaryFeatureInfoStore_" + layerId;
                    var serviceId = service.getLocalId();
                    var serviceType = service.get("serviceType");
                    var serviceUrl = service.get("serviceUrl");
                    var appLayerTypeMapping = ct_array.arraySearchFirst(this._layerTypeMapping, {
                        serviceId: serviceId,
                        layerId: layerId
                    });
                    var identifyConfigUrl;

                    // internal services has configId property
                    var configId = serviceNode.get("identifyConfigId");

                    // for external services, look for already defined resources based on serviceURL and layerId
                    if (configId && configId !== "") {
                        identifyConfigUrl = ct_string.stringReplace(this._properties.target, {id: configId});
                    }

                    var areaAndLengthAttrNames = this._properties.areaAndLengthAttrNames;
                    var store = new WMTSFeatureInfoStore(storeId, this._mapState, 0, selformat, resultType,
                        this._generalTypeMapping, appLayerTypeMapping, identifyConfigUrl, this._identifyMappingStore,
                        serviceId, layerId, serviceUrl, this._configuredServices, this._configHelper,
                        areaAndLengthAttrNames);
                    store.queryLayers = [layerId];
                    store.serviceId = serviceId;
                    d.resolve({
                        supportsIndividualFeatures: false,
                        layerId: layerId,
                        layerTitle: serviceNode.get("title"),
                        serviceId: serviceId,
                        serviceType: serviceType,
                        idProperty: store.getIdProperty(),
                        infotype: "WMS_FEATURE_INFO",
                        resultType: resultType,
                        order: 4,
                        store: store
                    });
                    return d;
                },

                createDirectKMLStore: function (
                    serviceNode,
                    layerId
                    ) {
                    var d = new Deferred();
                    var esriMap = this._map.esriMap;
                    var graphicsLayerIds = esriMap.graphicsLayerIds;
                    var data = [];
                    var fields;
                    var objectIdField;
                    d_array.forEach(graphicsLayerIds, function (graphicLayerId) {
                        var layer = esriMap.getLayer(graphicLayerId);
                        if (layer.__managed === serviceNode.id) {
                            d_array.forEach(layer.graphics, function (item) {
                                item.attributes["geometry"] = item.geometry;
                                data.push(item.attributes);
                            });
                            fields = layer.fields;
                            objectIdField = layer.objectIdField;
                        }
                    }, this);
                    var store = new ComplexMemory({
                        data: data,
                        idProperty: objectIdField,
                        getMetadata: function () {
                            return {
                                fields: fields
                            };
                        }
                    });
                    d.resolve({
                        layerId: layerId,
                        infotype: "GRID",
                        layerTitle: serviceNode.get("title"),
                        store: store,
                        resultType: "json"
                    });
                    return d;
                },

                createGeoJsonStore: function (
                    serviceNode,
                    layerId
                    ) {

                    var d = new Deferred();
                    var esriMap = this._map.esriMap;
                    var graphicsLayerIds = esriMap.graphicsLayerIds;
                    var data = [];
                    var fields;
                    var objectIdField;
                    d_array.forEach(graphicsLayerIds, function (graphicLayerId) {
                        var layer = esriMap.getLayer(graphicLayerId);
                        if (layer.__managed === serviceNode.id) {
                            d_array.forEach(layer.graphics, function (item) {
                                item.attributes["geometry"] = item.geometry;
                                data.push(item.attributes);
                            });
                            fields = layer.fields;
                            objectIdField = layer.objectIdField;
                        }
                    }, this);
                    var store = new ComplexMemory({
                        data: data,
                        idProperty: objectIdField,
                        getMetadata: function () {
                            return {
                                fields: fields
                            };
                        }
                    });
                    d.resolve({
                        layerId: layerId,
                        infotype: "GRID",
                        layerTitle: serviceNode.get("title"),
                        store: store,
                        resultType: "json"
                    });
                    return d;
                },

                createWMSStoreKVP: function (
                    serviceNode,
                    layerNode
                    ) {
                    var d = new Deferred();
                    var esriLayer,
                        service = serviceNode.get("service");
                    if (this._map) {
                        esriLayer = this._map.esriLayerManager.getEsriLayer(serviceNode, true);
                        if (!esriLayer && this._compareMap) {
                            esriLayer = this._compareMap.esriLayerManager.getEsriLayer(serviceNode, true);
                        }

                        var getInfos = function (
                            esriLayer,
                            layerNode
                            ) {
                            var selformat,
                                resultType = "xml";
                            var supportedFormats = esriLayer.infoFormat || [];
                            selformat = ct_array.arraySearchFirst(supportedFormats,
                                "application/vnd.esri.wms_featureinfo_xml");
                            if (!selformat) {
                                selformat = ct_array.arraySearchFirst(supportedFormats, "application/vnd.ogc.wms_xml");
                            }
                            
                            if (!selformat) {
                                selformat = ct_array.arraySearchFirst(supportedFormats, "application/json");
                                resultType = "json";
                            }
                            if (!selformat) {
                                selformat = ct_array.arraySearchFirst(supportedFormats, "text/html");
                                resultType = "text";
                            }
                            if (!selformat) {
                                selformat = "text/plain";
                                resultType = "text";
                            }
                            if (!selformat) {
                                selformat = ct_array.arraySearchFirst(supportedFormats, "text/xml");
                            }
                            var storeId = "temporaryFeatureInfoStore_" + layerNode.get("id");
                            var serviceId = service.getLocalId();
                            var serviceType = service.get("serviceType");
                            var serviceUrl = service.get("serviceUrl");
                            var layerId = layerNode.get("layerId");

                            // internal services has configId property
                            var configId = serviceNode.get("identifyConfigId");

                            // for external services, look for already defined resources based on serviceURL and layerId
                            var identifyConfigUrl;
                            if (configId && configId !== "") {
                                identifyConfigUrl = ct_string.stringReplace(this._properties.target, {id: configId});
                            } else {
                                var existingServiceConf = ct_array.arraySearchFirst(this._configuredServices, {
                                    serviceUrl: serviceUrl.toLowerCase().split("?")[0]
                                });
                                if (existingServiceConf) {
                                    serviceId = existingServiceConf.item.getLocalId();
                                }
                            }

                            var appLayerTypeMapping = ct_array.arraySearchFirst(this._layerTypeMapping, {
                                serviceId: serviceId,
                                layerId: layerId
                            });
                            var areaAndLengthAttrNames = this._properties.areaAndLengthAttrNames;
                            var store = new WMSFeatureInfoStore(storeId, this._mapState, esriLayer, selformat,
                                resultType,
                                this._generalTypeMapping, appLayerTypeMapping, identifyConfigUrl,
                                this._identifyMappingStore,
                                serviceId, layerId, serviceUrl, this._configuredServices, this._configHelper,
                                areaAndLengthAttrNames);
                            store.queryLayers = [layerId];
                            store.serviceId = serviceId;
                            return {
                                supportsIndividualFeatures: false,
                                layerId: layerId,
                                layerTitle: serviceNode.get("title"),
                                serviceId: serviceId,
                                serviceType: serviceType,
                                idProperty: store.getIdProperty(),
                                infotype: "WMS_FEATURE_INFO",
                                resultType: resultType,
                                order: 4,
                                store: store
                            };
                        };

                        if (!esriLayer.loaded) {
                            this.connect("wms", esriLayer, "onLoad", this, function () {
                                this.disconnect();
                                d.resolve(d_lang.hitch(this, getInfos)(esriLayer, layerNode));
                            });
                        } else {
                            d.resolve(d_lang.hitch(this, getInfos)(esriLayer, layerNode));
                        }
                    }
                    return d;
                },

                //TODO: Better use factory for creating stores...
                _createStore: function (
                    layerNode,
                    serviceNode
                    ) {
                    try {
                        var serviceType = serviceNode.get("service").get("serviceType");
                        switch (serviceType) {
                            case ServiceTypes.AGS_TILED:
                            case ServiceTypes.AGS_DYNAMIC:
                            case ServiceTypes.AGS_FEATURE:
                                return this._createAGSStore(serviceNode, layerNode);
                            case ServiceTypes.WMS:
                                return this.createWMSStoreKVP(serviceNode, layerNode);
                            case ServiceTypes.INSPIRE_VIEW:
                                return this.createWMSStoreKVP(serviceNode, layerNode);
                            case ServiceTypes.WMTS:
                                return this.createWMTSStoreKVP(serviceNode, layerNode);
                            case ServiceTypes.DirectKML:
                                return this.createDirectKMLStore(serviceNode, layerNode);
                            case ServiceTypes.GeoJSON:
                                return this.createGeoJsonStore(serviceNode, layerNode);
                            default:
                                console.warn("MapModelStoreHelper: Service type '" + serviceType + " is not supported yet!");
                                return null;
                        }
                    } catch (e) {
                        console.warn("MapModelStoreHelper: Store for service '" + serviceNode.get("title") + "' could not be created!",
                            e);
                        return null;
                    }
                },

                _processLayerNodes: function (
                    enabledLayerNodes,
                    serviceNode
                    ) {
                    var d = new Deferred(),
                        deferreds = [];
                    d_array.forEach(enabledLayerNodes, function (layerNode) {
                        var layerId = layerNode.get("id");
                        if (ct_lang.chk(layerNode.queryable, true) &&
                            (ct_array.arrayFirstIndexOf(this._ignoreLayers, layerId) === -1) &&
                            (this._ignoreVisibility || this._checkLayerVisibility(serviceNode))) {
                            // create store
                            deferreds.push(this._createStore(layerNode, serviceNode));
                        }
                    }, this);
                    ct_when(new DeferredList(deferreds), function (stores) {
                        if (stores[0]) {
                            d.resolve(d_array.map(stores, function (elem) {
                                return elem[1];
                            }, this));
                        } else {
                            d.reject();
                        }
                    }, function (error) {
                        d.reject(error);
                    }, this);
                    return d;
                },

                _processServiceNodes: function (enabledServicesNodes) {
                    var d = new Deferred(),
                        deferreds = [];
                    d_array.map(enabledServicesNodes, function (serviceNode) {
                        var enabledLayerNodes = serviceNode.getEnabledLayerNodes();

                        var service = serviceNode.service;

                        if (service.serviceType === ServiceTypes.WMTS) {
                            if (this._checkLayerVisibility(serviceNode)) {
                                var layerId = service.options.layerInfo.identifier;
                                if (ct_array.arrayFirstIndexOf(this._ignoreLayers, layerId) === -1) {
                                    // create store
                                    deferreds.push(this._createStore(layerId, serviceNode));
                                }
                            }
                        } else if (service.serviceType === ServiceTypes.WMS || service.serviceType === ServiceTypes.DirectKML || service.serviceType === ServiceTypes.GeoJSON) {
                            deferreds.push(this._processLayerNodes(enabledLayerNodes, serviceNode));
                        }
                    }, this);

                    ct_when(new DeferredList(deferreds), function (storeInfos) {
                        var infos = [];
                        d_array.forEach(storeInfos, function (storeInfo) {
                            if (storeInfo[1]) {
                                infos = infos.concat(storeInfo[1]);
                            }
                        }, this);
                        d.resolve(infos);
                    }, function (error) {
                        d.reject(error);
                    }, this);

                    return d;
                },

                getStoreInfo: function (node) {
                    node = this._mapModel.getNodeById(node.id);
                    return this._processServiceNodes([node]);
                },

                getStoreInfos: function () {
                    console.debug("MapModelStoreHelper: analyzing map model");
                    var operationalLayers = this._mapModel.getOperationalLayer();
                    var serviceNodes;
                    var d = new Deferred();
                    if (this._useAllOperationalNodes) {
                        serviceNodes = this._mapModel.getServiceNodes(operationalLayers);
                        if (this._compareMapModel) {
                            serviceNodes = serviceNodes.concat(this._compareMapModel.getServiceNodes(this._compareMapModel.getOperationalLayer()));
                        }
                    } else {
                        serviceNodes = this._mapModel.getEnabledServiceNodes(operationalLayers);
                        if (this._compareMapModel) {
                            serviceNodes = serviceNodes.concat(this._compareMapModel.getEnabledServiceNodes(this._compareMapModel.getOperationalLayer()));
                        }
                    }
                    ct_when(this._processServiceNodes(serviceNodes), function (storeInfos) {
//                        here we sort them according to the specified order
//                Found POI 0
//                Found Address 1
//                Found Parcel 2
//                Geometry 3
//                Clicked point 4
                        storeInfos = ct_array.arraySort(storeInfos, {order: false});
                        d.resolve(storeInfos);
                    }, function (error) {
                        d.reject(error);
                    }, this);
                    return d;
                }
            });
    });