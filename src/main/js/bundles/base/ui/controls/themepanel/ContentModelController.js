define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/dom-class",
        "ct/util/css",
        "ct/_Connect",
        "ct/Stateful",
        "base/analytics/AnalyticsConstants"
    ],

    function (
        declare,
        d_array,
        d_lang,
        d_class,
        css,
        _Connect,
        Stateful,
        AnalyticsConstants
        ) {
        /*
         * COPYRIGHT 2011 con terra GmbH Germany
         */
        var isContainedInModel = function (
            node,
            items
            ) {
            var isContained = false;
            d_array.some(items, function (item) {
                if (item.get("id") === node.get("id")) {
                    isContained = true;
                    return true;
                }
            });
            return isContained;
        };

        return declare([Stateful], {
            CONTENT_MODEL_LAYER_ADD: "contentModelLayerAdd",
            CONTENT_MODEL_LAYER_ADD_SILENT: "contentModelLayerAddSilent",
            CONTENT_MODEL_LAYER_REMOVE: "contentModelLayerRemove",
            CONTENT_MODEL_LAYER_REFRESH: "contentModelLayerRefresh",

            // events from LayerContextMenu bundle
            LAYER_REMOVE: "layerRemove",
            ALL_LAYERS_REMOVE: "allLayersRemove",

            types: {
                GRAPHICS: "graphics",
                OPERATIONAL: "operational"
            },

            constructor: function () {
                this._listeners = new _Connect();
                this.isSwitchedOn = false;
            },

            activate: function () {
                var l = this._listeners;
                this._initMapModelState();
                this._syncMapModelStateWithContentModel();
                // sync with mapModel
                l.connect("mapModel", this._mapModel, "onModelStructureChanged", this,
                    this._onModelStructureChanged);
                this._approot = css.findApplicationRootNodes()[0];
            },

            _initMapModelState: function () {
                //initially sync state with mapmodel
                var nodes = this._mapModel.getEnabledServiceNodes(this._mapModel.getOperationalLayer());
                d_array.forEach(nodes, function (n) {
                    var layer = this._contentModel.getNodeById(n.get("id"));
                    if (layer) {
                        this._setEnableProperty(layer, n.get("enabled"));
                    }
                }, this);
                this._contentModel.fireModelNodeStateChanged({
                    source: this
                });
            },

            _syncMapModelStateWithContentModel: function () {
                var nodes = this._contentModel.getEnabledServiceNodes(this._contentModel.getOperationalLayer());
                d_array.forEach(nodes, function (n) {
                    var layer = this._mapModel.getNodeById(n.get("id"));
                    if (layer) {
                        this._setEnableProperty(layer, n.get("enabled"));
                    }
                    //add node
                    else {
                        this.addLayerToMapModel([n], true);
                    }
                }, this);
                this._mapModel.fireModelStructureChanged({
                    source: this
                });
            },

            deactivateContentManager: function () {
                this.isSwitchedOn = false;
                d_class.remove(this._approot, "ctLayerManagerToolVisible");
            },

            activateContentManager: function () {
                this.isSwitchedOn = true;
                if (this._mapModel.getOperationalLayer().hasChildren()) {
                    d_class.add(this._approot, "ctLayerManagerToolVisible");
                } else {
                    d_class.remove(this._approot, "ctLayerManagerToolVisible");
                }
            },

            enableLayerInContentModel: function (layer) {
                var silent = false;
                if (!layer.set) {
                    var tmplayer = this._contentModel.getNodeById(layer.id);
                    silent = layer.silent;
                    if (!tmplayer) {
                        return;
                    }
                    layer = tmplayer;
                }
                this._setEnableProperty(layer, true);
                this._contentModel.fireModelNodeStateChanged({
                    source: this,
                    layer: layer
                });
                var layers = [];
                var children = this._mapModel.getOperationalLayer().children;
                if (layer.category) {
                    var nodes = this._contentModel.getEnabledServiceNodes();
                    if (children && children.length > 0) {
                        d_array.forEach(nodes, function (n) {
                            if (!isContainedInModel(n, children)) {
                                layers.push(n);
                            }
                        }, this);
                    } else {
                        layers = nodes;
                    }
                } else {
                    if (!isContainedInModel(layer, children)) {
                        layers.push(layer);
                    }
                }
                if (layers.length > 0) {
                    this.addLayerToMapModel(layers, silent);
                }
            },

            addLayerToMapModel: function (
                layers,
                silent
                ) {
                var mapModel = this._mapModel;
                d_array.forEach(layers, function (lay) {
                    // add layer --> create a copy of the layer
                    var layerToAdd = d_lang.mixin({}, lay);
                    this._setNextRenderPriority(layerToAdd);
                    mapModel.getOperationalLayer().addChild(layerToAdd);
                    this._fireTrackEvent(layerToAdd);
                }, this);

                mapModel.fireModelStructureChanged({
                    source: this,
                    action: silent ? this.CONTENT_MODEL_LAYER_ADD_SILENT : this.CONTENT_MODEL_LAYER_ADD
                });
                if (!silent) {
                    d_class.add(this._approot, "ctLayerManagerToolVisible");
                }
            },

            _fireTrackEvent: function (layer) {
                var service = layer.service;
                var val = this.eventValuePrefix ? this.eventValuePrefix + layer.title : layer.title;
                if (service && service.serviceType === "POI") {

                    this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                        eventType: AnalyticsConstants.EVENT_TYPES.SELECT_POI,
                        eventCategory: AnalyticsConstants.CATEGORIES.THEME,
                        eventValue: val
                    });

                } else if (service) {

                    this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                        eventType: AnalyticsConstants.EVENT_TYPES.SELECT_LAYER,
                        eventCategory: AnalyticsConstants.CATEGORIES.THEME,
                        eventValue: val
                    });

                }
            },

            disableLayerInContentModel: function (layer) {
                this._setEnableProperty(layer, false);
                this._contentModel.fireModelNodeStateChanged({
                    source: this
                });

                var layers = [];
                if (layer.category) {
                    var nodes = this._contentModel.getEnabledServiceNodes();
                    var children = this._mapModel.getOperationalLayer().children;
                    if (nodes && nodes.length > 0) {
                        d_array.forEach(children, function (c) {
                            if (!isContainedInModel(c, nodes)) {
                                layers.push(c);
                            }
                        }, this);
                    } else {
                        layers = children;
                    }
                } else {
                    layers.push(layer);
                }
                this.removeLayerFromMapModel(layers);
            },

            removeLayerFromMapModel: function (layers) {
                var mapModel = this._mapModel;
                d_array.forEach(layers, function (lay) {
                    var layerId = lay.get("id");
                    var layerToRemove = mapModel.getNodeById(layerId);
                    mapModel.getOperationalLayer().removeChild(layerToRemove);
                }, this);

                mapModel.fireModelStructureChanged({
                    source: this,
                    action: this.CONTENT_MODEL_LAYER_REMOVE
                });

                if (!mapModel.getOperationalLayer().hasChildren()) {
                    d_class.remove(this._approot, "ctLayerManagerToolVisible");
                }
            },

            _setEnableProperty: function (
                layer,
                enabled
                ) {
                layer.set("enabled", enabled);
                if (this._isOnlyNodeSelected(layer)) {
                    this._traverseParentNode(layer, enabled);
                }
                var children = layer.get("children");
                if (children && children.length > 0) {
                    this._traverseChildNodes(children, enabled);
                }
            },

            _setNextRenderPriority: function (layer) {
                var maxPriority = 1;
                var opLayers = this._mapModel.getOperationalLayer().children;
                d_array.forEach(opLayers, d_lang.hitch(this, function (layer) {
                    if (layer.get("renderPriority") && layer.get("renderPriority") > maxPriority) {
                        maxPriority = layer.get("renderPriority");
                    }
                }));
                layer.set("renderPriority", maxPriority + 1);
            },

            // set enabled property of layers based on changes in layercontextmenu
            _onModelStructureChanged: function (evt) {
                if (evt.action && (evt.action === this.LAYER_REMOVE || evt.action === this.ALL_LAYERS_REMOVE)) {
                    var action = evt.action;
                    if (action === this.LAYER_REMOVE) {
                        var layer = this._contentModel.getNodeById(evt.layerId);
                        if (layer) {
                            this._setEnableProperty(layer, false);
                        }
                    } else if (action === this.ALL_LAYERS_REMOVE) {
                        var layerIds = evt.layerIds;
                        var enabledLayers = this._contentModel.getEnabledServiceNodes();
                        d_array.forEach(enabledLayers, function (layer) {
                            if (d_array.indexOf(layerIds, layer.id) !== -1) {
                                this._setEnableProperty(layer, false);
                            }
                        }, this);
                    }
                    this._contentModel.fireModelNodeStateChanged({
                        source: this
                    });
                }
            },

            removeAllLayers: function (evt) {
                var enabledLayers = this._contentModel.getEnabledServiceNodes();
                d_array.forEach(enabledLayers, function (layer) {
                    this.disableLayerInContentModel(layer);
                }, this);
                this._contentModel.fireModelNodeStateChanged({
                    source: this
                });
            },

            _traverseParentNode: function (
                layer,
                enabled
                ) {
                var parent = layer.get("parent");
                if (parent && parent.get("id") !== this.OPERATIONAL_LAYER) {
                    parent.set("enabled", enabled);
                    if (this._isOnlyNodeSelected(parent)) {
                        this._traverseParentNode(parent, enabled);
                    }
                }
            },

            _traverseChildNodes: function (
                children,
                enabled
                ) {
                d_array.forEach(children, function (c) {
                    c.set("enabled", enabled);
                    var newChildren = c.get("children");
                    if (newChildren && newChildren.length > 0) {
                        this._traverseChildNodes(newChildren, enabled);
                    }
                }, this);
            },

            _isOnlyNodeSelected: function (layer) {
                var children = layer.get("parent").get("children");
                var idx = 0;
                d_array.forEach(children, function (c) {
                    if (c.get("id") !== layer.get("id") && c.get("enabled")) {
                        idx++;
                    }
                }, this);
                if (idx === 0) {
                    return true;
                } else {
                    return false;
                }
            },

            deactivate: function () {
                this._listeners.disconnect("mapModel");
            }

        });
    });