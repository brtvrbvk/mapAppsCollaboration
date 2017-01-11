define([
    "dojo/_base/lang",
    "dojo/_base/declare",
    "ct/_Connect",
    "dojo/_base/array",
    "esri/geometry/Geometry",
    "base/util/GraphicsRenderer",
    "ct/async",
    "base/analytics/AnalyticsConstants",
    "./CommentAttributeTableLookupStrategy"
], function (
    d_lang,
    declare,
    _Connect,
    d_array,
    Geometry,
    GraphicsRenderer,
    ct_async,
    AnalyticsConstants,
    CommentAttributeTableLookupStrategy
    ) {
    return declare([_Connect], {

        _topicBase: "ct/redlining/",
        CONTENT_MODEL_LAYER_REFRESH: "contentModelLayerRefresh",
        LAYER_REMOVE: "layerRemove",

        activate: function () {

            this.i18n = this._i18n.get();
            this._renderers = [];
            var props = this._properties;
            this.grapicLayerId = props._graphicNodeId || "drawingtoolsetNode";

            this.geometryRenderer.renderGeometry = d_lang.hitch(this, this.renderGeometry);

            this._oldIntercept = this.drawTextController._interceptPointRendering;
            this.drawTextController._interceptPointRendering = d_lang.hitch(this, this._interceptPointRendering);

            this._oldActivateDraw = this.geometryRenderer.activateDraw;
            this.geometryRenderer.activateDraw = d_lang.hitch(this, this.activateDraw);

            this._oldClearGraphics = this.geometryRenderer.clearGraphics;
            this.geometryRenderer.clearGraphics = d_lang.hitch(this, this.clearGraphics);

            this.connect(this.editStateController, "onDeleteGraphic", this, this._deleteGraphic);

        },

        _deleteGraphic: function (evt) {
            var nodeId = evt.graphic && evt.graphic.attributes && evt.graphic.attributes.nodeid;
            if (nodeId && this._mapModel.getNodeById(nodeId)) {
                this._mapModel.removeNodeById(nodeId);
                this._mapModel.fireModelStructureChanged({
                    source: this,
                    action: this.CONTENT_MODEL_LAYER_REFRESH
                });
            }
        },

        _clearGraphics: function () {

            var undoGraphics = [];
            var detached = false;

            d_array.forEach(this._renderers, function (renderer) {

                var graphics = renderer.get("graphicsNode").get("graphics");
                undoGraphics.push({
                    graphics: graphics,
                    renderer: renderer
                });
                renderer.clear();
                if (renderer.get("hasNodeCreated")) {
                    detached = true;
                    renderer.detachNode();
                }

            }, this);

            this._renderers = [];

            if (detached) {
                this._mapModel.fireModelStructureChanged({
                    source: this,
                    action: this.CONTENT_MODEL_LAYER_REFRESH
                });
            }

            return undoGraphics;

        },

        clearGraphics: function () {

            var undoGraphics = this._clearGraphics();
            if (undoGraphics.length) {
                var undoRedoTask = {
                    undoGraphics: undoGraphics,
                    performUndo: d_lang.hitch(this, function () {
                        var undoGraphics = undoRedoTask.undoGraphics;
                        d_array.forEach(undoGraphics, function (undoGraphic) {
                            var renderer = undoGraphic.renderer;
                            if (renderer) {
                                renderer.attachNode();
                                this._renderers.push(renderer);
                                d_array.forEach(undoGraphic.graphics, function (g) {
                                    renderer.draw(g);
                                }, this);
                            }
                        }, this);
                        this._mapModel.fireModelStructureChanged({
                            source: this,
                            action: this.CONTENT_MODEL_LAYER_REFRESH
                        });
                    }),
                    performRedo: d_lang.hitch(this, function () {
                        undoRedoTask.undoGraphics = this._clearGraphics();
                    })
                };
                var undoRedo = this._undoRedoService;
                if (undoRedo) {
                    undoRedo.add(undoRedoTask);
                }
            }

        },

        activateDraw: function (opts) {

            this._oldActivateDraw.apply(this.geometryRenderer, arguments);

        },

        _interceptPointRendering: function (evt) {

            this._oldIntercept.apply(this.drawTextController, [evt]);
            if (evt.textPoint) {
                // don't intercept text rendering
                return;
            }
            evt.geometry = null;

        },

        renderGeometry: function (
            thingWithGeometry,
            attr,
            nodeid,
            auto
            ) {

            thingWithGeometry = thingWithGeometry instanceof Geometry ? {
                geometry: thingWithGeometry
            } : thingWithGeometry;

            var geometry = thingWithGeometry.geometry;

            nodeid = nodeid || this.grapicLayerId + new Date().getTime();
            if(attr)
                var title = attr.title || this.i18n.ui.types[geometry.type] || geometry.type;
            else
                var title = this.i18n.ui.types[geometry.type] || geometry.type;
            var type = geometry.type && geometry.type.toUpperCase();
            attr = attr || {};
            attr.type = "DRAWING";
            attr.nodeid = nodeid;

            thingWithGeometry = d_lang.mixin(thingWithGeometry, {
                id: 0,
                geometryType: geometry.type,
                attributes: attr,
                context: {
                    redlining: true
                }
            });

            //if we have a symbol use it
            thingWithGeometry.symbol = thingWithGeometry.symbol || this.geometryRenderer.previewSymbol;

            title = thingWithGeometry.symbol ? thingWithGeometry.symbol.title : title;

            title = thingWithGeometry.title ? thingWithGeometry.title : title;

            // inform listeners
            this.geometryRenderer.onBeforeRenderGeometry(thingWithGeometry);

            if (thingWithGeometry.text) {
                title = thingWithGeometry.text || title;
                type = "TEXT";
            }

            // the rendering can be skipped, if the geometry is set to null
            if (!thingWithGeometry.geometry) {
                console.debug("skipping non filled item ");
                return;
            }
            if(attr && attr.title)
                title=attr.title;
            var renderer = GraphicsRenderer.createForGraphicsNode(nodeid, this._mapModel, title ? title : "geometry",
                    "DRAWING_" + type ? type : "");

            renderer.set({
                templateLookupStrategy: null
            });
            renderer.set({
                graphicResolver: this.geometryRenderer._graphicResolver
            });

            this._renderers.push(renderer);

            var graphic = this._renderUndoable(thingWithGeometry, renderer);

            //BartVerbeeck need to be async otherwise we have duplicates
            //Voor import, dan niet dit hier doen
            if(!auto)
            ct_async(function () {
                this._mapModel.fireModelStructureChanged({
                    graphicLayerId: nodeid,
                    source: this,
                    action: this.CONTENT_MODEL_LAYER_REFRESH
                });
                
                if (this._eventService) {
                    if (graphic.symbol.type === "picturemarkersymbol") {
                        type = "SYMBOL";
                    }
                    this._eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                        eventType: AnalyticsConstants.EVENT_TYPES["REDLINING_" + type],
                        eventCategory: AnalyticsConstants.CATEGORIES.REDLINING,
                        eventValue: ""
                    });
                }

            }, this);

            this.geometryRenderer.onAfterRenderGeometry({
                graphic: graphic,
                input: thingWithGeometry
            });

            return graphic;

        },
        fireManual:function(){
            var nodeid = this.grapicLayerId + new Date().getTime();
            ct_async(function () {
                this._mapModel.fireModelStructureChanged({
                    graphicLayerId: nodeid,
                    source: this,
                    action: this.CONTENT_MODEL_LAYER_REFRESH
                });
                /*
                if (this._eventService) {
                    this._eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                        eventType: AnalyticsConstants.EVENT_TYPES["REDLINING_Import"],
                        eventCategory: AnalyticsConstants.CATEGORIES.REDLINING,
                        eventValue: ""
                    });
                }
*/
            }, this);
            
        },
        _renderUndoable: function (
            thingWithGeometry,
            renderer
            ) {
            var undoRedoTask = {
                performUndo: d_lang.hitch(this, function () {
                    var g = undoRedoTask._graphic;
                    if (g) {
                        renderer && renderer.erase(g);
                    }
                }),
                performRedo: d_lang.hitch(this, function () {
                    var g = undoRedoTask._graphic;
                    if (g) {
                        undoRedoTask._graphic = renderer && renderer.draw(g);
                    }
                })
            };
            var undoRedo = this._undoRedoService;
            if (undoRedo) {
                undoRedo.add(undoRedoTask);
            }
            var g = renderer.draw(thingWithGeometry);
            undoRedoTask._graphic = g;
            return g;
        }

    });
});