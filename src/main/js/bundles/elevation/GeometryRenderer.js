/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 25.02.14.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "esri/geometry/jsonUtils",
        "redlining/GeometryRenderer"
    ],
    function (
        declare,
        d_lang,
        d_array,
        jsonUtils,
        GeometryRenderer
        ) {
        return declare([GeometryRenderer],
            {
                //we just need to override the topicbase...
                _topicBase: "ct/elevation/",
                constructor: function () {

                },

                activateDraw: function (opts) {
                    this.connect(this._drawStateController, "onNewGeometryPart",
                        "_handleOnNewGeometryPart");
                    this.inherited(arguments);
                },

                _handleOnNewGeometryPart: function (evt) {
                    var geom = evt && evt.graphic && evt.graphic.geometry;
                    if (geom && geom.paths[0].length > 1) {
                        this.renderGeometry(geom);
                    }
                },

                _handleOnDrawEnd: function (evt) {
                    // geometry is drawn on each click
                },

                _renderUndoable: function (thingWithGeometry) {
                    //we want the other items to disappear if we start drawing again
                    var undoRedo = this._undoRedoService;
                    if (undoRedo && undoRedo.canUndo && this.graphicRenderer) {
                        this.graphicRenderer.clear();
                    }

                    var undoRedoTask = {
                        performUndo: d_lang.hitch(this, function () {
                            var g = undoRedoTask._graphic;
                            if (g) {
                                var renderer = this._getGraphicRenderer(thingWithGeometry);
                                renderer && renderer.erase(g);
                                var geom = g.geometry;
                                if (geom.paths[0].length > 2) {
                                    geom.removePoint(0, geom.paths[0].length - 1);
                                    renderer.draw(g);
                                    // TODO: how to force esri graphic layer to refresh?
                                    this._postFrameworkEvent(this._topicBase + "UPDATE_CHART", {
                                        geometry: {
                                            graphic: g
                                        }
                                    });
                                } else {
                                    this._postFrameworkEvent(this._topicBase + "UPDATE_CHART", {});
                                }
                            }
                        }),
                        performRedo: d_lang.hitch(this, function () {
                            var g = undoRedoTask._graphic;
                            if (g) {
                                var renderer = this._getGraphicRenderer(thingWithGeometry);
                                undoRedoTask._graphic = renderer && renderer.draw(g);
                            }
                        })
                    };

                    if (undoRedo) {
                        var points = thingWithGeometry.geometry.paths[0];
                        d_array.forEach(points, function (point) {
                            undoRedo.add(undoRedoTask);
                        }, this);
                    }
                    var renderer = this._getGraphicRenderer(thingWithGeometry);
                    var g = renderer.draw(thingWithGeometry);
                    undoRedoTask._graphic = g;
                    return g;
                },

                _handleClearGraphics: function () {
                    if (this.graphicRenderer) {
                        this.graphicRenderer.clear();
                    }
                },

                clearGraphics: function (silent) {
                    this._handleClearGraphics();
                    if (!silent) {
                        this._postFrameworkEvent(this._topicBase + "UPDATE_CHART", {});
                    }
                }
            }
        )
    }
);