define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "ct/array",
        "ct/_Connect",
        "dojo/data/ObjectStore",
        "dojo/store/Memory",
        "dijit/tree/ForestStoreModel",
        "./CopyrightBuilderWidget",
        "."
    ],

    function (
        declare,
        d_lang,
        d_array,
        ct_array,
        _Connect,
        ObjectStore,
        Memory,
        ForestStoreModel,
        CopyrightBuilderWidget,
        _moduleRoot
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */
        return _moduleRoot.CopyrightBuilderController = declare([_Connect],
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
                    var i18n = this._i18n.get().copyrightBuilderWidget;
                    var properties = this._properties || {};
                    var opts = d_lang.mixin({
                            i18n: i18n,
                            configAdminService: this._configAdminService,
                            dataFormService: this._dataFormService
                        },
                        properties.widgetProperties);
                    var widget = this._builderWidget = new CopyrightBuilderWidget(opts);
                    this._builderWidget.set("position",
                        this._builderWidget.getComponentProperties().position);
                    this.images = this._builderWidget.getComponentProperties().images;
                    this.connect("onUpdateConfig", widget,
                        "onUpdateConfig",
                        "_updateConfig");
//                        this.connect("onUpdateConfig", widget, "onUpdateConfig", "_updateConfig");

                    this._initStores();
                    return widget;
                },

                _updateConfig: function (evt) {
                    this.config = {
                        position: this._builderWidget.position,
                        images: []
                    };
                    this._prepareConfig();
                    this._builderWidget.fireConfigChangeEvent(this.config);
                },

                _initStores: function () {
                    if (this._mrr._mrTree && this._mrr._mrTree.get("children").length > 0) {
                        var services = this._prepareServiceNodes();
                        if (services && services.length > 0) {
                            var memory = this._memory = new Memory({
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

                _prepareConfig: function () {
                    if (this._memory && this._memory.data) {
                        var data = this._memory.data;
                        d_array.forEach(data, d_lang.hitch(this,
                            function (item) {
                                this._configureItem(item);
                            }));
                    }
                },

                _configureItem: function (item) {
                    if (this._hasProps(item)) {
                        this._addItemToConfig(item);
                    }
                    if (item.isService && item.children && item.children.length) {
                        d_array.forEach(item.children,
                            d_lang.hitch(this,
                                function (child) {
                                    this._configureItem(child);
                                }))
                    }
                },

                _addItemToConfig: function (item) {
                    var cItem = {};
                    if (item.props.img) {
                        cItem['img'] = item.props.img;
                    }
                    if (item.props.copyright) {
                        cItem['copyright'] = item.props.copyright;
                    }
                    if (item.props.link) {
                        cItem['link'] = item.props.link;
                    }
                    if (item.props.text) {
                        cItem['text'] = item.props.text;
                    }
                    var enabled = {serviceurl: [item.serviceUrl]};
                    if (item.isService) {
                        enabled['serviceid'] = item.id;
                    } else {
                        enabled['serviceid'] = item.service;
                        enabled['layerid'] = [item.id];
                    }
                    cItem['enabled'] = enabled;
                    this.config.images.push(cItem);
                },

                _hasProps: function (item) {
                    if (item && item.props && (item.props.copyright || item.props.img || item.props.link || item.props.text)) {
                        return true;
                    } else {
                        return false;
                    }
                },

                _prepareServiceNodes: function () {
                    var serviceResources = this._mrr.getServiceResources();
                    var services = [];
                    d_array.forEach(serviceResources,
                        d_lang.hitch(this,
                            function (serviceResource) {
                                var serviceType = serviceResource.get("serviceType");
                                var id = serviceResource.get("uniqueId").toString();
                                var serviceUrl = serviceResource.get("serviceUrl").toString();
                                var title = serviceResource.get("title") || id;
                                var layers;
                                var props = this._findConfig(serviceUrl,
                                    id);
                                if (serviceType == "WMTS" || serviceType == "NAVTEQ") {
                                    services.push({
                                        id: id,
                                        serviceUrl: serviceUrl,
                                        props: props,
                                        isService: true,
                                        title: title
                                    });
                                } else {
                                    layers = this._prepareLayers(id,
                                        serviceUrl);
                                    if (layers && layers.length > 0) {
                                        services.push({
                                            id: id,
                                            serviceUrl: serviceUrl,
                                            props: props,
                                            isService: true,
                                            title: title,
                                            children: layers
                                        });
                                    }
                                }
                            }));
                    return services;
                },

                _findConfig: function (
                    serviceurl,
                    serviceid,
                    layerid
                    ) {
                    for (var i = 0; i < this.images.length; i++) {
                        var image = this.images[i];
                        if (layerid) {
                            if (image.enabled.serviceurl && ct_array.arrayFirstIndexOf(image.enabled.serviceurl,
                                serviceurl) > -1 &&
                                image.enabled.serviceid &&
                                image.enabled.serviceid == serviceid &&
                                image.enabled.layerid && ct_array.arrayFirstIndexOf(image.enabled.layerid,
                                layerid) > -1) {
                                return {
                                    img: image.img,
                                    text: image.text,
                                    copyright: image.copyright,
                                    link: image.link
                                };
                            }
                        }
                        else {
                            if ((image.enabled.serviceurl && ct_array.arrayFirstIndexOf(image.enabled.serviceurl,
                                serviceurl) > -1 &&
                                image.enabled.serviceid &&
                                image.enabled.serviceid == serviceid) && !image.enabled.layerid) {
                                return {
                                    img: image.img,
                                    text: image.text,
                                    copyright: image.copyright,
                                    link: image.link
                                };
                            }
                        }
                    }
                    return {
                        img: "",
                        copyright: "",
                        text: "",
                        link: ""
                    };
                },

                _prepareLayers: function (
                    serviceId,
                    serviceUrl
                    ) {
                    var layers = [];
                    var layerResources = this._mrr.getChildMappingResources(serviceId);
                    d_array.forEach(layerResources,
                        d_lang.hitch(this,
                            function (layerResource) {
                                var id = layerResource.get("layerId").toString();
                                var props = this._findConfig(serviceUrl,
                                    serviceId,
                                    id);
                                var title = layerResource.title || layerResource.layerId;
                                layers.push({
                                    id: id,
                                    title: title,
                                    props: props,
                                    service: serviceId,
                                    serviceUrl: serviceUrl
                                })
                            }));
                    return layers;
                }

            });
    });