define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "ct/_Connect",
        "dojo/data/ObjectStore",
        "dojo/store/Memory",
        "dijit/tree/ForestStoreModel",
        "./MapModelStoreBuilderWidget",
        "."
    ],

    function (
        declare,
        d_lang,
        d_array,
        _Connect,
        ObjectStore,
        Memory,
        ForestStoreModel,
        MapModelStoreBuilderWidget,
        _moduleRoot
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */
        return _moduleRoot.MapModelStoreBuilderController = declare([_Connect],
            /**
             * @lends ct.bundles.genericidentify.config.MapModelStoreBuilder.prototype
             */
            {

                /**
                 * @constructs
                 */
                constructor: function () {
                },

                createInstance: function () {
                    var i18n = this._i18n.get().mapModelStoreBuilderWidget;
                    var properties = this._properties || {};
                    var serviceResources = this._mrr.getServiceResources();
                    var services = [];
                    var layers = [];
                    d_array.forEach(serviceResources,
                        function (item) {
                            var localId = item.getLocalId();
                            var service = {
                                id: localId,
                                title: item.title
                            }
                            services.push(service);
                            var layerList = d_array.map(this._mrr.getChildMappingResources(localId),
                                function (res) {
                                    var layer = {
                                        serviceId: localId,
                                        id: res.layerId,
                                        title: res.title
                                    }
                                    return layer;
                                });
                            layers = layers.concat(layerList);
                        }, this);

                    var opts = d_lang.mixin({
                            i18n: i18n,
                            configAdminService: this._configAdminService,
                            dataFormService: this._dataFormService,
                            services: services,
                            layers: layers
                        },
                        properties.widgetProperties);
                    var widget = this._builderWidget = new MapModelStoreBuilderWidget(opts);
                    this.connect("onUpdateConfig", widget,
                        "onUpdateConfig",
                        "_updateConfig");
                    this._initForm();
                    this._initStores();
                    return widget;
                },

                _updateConfig: function (evt) {
                    this._builderWidget.fireConfigChangeEvent(evt);
                },

                _initStores: function () {
                    if (this._mrr._mrTree && this._mrr._mrTree.get("children").length > 0) {
                        var services;
                        if (this._model) {
                            services = this._prepareServiceNodesOfModel(this._model);
                        } else {
                            services = this._prepareServiceNodes();
                        }
                        if (services && services.length > 0) {
                            var memory = new Memory({
                                data: services
                            });

                            var store = new ObjectStore({
                                objectStore: memory,
                                labelProperty: "title"
                            });

                            this._serviceTreeModel = new ForestStoreModel({
                                store: store,
                                childrenAttrs: ["children"],
                                mayHaveChildren: function (item) {
                                    return item.isService;
                                }
                            });
                            this._builderWidget.set("serviceTreeModel",
                                this._serviceTreeModel);
                        }
                    }
                },

                _prepareServiceNodes: function () {
                    var serviceResources = this._mrr.getServiceResources();
                    var services = [];
                    //var serviceTypes = ["WMTS", "WMS", "AGS_DYNAMIC", "AGS_TILED", "INSPIRE_VIEW"];
                    var serviceTypes = [
                        "WMS",
                        "INSPIRE_VIEW"
                    ];
                    d_array.forEach(serviceResources,
                        function (serviceResource) {
                            var serviceType = serviceResource.get("serviceType");
                            if (d_array.indexOf(serviceTypes,
                                serviceType) > -1) {
                                var id = serviceResource.get("uniqueId").toString();
                                var title = serviceResource.get("title") || id;
                                var layers;
                                if (serviceType == "WMTS") {
                                    var wmtsId = serviceResource.options.layerInfo.identifier;
                                    layers = [
                                        {
                                            id: wmtsId,
                                            title: wmtsId || "Layer",
                                            service: id
                                        }
                                    ]
                                } else {
                                    layers = this._prepareLayers(id);
                                }
                                if (layers && layers.length > 0) {
                                    services.push({
                                        id: id,
                                        isService: true,
                                        title: title,
                                        children: layers
                                    });
                                }
                            }
                        }, this);
                    return services;
                },

                _prepareServiceNodesOfModel: function (model) {
                    var serviceNodes = model.getServiceNodes();
                    var serviceResources = this._mrr.getServiceResources();
                    var services = [];
                    d_array.forEach(serviceResources,
                        function (serviceResource) {
                            var serviceId = serviceResource.get("uniqueId").toString();
                            var serviceTitle = serviceResource.get("title") || serviceId;
                            var layers = [];
                            d_array.forEach(serviceNodes,
                                function (serviceNode) {
                                    if (serviceNode.service.title == serviceId) {
                                        layers.push({
                                            id: serviceNode.id,
                                            title: serviceNode.title,
                                            service: serviceId
                                        })
                                    }
                                },
                                this);
                            if (layers.length > 0) {
                                services.push({
                                    id: serviceId,
                                    isService: true,
                                    title: serviceTitle,
                                    children: layers
                                });
                            }
                        }, this);
                    return services;
                },

                _prepareLayers: function (serviceId) {
                    var layers = [];
                    var layerResources = this._mrr.getChildMappingResources(serviceId);
                    d_array.forEach(layerResources,
                        function (layerResource) {
                            var title = layerResource.title || layerResource.layerId;
                            layers.push({
                                id: layerResource.get("layerId").toString(),
                                title: title,
                                service: serviceId
                            })
                        });
                    return layers;
                },

                _initForm: function () {
                    var generalTypeMapping = this._builderWidget.getComponentProperties().generalTypeMapping;
                    var layerTypeMapping = this._builderWidget.getComponentProperties().layerTypeMapping;

                    this._builderWidget.set("generalTypeMapping",
                        generalTypeMapping);
                    this._builderWidget.set("layerTypeMapping",
                        layerTypeMapping);
                }

            });
    });