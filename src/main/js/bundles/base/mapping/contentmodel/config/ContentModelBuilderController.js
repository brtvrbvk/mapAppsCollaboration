define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/string",
        "ct/array",
        "ct/_when",
        "ct/request",
        "ct/_Connect",
        "ct/_lang",
        "ct/Locale",
        "ct/mapping/mapcontent/ServiceTypes",
        "dojo/query",
        "dojo/data/ObjectStore",
        "dojo/store/Memory",
        "dijit/tree/ForestStoreModel",
        "base/util/XMLUtils",
        "./ContentModelBuilderWidget",
        "ct/mapping/mapcontent/MappingResourceRegistryInitializer",
        "base/util/CommonID"
    ],

    function (declare, d_lang, d_array, d_string, ct_array, ct_when, ct_request, _Connect, ct_lang, Locale, ServiceTypes, query, ObjectStore, Memory, ForestStoreModel, XMLUtils, ContentModelBuilderWidget, MappingResourceRegistryInitializer, CommonID) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */
        return declare([_Connect],
            /**
             * @lends ct.bundles.map.config.MapModelBuilderController.prototype
             */
            {

                /**
                 * @constructs
                 */
                constructor: function () {
                },

                createInstance: function () {
                    var properties = this._properties;
                    var opts = {
                        dataFormService: this._dataformService,
                        pid: properties.pid,
                        bid: properties.bid,
                        id: properties.id,
                        configAdminService: this._configAdminService,
                        mrr: this._mrr,
                        identifyMappingStore: this._identifyMappingStore
                    };

                    var i18n = this._i18n;
                    if (i18n) {
                        opts.i18n = this.i18n = i18n.get().mapModelBuilderWidget;
                    }

                    var widget = this._builderWidget = new ContentModelBuilderWidget(opts);
                    this._initStores();
                    this._bindEvents();

                    return widget;
                },

                _bindEvents: function () {
                    var widget = this._builderWidget;
                    this.connect("onGetCap", widget,
                        "onGetCap", "_onGetCap");
                    this.connect("onAddCategory", widget,
                        "onAddCategory",
                        "_onAddCategory");
                    this.connect("onRemove", widget,
                        "onRemove", "_onRemoveItem");
                    this.connect("onUp", widget, "onUp",
                        "_onUp");
                    this.connect("onDown", widget, "onDown",
                        "_onDown");
                    this.connect("onChange", widget,
                        "onChange", "_onChange");

                    this.connect(this._categoryStore, "onSet",
                        this, function () {
                            this._fireChangeEvent();
                        });

                    this.connect(this._knownServices.configurable,
                        "onConfigChange", this,
                        function () {
                            this._initServices();
                        });
                    //                this.connect(this.categoryTreeModel, "onChildrenChange", this, function(){
                    //                    debugger;
                    //                    this._fireChangeEvent();
                    //                });

                },

                _initStores: function () {
                    this._initServices();

                    var cp = this._builderWidget.getComponentProperties();
                    var opLayers = cp && cp.serviceDefinitions && cp.serviceDefinitions.operationalLayer ? cp.serviceDefinitions.operationalLayer : [];

                    this._categoryMemory = new Memory({
                        data: [
                            {
                                title: this.i18n.categoriesTitle,
                                id: "root1",
                                children: opLayers || []
                            }
                        ],
                        shiftUp: function (id) {

                        },
                        remove: function (id) {
                            var index = this.index;
                            var data = this.data;
                            if (id in index) {
                                data.splice(index[id],
                                    1);
                                this.setData(data);
                                return true;
                            } else {
                                var children = data[0].children;
                                for (var i = 0; i < children.length; i++) {
                                    this._deleteChildrenRecursive(id,
                                        children,
                                        i);
                                    this.setData(data);
                                }
                            }
                        },
                        _deleteChildrenRecursive: function (id, children, index) {
                            if (children[index].id == id) {
                                children.splice(index,
                                    1);
                                return;
                            } else if (children[index].children) {
                                for (var i = 0; i < children[index].children.length; i++) {
                                    this._deleteChildrenRecursive(id,
                                        children[index].children,
                                        i);
                                }
                            }
                        }
                    });

                    this._categoryStore = new ObjectStore({
                        objectStore: this._categoryMemory,
                        labelProperty: "title"
                    });

                    var paste = ForestStoreModel.prototype.pasteItem;
                    this._categoryTreeModel = new ForestStoreModel({
                        store: this._categoryStore,
                        rootId: "root",
                        childrenAttrs: ["children"],
                        mayHaveChildren: function (item) {
                            return item.category || (item.children && item.children.length > 0);
                        },
                        pasteItem: function (childItem) {
                            //fix to make ID´s unique
                            arguments[0] = d_lang.mixin({}, childItem);
                            arguments[0].id = CommonID.get(CommonID.to(arguments[0].id));
                            paste.apply(this, arguments);
                        }
                    });

                    this._builderWidget.set("categoryTreeModel",
                        this._categoryTreeModel);

                    this._builderWidget.set("appsStore",
                        this.appsstore);

                },

                _initServices: function () {
                    if (this._mrr._mrTree && this._mrr._mrTree.get("children").length > 0) {
                        var services = this._prepareServiceNodes();
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

                _onGetCap: function (item) {
                    //{
                    //layers:["refgew"],
                    //service:"administrative_units"}
                    if (item) {
                        var res = this._mrr.getMappingResourceByUniqueId(item.service);
                        var st = res && res.serviceType;

                        if (st && (st === ServiceTypes.WMS || st === ServiceTypes.INSPIRE_VIEW)) {
                            var content = {
                                SERVICE: "WMS",
                                REQUEST: "GetCapabilities"
                            };
                            if (st === ServiceTypes.INSPIRE_VIEW) {
                                content.LANGUAGE = Locale.getCurrent().getLanguageISO6392B();
                            }

                            if (!this._capabilitiesLookuptable) {
                                this._capabilitiesLookuptable = {};
                            }
                            var cap = this._capabilitiesLookuptable[res.serviceUrl];
                            if (cap) {
                                this._parseCapResult(cap,
                                    item);
                                return;
                            }
                            this._builderWidget.set("loading",
                                true);
                            var e = ct_request.request({
                                url: res.serviceUrl,
                                content: content,
                                handleAs: "xml"
                            });
                            ct_when(e, function (result) {
                                this._builderWidget.set("loading",
                                    false);
                                this._capabilitiesLookuptable[res.serviceUrl] = result;
                                this._parseCapResult(result,
                                    item);
                            }, function (err) {
                                this._builderWidget.set("loading",
                                    false);
                                var t = d_lang.mixin({
                                        metadataUrl: this.i18n.capabilitiesError
                                    },
                                    item.props);
                                this._categoryStore.setValue(item,
                                    "props",
                                    t);
                                this._fireChangeEvent(true);
                            }, this);
                        }
                    }
                },

                _parseCapResult: function (result, item) {
                    var fire = false;
//            var l = this._retrieveMetadataWebMapService(result, item);
                    var t = {};
//            if (l) {
//                t = d_lang.mixin(t, {
//                    metadataUrl: l
//                });
//                t = d_lang.mixin(item.props, t);
//                fire = true;
//            }
                    var title = this._retrieveLayerInfo(result,
                        item,
                        "Title");
                    if (title) {
                        this._categoryStore.setValue(item,
                            "title",
                            title);
                    }

                    var maxScale = this._retrieveLayerInfo(result,
                        item,
                        "MaxScaleDenominator");
                    if (maxScale) {
                        this._categoryStore.setValue(item,
                            "minScale",
                            Math.round(maxScale));
                    }

                    var minScale = this._retrieveLayerInfo(result,
                        item,
                        "MinScaleDenominator");
                    if (minScale) {
                        this._categoryStore.setValue(item,
                            "maxScale",
                            Math.round(minScale));
                    }

                    var abstract = this._retrieveLayerInfo(result,
                        item,
                        "Abstract");
                    if (abstract) {
                        t = d_lang.mixin(t, {
                            description: abstract
                        });
                        t = d_lang.mixin(item.props, t);
                        fire = true;
                    }

                    if (fire) {
                        this._categoryStore.setValue(item,
                            "props",
                            t);
                        this._fireChangeEvent(true);
                    }
                },

                _retrieveLayerInfo: function (result, item, tagname) {
                    var layers = this._getQueryableLayers(result);
                    var foundItem;
                    d_array.some(layers, function (layer) {
                        //retrieveLayer Infos from service capabilities
                        var found = false,
                            nameTag = query("Name", layer)[0],
                            name = XMLUtils.getTextContent(nameTag),
                            t = item.layers || [];
                        d_array.forEach(t,
                            function (layertmp) {
                                if (layertmp === name) {
                                    found = true;
                                }
                            });

                        if (found) {
                            //get info
                            var tag = query(tagname,
                                layer)[0];
                            if (tag) {
                                foundItem = XMLUtils.getTextContent(tag).trim();
                                return foundItem;
                            } else {
                                return null;
                            }
                        }
                        return null;
                    }, this);
                    return foundItem;
                },

                _retrieveMetadataWebMapService: function (result, item) {
                    var layers = this._getQueryableLayers(result);
                    var link;
                    d_array.some(layers, d_lang.hitch(this,
                        function (layer) {
                            //retrieveLayer Infos from service capabilities
                            link = this._retrieveOnlineResource(layer,
                                item);
                            return link;
                        }));
                    if (!link) {
                        link = this.i18n.capabilitiesError;
                    }
                    return link;
                },

                _getQueryableLayers: function (result) {
                    var layers = [];
                    var items = XMLUtils.getTags("WMS_Capabilities>Capability Layer",
                        result);
                    d_array.forEach(items, function (item) {
                        if (item.getAttribute("queryable")) {
                            layers.push(item);
                        }
                    });
                    return layers;
                },

                _retrieveOnlineResource: function (layer, item) {
                    var found = false,
                        nameTag = query("Name", layer)[0],
                        name = XMLUtils.getTextContent(nameTag),
                        t = item.layers || [];
                    d_array.forEach(t, function (layertmp) {
                        if (layertmp === name) {
                            found = true;
                        }
                    });

                    if (found) {
                        //get metadataURL
                        var metadataTag = query("MetadataURL",
                            layer)[0];
                        var onlineResources = query("OnlineResource",
                            metadataTag);
                        var matcher = this.metadataOnlineResourceMatcher,
                            foundItem;
                        d_array.forEach(onlineResources,
                            function (onlineResource) {
                                var urlString = XMLUtils.getAttributeValue(onlineResource,
                                    "xlink:href");
                                if (urlString.search(matcher) > -1) {
                                    foundItem = urlString;
                                }

                            });

                    }
                    return foundItem;
                },

                _onUp: function (item, path) {
                    if (item && path) {
                        var id = item.id;
                        if (id == "root1") {
                            return;
                        }
                        if (path[path.length - 1].id == id) {
                            var parent = path[path.length - 2];
                            var index = ct_array.arrayFirstIndexOf(parent.children,
                                {
                                    id: id
                                });
                            if (index > 0) {
                                var temp = parent.children[index - 1];
                                parent.children[index - 1] = parent.children[index];
                                parent.children[index] = temp;
                                temp = null;
                                this._categoryStore.onSet(parent,
                                    "children",
                                    parent.children);
                                this._fireChangeEvent();
                            }
                        }
                    }
                },

                _onDown: function (item, path) {
                    if (item && path) {
                        var id = item.id;
                        if (id == "root1") {
                            return;
                        }
                        if (path[path.length - 1].id == id) {
                            var parent = path[path.length - 2];
                            var index = ct_array.arrayFirstIndexOf(parent.children,
                                {
                                    id: id
                                });
                            if (index > 0) {
                                var temp = parent.children[index + 1];
                                parent.children[index + 1] = parent.children[index];
                                parent.children[index] = temp;
                                temp = null;
                                this._categoryStore.onSet(parent,
                                    "children",
                                    parent.children);
                                this._fireChangeEvent();
                            }
                        }
                    }
                },

                _onRemoveItem: function (item) {
                    if (item) {
                        var id = item.id;
                        if (id) {
                            this._categoryMemory.remove(id);
                            this._categoryTreeModel.onDeleteItem(item);
                            this._builderWidget.clearDetailsPanel();
                            this._fireChangeEvent();
                        }
                    }
                },

                _onAddCategory: function (item) {
                    var obj = {
                        id: new Date().getTime() + "",
                        title: this.i18n.newCategoryDefaultTitle,
                        category: {
                            description: "",
                            imgUrl: ""
                        },
                        enabled: true,
                        children: []
                    };
                    var data = this._categoryMemory.data;
                    if (item) {
                        var id = item.id;
                        var path = this._builderWidget.get("categoryTreePath");
                        if (path[path.length - 1].id == id) {
                            //if selected item is a folder use it to insert the new category
                            //otherwise look for the parent folder (should be a category) and
                            //insert into that parent the new category
                            var folder = path[path.length - 1];
                            if ((folder.category || !folder.service) && folder.children) {
                                folder.children.push(obj);
                                this._categoryStore.onSet(folder,
                                    "children",
                                    folder.children);
                                this._builderWidget.set("categoryTreePath",
                                    path.push(item.id));
                                this._fireChangeEvent();
                            } else {
                                var parent = path[path.length - 2];
                                if (parent.children) {
                                    parent.children.push(obj);
                                    this._categoryStore.onSet(parent,
                                        "children",
                                        parent.children);
                                    this._fireChangeEvent();
                                }
                            }
                        }
                    } else {
                        if (data && data[0] && data[0].children) {
                            data[0].children.push(obj);
                            this._categoryStore.onSet(data[0],
                                "children",
                                data[0].children);
                            this._fireChangeEvent();
                        }
                    }
                },

                _onChange: function () {
                    this._fireChangeEvent();
                },

                _checkForStackOverflowData: function (elems) {
                    d_array.forEach(elems, function (elem) {
                        if (elem.__parent) {
                            delete elem.__parent;
                        }
                        if (elem.__dirty) {
                            delete elem.__dirty;
                        }
                        var c = elem.children;
                        if (c) {
                            this._checkForStackOverflowData(c);
                        }
                    }, this);
                },

                _fireChangeEvent: function (refreshPanel) {
                    var data = this._categoryMemory.data;
                    if (data && data[0] && data[0].children) {
                        var children = data[0].children;
                        this._checkForStackOverflowData(children);

                        var config = {
                            serviceDefinitions: {
                                operationalLayer: children
                            }
                        };
                        this._builderWidget.fireConfigChangeEvent(config,
                            refreshPanel);
                    }
                },

                _prepareServiceNodes: function () {
                    var mrr = this._mrr;

                    var ks = this._knownServices.data;
                    if (ks) {
                        var ms = d_array.map(ks,
                            function (service) {
                                service.serviceType = service.type;
                                service.resourceType = 1;
                                return service;
                            });
                        var mrrInitializer = new MappingResourceRegistryInitializer();
                        mrr = mrrInitializer.initFromData({services: ms},
                            mrr);
                    }

                    var serviceResources = mrr.getServiceResources();
                    var services = [];
                    var serviceTypes = [];
                    ct_lang.forEachOwnProp(ServiceTypes, function (val, key) {
                        serviceTypes.push(key);
                    });
                    d_array.forEach(serviceResources,
                        function (serviceResource) {
                            var serviceType = serviceResource.get("serviceType");
                            if (d_array.indexOf(serviceTypes,
                                serviceType) > -1) {
                                var id = serviceResource.get("uniqueId").toString();
                                var title = serviceResource.get("title") || id;
                                var layers;
                                if (serviceType === "WMTS") {
                                    var wmtsId = serviceResource.options.layerInfo.identifier;
                                    layers = [
                                        {
                                            id: CommonID.get(id + "/" + wmtsId),
                                            title: wmtsId || "Layer",
                                            enabled: false,
                                            service: id,
                                            layers: ['*']
                                        }
                                    ];
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
                    //sort services
                    services = ct_array.arraySort(services, {
                        title: false
                    });
                    return services;
                },

                _prepareLayers: function (serviceId) {
                    var layers = [];
                    var layerResources = this._mrr.getChildMappingResources(serviceId);
                    d_array.forEach(layerResources,
                        function (layerResource) {
                            var title = layerResource.title || layerResource.layerId;
                            layers.push({
                                id: CommonID.get(layerResource.get("uniqueId").toString()),
                                title: title,
                                enabled: false,
                                service: serviceId,
                                layers: [layerResource.layerId]
                            });
                        }, this);
                    return layers.sort(function (obj1, obj2) {
                        var v1 = d_string.trim(obj1.title), v2 = d_string.trim(obj2.title);
                        var n1 = parseInt(v1), n2 = parseInt(v2);

                        if (isNaN(n1) && !isNaN(n2)) return 1;
                        if (!isNaN(n1) && isNaN(n2)) return -1;

                        if (!isNaN(n1) && '' + n1 !== v1) n1 = v1.toLowerCase();
                        if (!isNaN(n2) && '' + n2 !== v2) n2 = v2.toLowerCase();

                        if (isNaN(n1) && isNaN(n2)) {
                            n1 = v1.toLowerCase();
                            n2 = v2.toLowerCase();
                        }

                        if (n1 === n2) return 0;
                        if (n1 > n2) return 1;
                        if (n1 < n2) return -1;
                    });
                }
            });
    });