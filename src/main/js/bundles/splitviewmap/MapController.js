define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/sniff",
        "ct/_Connect",
        "ct/async",
        "ct/array",
        "base/util/GraphicsRenderer"
    ],
    function (
        declare,
        d_array,
        d_lang,
        d_sniff,
        _Connect,
        ct_async,
        ct_array,
        GraphicsRenderer
        ) {
        /*
         * COPYRIGHT 2011 con terra GmbH Germany
         */
        return declare([_Connect],
            /**
             * Synchronizes the main map
             * @lends agiv.bundles.splitviewmap.MapController.prototype
             */
            {
                centerPoint: {
                    x: null,
                    y: null
                },
                factor: null,

                contentModelTopics: {
                    CONTENT_MODEL_LAYER_ADD: "contentModelLayerAdd",
                    CONTENT_MODEL_LAYER_ADD_SILENT: "contentModelLayerAddSilent",
                    CONTENT_MODEL_LAYER_REMOVE: "contentModelLayerRemove",
                    CONTENT_MODEL_LAYER_REFRESH: "contentModelLayerRefresh",
                    LAYER_REMOVE: "layerRemove",
                    ALL_LAYERS_REMOVE: "allLayersRemove"
                },

                pointerNodeId: "pointer",
                geometryType: "POINT",
                symbolTable: {
                    point: {
                        color: [
                            255,
                            0,
                            0,
                            255
                        ],
                        size: 4,
                        type: "esriSMS",
                        style: "esriSMSCircle",
                        outline: {
                            color: [
                                255,
                                0,
                                0,
                                255
                            ],
                            width: 1,
                            type: "esriSLS",
                            style: "esriSLSSolid"
                        }
                    }
                },

                constructor: function () {
                },

                activate: function () {
                    this._mainMapState = this._mainMap.mapState;
                    this._historicMapState = this._historicMap.mapState;

                    this._syncHistoric();
                    this._initialSync();

                    this._mainMapRenderer = this._getRenderer(this._mainMap);
                    this._mainMap.mapModel.fireModelStructureChanged({
                        source: this
                    });
                    this._historicMapRenderer = this._getRenderer(this._historicMap);
                    this._historicMap.mapModel.fireModelStructureChanged({
                        source: this
                    });
                    this.bindEvents();

                },

                _initialSync: function () {

                    var mainMapModel = this._mainMap.mapModel;
                    var enabledLayers = [];
                    d_array.forEach(mainMapModel.getBaseLayer().children, function (baselayer) {
                        if (baselayer.enabled) {
                            enabledLayers.push(baselayer.id);
                        }
                    }, this);
                    this._syncBasemaps(enabledLayers);

                    var historicMapModel = this._historicMap.mapModel;
                    var graphicsNodes = mainMapModel.getGlassPaneLayer().children;
                    var gpl = historicMapModel.getGlassPaneLayer();
                    d_array.forEach(graphicsNodes, function (gn) {
                        if (gn.id !== this.pointerNodeId) {
                            gpl.addChildAt(gn, 0);
                        }
                    }, this);
                    historicMapModel.fireModelNodeStateChanged({
                        source: this
                    });

                },

                _getRenderer: function (map) {
                    return GraphicsRenderer.createForGraphicsNode(this.pointerNodeId, map.mapModel,
                        this.geometryType,
                            "DRAWING_" + this.geometryType);
                },

                bindEvents: function () {

                    this._syncMainPointerHitch = d_lang.hitch(this, function (p) {
                        var fire = false;
                        if (this._historicMapRenderer.getGraphicsCount() > 0) {
                            this._clearPointer(this._historicMapRenderer);
                            fire = true;
                        }
                        this._drawPointer(this._mainMap, this._mainMapRenderer, p);
                        if (fire) {
                            this._historicMap.mapModel.fireModelNodeStateChanged({
                                source: this
                            });
                        }
                    });

                    this._syncHistoricPointerHitch = d_lang.hitch(this, function (p) {
                        var fire = false;
                        if (this._mainMapRenderer.getGraphicsCount() > 0) {
                            this._clearPointer(this._mainMapRenderer);
                            fire = true;
                        }
                        this._drawPointer(this._historicMap, this._historicMapRenderer, p);
                        if (fire) {
                            this._mainMap.mapModel.fireModelNodeStateChanged({
                                source: this
                            });
                        }
                    });

                    this._bindExtentChangeEventOnMainMap();

                    this.connect("onHistoricPanStart", this._historicMapState, "onPanStart", this,
                        "activateSyncToMainMap");
                    this.connect("onMapPanStart", this._mainMapState, "onPanStart", this,
                        "activateSyncToHistoricMap");
                    this.connect("onHistoricZoomStart", this._historicMapState, "onZoomStart", this,
                        "activateSyncToMainMap");
                    this.connect("onMapZoomStart", this._mainMapState, "onZoomStart", this,
                        "activateSyncToHistoricMap");

                    if (!d_sniff("android") && !d_sniff("ios")) {
                        this.connect("eventsPointer", this._historicMapState, "onMouseMove", this,
                            "_syncMainPointer");
                        this.connect("eventsPointer", this._mainMapState, "onMouseMove", this,
                            "_syncHistoricPointer");
                    }

                    this.connect("mapModel", this._mainMap.mapModel, "onModelStructureChanged", this,
                        "_syncHistoricMapModelStructure");
//                this.connect("mapModel", this._mainMap.mapModel, "onModelNodeStateChanged", this, "_syncHistoricMapModelState");

                    this.activateSyncToHistoricMap();
                },

                _bindExtentChangeEventOnMainMap: function () {
                    this.disconnect("eventsMainMap");
                    this.connect("eventsMainMap", this._mainMapState, "onExtentChange", this,
                        "_syncHistoric");
                },

                _bindExtentChangeEventOnHistoricMap: function () {
                    this.disconnect("eventsHistoricMap");
                    this.connect("eventsHistoricMap", this._historicMapState, "onExtentChange", this,
                        "_syncMain");
                },

                activateSyncToHistoricMap: function () {
                    this.disconnect("eventsHistoricMap");
                    this._bindExtentChangeEventOnMainMap();
                },

                activateSyncToMainMap: function () {
                    this.disconnect("eventsMainMap");
                    this._bindExtentChangeEventOnHistoricMap();
                },

                _syncMain: function (evt) {
                    var p = evt.extent.getCenter();
                    var scale = this._historicMapState.getViewPort().getScale();
                    ct_async(d_lang.hitch(this, function () {
                        this._mainMapState.centerAndZoomToScale(p, scale);
                    }), 100);
                },

                _syncHistoric: function (evt) {
                    var p;
                    if (evt) {
                        p = evt.extent.getCenter();
                    } else {
                        p = this._mainMapState.getExtent().getCenter();
                    }
                    var scale = this._mainMapState.getViewPort().getScale();
                    ct_async(d_lang.hitch(this, function () {
                        this._historicMapState.centerAndZoomToScale(p, scale);
                    }), 100);
                },

                _syncBasemaps: function (evt) {
                    var selectedBasemapId = evt.getProperty ? evt.getProperty("value") : evt;
                    var historicMapModel = this._historicMap.mapModel;
                    var layers;
                    d_lang.isArray(selectedBasemapId) ? layers = selectedBasemapId : layers = [selectedBasemapId];
                    d_array.forEach(historicMapModel.getBaseLayer().children, function (layer) {
                        var found = ct_array.arraySearchFirst(layers, layer.id);
                        if (found) {
                            layer.set("enabled", true);
                        } else {
                            layer.set("enabled", false);
                        }
                    }, this);
                    historicMapModel.fireModelNodeStateChanged({
                        source: this
                    });
                },

                _syncHistoricMapModelStructure: function (evt) {
                    var historicMapModel = this._historicMap.mapModel;
                    var mainMapModel = this._mainMap.mapModel;
                    var fire = false;
                    if (evt.source && evt.graphicLayerId) { // graphicsLayer
                        var graphicsNode = mainMapModel.getNodeById(evt.graphicLayerId);
                        historicMapModel.getGlassPaneLayer().addChildAt(graphicsNode, 0);
                        fire = true;
                    } else {
                        var glassPaneLayers = historicMapModel.getGlassPaneLayer();
                        var pointerNode = historicMapModel.getNodeById(this.pointerNodeId);
                        glassPaneLayers.removeChildren();
                        if (pointerNode) {
                            glassPaneLayers.addChild(pointerNode);
                        }
                        d_array.forEach(mainMapModel.getGlassPaneLayer().children, function (node) {
                            if (node.id !== this.pointerNodeId) {
                                glassPaneLayers.addChild(node);
                            }
                        }, this);
                        fire = true;
                    }

                    if (fire) {
                        historicMapModel.fireModelStructureChanged({
                            source: this
                        });
                    }
                },

                _syncHistoricMapModelState: function (evt) {
                    var historicMapModel = this._historicMap.mapModel;
                    historicMapModel.fireModelNodeStateChanged({
                        source: this
                    });
                },

                _syncMainPointer: function (evt) {
                    var p = evt.mapPoint;
                    this._timeout(this._syncMainPointerHitch, p);
                },

                _syncHistoricPointer: function (evt) {
                    var p = evt.mapPoint;
                    this._timeout(this._syncHistoricPointerHitch, p);
                },

                _timeout: function (
                    func,
                    p
                    ) {
                    var now = new Date().getTime();
                    var last = this._lastUpdated;
                    var timer = this.timer;
                    if (!timer || !last || (now - last) > 50) {
                        this._lastUpdated = now;
                        clearTimeout(timer);
                        this.timer = setTimeout(function () {
                            func(p);
                        }, 25);
                    }
                },

                _drawPointer: function (
                    map,
                    renderer,
                    geometry
                    ) {
                    var pointerNode = map.mapModel.getGlassPaneLayer().findChildById(this.pointerNodeId);
                    var hasPointer = pointerNode && pointerNode.graphics && pointerNode.graphics.length && pointerNode.graphics.length >= 0;
                    if (hasPointer) {
                        this._clearPointer(renderer);
                    }
                    var pointer = {
                        geometry: geometry,
                        symbol: this.symbolTable.point
                    };
                    renderer.draw(pointer);
                },

                _clearPointer: function (renderer) {
                    renderer.clear();
                },

                handleResultSelection: function (evt) {
                    this.disconnect();
                    // zoomIn on the main map is handled automatically by search bundle (see DrawGeometryeventReceiver.js)
                    // here we only need to re-activate event listener onExtentChange on the main map
                    this.bindEvents();
                },

                deactivate: function () {
                    this.disconnect();
                }
            });
    });