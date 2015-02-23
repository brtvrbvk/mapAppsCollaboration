define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "ct/array",
        "dojo/dom-class",
        "ct/util/css",
        "ct/_Connect",
        "ct/Stateful",
        "ct/mapping/mapcontent/ServiceTypes",
        "ct/util/tree/ContainerNode",
        "base/store/poi/ClusterDataFilterDecorator",
        "base/analytics/AnalyticsConstants",
        "base/util/Comparator"
    ],
    function (
        declare,
        d_array,
        d_lang,
        ct_array,
        domClass,
        css,
        _Connect,
        Stateful,
        ServiceTypes,
        ContainerNode,
        ClusterDataFilterDecorator,
        AnalyticsConstants,
        comparator
        ) {
        /*
         * COPYRIGHT 2010-2011 con terra GmbH Germany
         */
        return declare([
                _Connect,
                Stateful
            ],
            {
                OPACITYCHANGE: "opacityChange",
                LAYERREMOVE: "layerRemove",
                ALLLAYERSREMOVE: "allLayersRemove",

                isShown: false,

//            _sliderVisible:false,

                wasOpen: false,

                visibleLayers: true,

                topics: {
                    ON_POI_HOVER: "ct/contentmanager/ON_POI_HOVER",
                    ON_POI_LEAVE: "ct/contentmanager/ON_POI_LEAVE",
                    ON_POI_SHOW: "ct/contentmanager/ON_POI_SHOW",
                    ON_POI_HIDE: "ct/contentmanager/ON_POI_HIDE",
                    ON_ITEM_REMOVE: "ct/contentmanager/REMOVE_ITEM",
                    ON_CLEAR_ALL: "ct/contentmanager/CLEAR_ALL"
                },

                types: {
                    GRAPHICS: "graphics",
                    OPERATIONAL: "operational"
                },

                _skipGraphicNodeIds: [
                    "pointer",
                    "radiusCircle",
                    "radiusLabel",
                    "THEMA_INFO_RESULT_HIGHLIGHTER",
                    "IGNORE"
                ],

                constructor: function () {
                },

                activate: function () {
                    this.operational = this._mapModel.getOperationalLayer();
                    this.graphics = this._mapModel.getGlassPaneLayer();

                    this._approot = css.findApplicationRootNodes()[0];
                    this.widgetList = {};
                    for (var id in this._contextMenuWidget) {
                        var widget = this._contextMenuWidget[id];
                        this.connect("widget", widget, "onDndDrop", "_recalculateRenderPriority");
                        this.connect("widget", widget, "onAllLayersRemoveClick", "_onAllLayersRemoveClick");
                        this.connect("widget", widget, "onAllLayersVisibilityChange",
                            "_onAllLayersVisibilityChange");
                        this.connect("widget", widget, "onAllLayersOpacityChange", "_onAllLayersOpacityChange");
//                    this.connect("widget", widget, "onSliderVisibilityChanged", "_onSliderVisibilityChanged");

                        this.connect("widget", widget, "onShow", "_onShow");
                        this.connect("widget", widget, "onHide", "_onHide");

                        this.widgetList[id] = [];
                        this._setRenderPriority();
                        this._setAllLayersVisibilityStyle(widget);
//                    widget.set("allSliderVisible", this._sliderVisible);
                    }
                },

                _groupOperationalLayersByServiceType: function () {
                    var operationalGroup = [];
                    var graphicsGroup = [];
                    d_array.forEach(this.operational.get("children"), function (layer) {
                        if (layer.service.serviceType === ServiceTypes.POI || layer.service.serviceType === ServiceTypes.DirectKML) {
                            graphicsGroup.push(layer);
                        } else {
                            operationalGroup.push(layer);
                        }
                    });
                    return {
                        operational: operationalGroup,
                        graphics: graphicsGroup
                    };
                },

                _getLayersByType: function (type) {
                    var opLayers = this._groupOperationalLayersByServiceType();
                    var layers;
                    if (type === this.types.OPERATIONAL) {
                        layers = opLayers[this.types.OPERATIONAL];
                    } else {
                        layers = opLayers[this.types.GRAPHICS].concat(this._getGraphicsLayers());
                    }
                    return layers;
                },

                _getWidgetById: function (widgetId) {
                    var widgetList = this.widgetList;
                    var foundWidget;
                    for (var type in widgetList) {
                        d_array.some(widgetList[type], function (widget) {
                            if (widget.id === widgetId) {
                                foundWidget = widget;
                                return true;
                            }
                        }, this);
                    }
                    return foundWidget;
                },

                _getWidgetByServiceType: function (layer) {
                    var widget;
                    if (this.operational.findChildById(layer.id) && layer.service && layer.service.serviceType &&
                        (layer.service.serviceType === ServiceTypes.POI ||
                            layer.service.serviceType === ServiceTypes.DirectKML) ||
                        this.graphics.findChildById(layer.id)) {
                        widget = this._contextMenuWidget["graphics"];
                    } else {
                        widget = this._contextMenuWidget["operational"];
                    }
                    return widget;
                },

                createWidgets: function () {
                    for (var id in this._contextMenuWidget) {
                        var widget = this._contextMenuWidget[id];
                        this.widgetList[id] = [];
                        widget.clearItems();
                        this._setAllLayersVisibilityStyle(widget);
                        this._recalculateRenderPriority({
                            current: widget
                        });
                    }

                    this.disconnect("layerItem");
                    this.visibleLayers = true;
                    var layers = this.operational.get("children").concat(this._getGraphicsLayers());
                    //check for items... if no items available --> Hint to emptyLayerListNode
                    if (layers.length === 0) {
                        this.visibleLayers = false;
                        return;
                    }
                    ct_array.arraySort(layers, comparator.renderPriorityComparator);
                    //iterate over sorted items and create widgets
                    d_array.forEach(layers, d_lang.hitch(this, function (layer) {
//                    if (layer.service || layer.nodeType) {
                        if (!layer.get("enabled")) {
                            this.visibleLayers = false;
                        }
                        var opacity = layer.get("opacity") || 1;
                        layer.set("layerOpacity", opacity);
                        var widget = this._getWidgetByServiceType(layer);
                        var combinedOpacityValue = this._calculateCombinedOpacity(1, opacity);
                        layer.set("opacity", combinedOpacityValue);
                        var item = widget.addLayerToContextMenu(layer);
                        if (item) {
                            this.widgetList[widget.itemProperties.layerType].push(item);
                            this.connect("layerItem", item, "onOpacityChange", "_handleOpacityChange");
                            this.connect("layerItem", item, "onOpacityChanged", "_handleOpacityChanged");
                            this.connect("layerItem", item, "onVisibilityChange", "_handleVisibilityChange");
                            this.connect("layerItem", item, "onRemoveClick", "_handleRemoveClick");
                            this.connect("layerItem", item, "onInfoPOIClick", "_handleInfoPOIClick");
                            this.connect("layerItem", item, "onInfoClick", "_handleInfoClick");
                            this.connect("layerItem", item, "onSliderVisibilityChanged",
                                "_onSliderVisibilityChanged");
                        }
//                    }
                    }));
                },

                _handleInfoClick: function (evt) {
                    this.onInfoClick(evt);
                },

                onInfoClick: function (evt) {
                },

                _getGraphicsLayers: function () {
                    var layers = [];
                    d_array.forEach(this.graphics.get("children"), function (child) {
                        if (child.nodeType) {
                            var skip = false;
                            d_array.forEach(this._skipGraphicNodeIds, function (skipId) {
                                if (child.get("id").indexOf(skipId) > -1) {
                                    skip = true;
                                }
                            }, this);
                            if (!skip) {
                                layers.push(child);
                            }
                        }
                    }, this);
                    return layers;
                },

                _setRenderPriority: function () {
                    var layers = this.operational.get("children").concat(this._getGraphicsLayers());
                    //check for items... if no items available --> Hint to emptyLayerListNode
                    if (layers.length == 0) {
                        this.visibleLayers = false;
                        return;
                    }
                    d_array.forEach(layers, d_lang.hitch(this, function (
                        layer,
                        index
                        ) {
                        if (!layer.get("renderPriority")) {
                            layer.set("renderPriority", index + 1);
                        }
                        if (!layer.get("enabled")) {
                            this.visibleLayers = false;
                        }
                    }));
                },

                _checkAllLayersVisibilityStyle: function (widget) {
                    this.visibleLayers = true;
                    var items = this._getLayersByType(widget.itemProperties.layerType);
                    //check for items... if no items available --> Hint to emptyLayerListNode
                    if (items.length == 0) {
                        this.visibleLayers = false;
                        return;
                    }
                    d_array.forEach(items, d_lang.hitch(this, function (layer) {
                        if (!layer.get("enabled")) {
                            this.visibleLayers = false;
                            this._setAllLayersVisibilityStyle(widget);
                            return;
                        }
                    }));
                    this._setAllLayersVisibilityStyle(widget);
                },

                _setAllLayersVisibilityStyle: function (widget) {
                    widget.setAllLayersVisibilityStyle(this.visibleLayers);
                },

                _onShow: function () {
                    this.createWidgets();
                    this.isShown = true;
                    this.connect("mapModel", this._mapModel, "onModelStructureChanged", "_onModelStructureChanged");
                },

                _onHide: function () {
                    this.isShown = false;
                    this.disconnect("layerItem");
                    this.disconnect("mapModel");
                },

                _recalculateRenderPriority: function (evt) {
                    var widget = evt.current;
                    if (widget) {
                        var layerType;
                        var nodes;
                        if (widget.itemProperties) {
                            layerType = widget.itemProperties.layerType;
                            nodes = widget.getAllNodes();
                        } else {
                            var widgetObj = this._getWidgetById(widget.id);
                            if (widgetObj && widgetObj.layer) {
                                var groupWidget = this._getWidgetByServiceType(widgetObj.layer);
                                layerType = groupWidget.itemProperties.layerType;
                                nodes = groupWidget.getAllNodes();
                            }
                        }
                        if (layerType && nodes) {
                            var length = nodes.length;
                            d_array.forEach(nodes, d_lang.hitch(this, function (
                                child,
                                index
                                ) {
                                var id = child.id;
                                var foundWidget = ct_array.arraySearchFirst(this.widgetList[layerType], {
                                    id: id
                                });
                                if (foundWidget) {
                                    var layer = foundWidget.get("layer");
                                    layer.set("renderPriority", length - index);
                                }
                            }));
                            this._mapModel.fireModelNodeStateChanged({
                                source: this,
                                action: "resort"
                            });
                        }
                    }
                },

                _onSliderVisibilityChanged: function (evt) {
//                this._sliderVisible=evt.sliderVisible;
                    var widget = evt.source;
                    widget.set("sliderVisible", evt.sliderVisible);
//                d_array.forEach(this.widgetList[widget.itemProperties.layerType], function(subWidget) {
//                    subWidget.set("sliderVisible",evt.sliderVisible);
//                },this);
//                widget.set("allSliderVisible", evt.sliderVisible);
                },

                _onAllLayersVisibilityChange: function (evt) {
                    var widget = evt.source;
                    var enabled = evt.enabled;
                    var children = this.operational.get("children").concat(this._getGraphicsLayers());
                    d_array.forEach(children, d_lang.hitch(this, function (child) {
                        if (child.get("enabled") != enabled) {
                            child.set("enabled", enabled);
                            this._switchWidgetVisibility(widget, child, enabled);
                        }
                    }));
                    this._mapModel.fireModelNodeStateChanged({
                        source: this
                    });
                },

                _switchWidgetVisibility: function (
                    widget,
                    layer,
                    enabled
                    ) {
                    var subWidget = ct_array.arraySearchFirst(this.widgetList[widget.id], {
                        layer: layer
                    });
                    if (subWidget) {
                        var itemNode = subWidget.itemNode;
                        if (enabled) {
                            domClass.add(itemNode, "ctSelected");
                        }
                        else {
                            domClass.remove(itemNode, "ctSelected");
                        }
                    }
                },

                _onAllLayersRemoveClick: function (evt) {
                    var layers = this._groupOperationalLayersByServiceType();
                    var layerIds = [];
                    var widget = evt.source;
                    var removed = false;
                    d_array.forEach(layers[widget.itemProperties.layerType], function (layer) {
                        layerIds.push(layer.id);
                        this.operational.removeChild(layer);
                        removed = true;
                    }, this);
                    if (widget.itemProperties.layerType === this.types.GRAPHICS) {
                        d_array.forEach(this._getGraphicsLayers(), function (layer) {
                            this.graphics.removeChild(layer);
                            removed = true;
                        }, this);
                        this.eventService.postEvent(this.topics.ON_CLEAR_ALL, {
                        });
                    }
                    if (removed) {
                        this._mapModel.fireModelStructureChanged({
                            source: this,
                            action: this.ALLLAYERSREMOVE,
                            layerIds: layerIds
                        });
                        this._closeLayerContextMenu();
                        this.onInfoPOIRemove();
                    }
                },

                _closeLayerContextMenu: function () {
                    domClass.remove(this._approot, "ctLayerManagerToolVisible");
                    this.wasOpen = false;
                },

                _onAllLayersOpacityChange: function (evt) {
                    if (!this._mouseUpEvent) {
                        this._mouseUpEvent = this.connect("slidermouse", evt.source.domNode.ownerDocument,
                            "onmouseup", "_handleAllLayersOpacityChangeEnd");
                    }
                    var widget = evt.source;
                    var items = this._getLayersByType(widget.itemProperties.layerType);
                    //check for items... if no items available --> Hint to emptyLayerListNode
                    if (items.length === 0) {
                        return;
                    }
                    //iterate over sorted items and create widgets
                    d_array.forEach(items, d_lang.hitch(this, function (layer) {
                        var combinedOpacityValue = this._calculateCombinedOpacity(widget, layer.get("layerOpacity"));
                        layer.set("opacity", combinedOpacityValue);
                    }));
                },

                _handleAllLayersOpacityChangeEnd: function (evt) {
                    this._mapModel.fireModelNodeStateChanged({
                        source: this,
                        action: this.OPACITYCHANGE
                    });
                    this.disconnect("slidermouse");
                    this._mouseUpEvent = null;
                },

                _onModelStructureChanged: function (evt) {
                    this.createWidgets();
                },

                _handleOpacityChange: function (evt) {
                    var widget = evt.source;
                    var value = widget.slider.get("value");
                    var layer = widget.layer;
                    layer.set("layerOpacity", value);
                    var combinedOpacityValue = this._calculateCombinedOpacity(1, value);
                    layer.set("opacity", combinedOpacityValue);
                    if (!this._timer) {
                        this._timer = setTimeout(d_lang.hitch(this, function () {
                            this._timer = null;
                            this._handleOpacityChangeEnd({
                                layerId: layer.get("id")
                            });
                        }), 50);
                    }
//                if (!this._mouseUpEvent) {
//                    this._mouseUpEvent = this.connect("slidermouse", widget.slider, "onMouseUp", this, function(args) {
//                        args.layerId = layer.get("id");
//                        this._handleOpacityChangeEnd(args);
//                    });
//                }
                },

                _calculateCombinedOpacity: function (
                    allVal,
                    layerOpacity
                    ) {
                    return allVal * layerOpacity;
                },

                _handleOpacityChanged: function (evt) {
                    var widget = evt.source;
                    var value = widget.slider.get("value");
                    var layer = widget.layer;
                    this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                        eventType: AnalyticsConstants.EVENT_TYPES.TRANSPARENCY,
                        eventCategory: AnalyticsConstants.CATEGORIES.TRANSPARENCY,
                        eventValue: layer.get("id")
                    });
                },

                _handleOpacityChangeEnd: function (args) {
                    this._mapModel.fireModelNodeStateChanged({
                        source: this,
                        action: this.OPACITYCHANGE
                    });
                    this.disconnect("slidermouse");
                    this._mouseUpEvent = null;
                },

                _handleVisibilityChange: function (evt) {
                    var node = this.operational.findChildById(evt.layerId) || this.graphics.findChildById(evt.layerId);
                    var tempMap;
                    try {
                        tempMap = node.layerObject._map;
                    } catch (e) {
                    }
                    var enabled = node.get("enabled");
                    var itemNode = evt.itemNode;
                    node.set("enabled", !enabled);
                    if (!enabled) {
                        domClass.add(itemNode, "ctSelected");
                    }
                    else {
                        domClass.remove(itemNode, "ctSelected");
                    }
                    var widget = this._getWidgetByServiceType(node);
                    this._checkAllLayersVisibilityStyle(widget);
                    this._mapModel.fireModelNodeStateChanged({
                        source: this,
                        layerId: evt.layerId
                    });
                    if (tempMap) {
                        try {
                            node.layerObject._map = tempMap;
                        } catch (e) {
                        }
                    }
                },

                _handleRemoveClick: function (evt) {
                    var node = this.operational.findChildById(evt.layerId);
                    if (node) {
                        this.operational.removeChild(node);
                    } else {
                        node = this.graphics.findChildById(evt.layerId);
                        this.graphics.removeChild(node);
                    }
                    this._mapModel.fireModelStructureChanged({
                        source: this,
                        action: this.LAYERREMOVE,
                        layerId: evt.layerId
                    });
                    this.eventService.postEvent(this.topics.ON_ITEM_REMOVE, {
                        itemId: evt.layerId
                    });
                    this.onInfoPOIRemove();
                },

                onInfoPOIRemove: function () {
                    this.eventService.postEvent(this.topics.ON_POI_HIDE);
                },

                _handleInfoPOIClick: function (evt) {
                    var node = this.operational.findChildById(evt.layerId);
                    this.eventService.postEvent(this.topics.ON_POI_SHOW, {
                        item: node
                    });
                    this.eventService.postEvent("agiv/resultcenter/NEW_STORE", {
                        store: new ClusterDataFilterDecorator({store: node.store})
                    });
                },

                deactivate: function () {
                    this.disconnect();
                }
            });
    })
;