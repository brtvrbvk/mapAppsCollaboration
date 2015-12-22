/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 04.08.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "ct/util/css",
        "ct/Stateful",
        "ct/_Connect",
        "ct/_when",
        "ct/array",
        "base/util/distance",
        "base/util/units",
        "base/util/GraphicsRenderer"
    ],
    function (declare,
              d_array,
              d_lang,
              ct_css,
              Stateful,
              _Connect,
              ct_when,
              ct_array,
              distance,
              units,
              GraphicsRenderer) {
        return declare([
                Stateful,
                _Connect
            ],
            {

                topics: {
                    RENDER_RESULTS: "agiv/themainfo/RENDER_RESULTS"
                },

                constructor: function () {

                },

                activate: function () {

                    this._renderers = {};
                    this.i18n = this._i18n.get().ui;
                    this._workers = 0;
                    this._rootNode = this._appCtx.getApplicationRootNode();
                    this._locationRenderer = GraphicsRenderer.createForGraphicsNode("THEMA_INFO_LOCATION_IGNORE",
                        this.mapModel, "");
                    this.lastResults = [];

                },

                handleQueryUpdateFromIdentify: function (evt) {
                    var position = this._ct.transform(evt.getProperty("position"),
                        this._mapState.getSpatialReference().wkid);
                    this._locationRenderer.clear();

                    var pointer = {
                        geometry: position,
                        symbol: this.locationSymbol || {
                            "type": "esriSFS",
                            "color": [
                                0,
                                0,
                                255,
                                100
                            ],
                            "size": 5,
                            "outline": {
                                "color": [
                                    0,
                                    0,
                                    255,
                                    255
                                ],
                                "style": "esriSLSSolid",
                                "type": "esriSLS",
                                "width": 2
                            },
                            "style": "esriSFSSolid",
                            "xoffset": 0,
                            "yoffset": 0
                        }
                    };
                    this._locationRenderer.draw(pointer);
                    this.handleQueryUpdate(evt);
                },

                handleQueryUpdate: function (evt) {

                    this.lastResults = [];

                    var nodes = this._getLeafNodesFromContentModel();

                    var position = this._ct.transform(evt.getProperty("position"),
                        this._mapState.getSpatialReference().wkid);
                    var radius = this.radius = evt.getProperty("radius") * 1000;

                    d_array.forEach(nodes, function (node) {

                        var service = node.service || (node.parent && node.parent.service);
                        if (service) {
                            if (this["_worker" + service.serviceType] && this["_worker" + service.serviceType].canHandleRequest(node,
                                    service)) {
                                this._handleRefresh(this["_worker" + service.serviceType], node, service, position,
                                    radius);
                            }
                        }

                    }, this);

                },

                _getLeafNodesFromContentModel: function () {
                    return this._contentModel.getOperationalLayer().filterNodes(function (n) {
                        return !n.hasChildren();
                    });
                },

                _increaseWorkers: function () {
                    this._workers++;
                    if (this._workers > 0) {
                        ct_css.toggleClass(this._rootNode, "ctLoadingThemaInfo", true);
                    }
                },
                _decreaseWorkers: function () {
                    this._workers--;
                    if (this._workers <= 0) {
                        ct_css.toggleClass(this._rootNode, "ctLoadingThemaInfo", false);
                    }
                },

                _handleRefresh: function (worker,
                                          node,
                                          service,
                                          position,
                                          radius) {

                    this._updateNode(node, this.i18n.tree.loading);
                    this._increaseWorkers();

                    ct_when(worker.requestInfo(node, service, position, radius), function (res) {
                        this._updateNode(node, res);
                        this._decreaseWorkers();
                    }, function (error) {
                        this._decreaseWorkers();
                        if (error && error.code === 400) {
                            this._updateNode(node, this.i18n.noMetadata);
                        } else if (error && error.status !== 200) {
                            this._updateNode(node, null, error);
                        } else {
                            this._updateNode(node);
                        }
                    }, this);
                },

                clearResults: function () {
                    var nodes = this._getLeafNodesFromContentModel();
                    var that = this;
                    d_array.forEach(nodes, function (node) {
                        that._updateNode(node, that.i18n.tree.loading);
                    });
                    this.lastResults = [];
                },

                _updateNode: function (node,
                                       result,
                                       error) {

                    if (d_lang.isString(result)) {
                        this._contentModel.getNodeById(node.id).set("highlightFeatures", []);
                        this._contentModel.getNodeById(node.id).set("nearestFeature", result);
                    } else if (result && result.length > 0) {
                        this._contentModel.getNodeById(node.id).set("highlightFeatures", [result[0]]);
                        this._contentModel.getNodeById(node.id).set("nearestFeature", result[0]);
                    } else if (!result && error && error.status !== 200) {
                        this._contentModel.getNodeById(node.id).set("highlightFeatures", []);
                        this._contentModel.getNodeById(node.id).set("nearestFeature", null);
                    } else {
                        this._contentModel.getNodeById(node.id).set("highlightFeatures", []);
                        this._contentModel.getNodeById(node.id).set("nearestFeature", this.i18n.tree.noResult);
                    }
                    this._renderSingleResult(node);

                },

                renderResults: function () {

                    var nodes = this._contentModel.getServiceNodes();
                    this.lastResults = [];
                    d_array.forEach(nodes, function (node) {
                        if (node.children && node.children[0]) {
                            var elem = node.children[0];
                            if (elem.highlightFeatures) {
                                this._renderSingleResult(elem);
                            }
                        } else if (node.service && node.service.serviceType === "WMTS") {
                            if (node.highlightFeatures) {
                                this._renderSingleResult(node);
                            }
                        }

                    }, this);

                    this._eventService.postEvent("agiv/themainfo/NEW_RESULT");

                },

                _renderSingleResult: function (node) {

                    if (this._renderers[node.id]) {
                        this._renderers[node.id].detachNode();
                        this._renderers[node.id].detached = true;
                    }

                    if (!node.parent.get("enabled")) {
                        return;
                    }
                    if (node.service && node.service.serviceType === "WMTS") {
                        if (!node.get("enabled")) {
                            return;
                        }
                    }
                    var rendered = false;

                    d_array.forEach(node.highlightFeatures, function (feature) {

                        this.lastResults.push(feature);

                        if (feature.type !== "POI") {
                            var renderer = this._renderers[node.id];
                            if (renderer && renderer.detached) {
                                renderer.attachNode();
                                renderer.detached = false;
                            } else {
                                renderer = GraphicsRenderer.createForGraphicsNode("THEMA_INFO_RESULT_HIGHLIGHTER_IGNORE" + node.id,
                                    this.mapModel, node.parent.title + " op " + units.meterToKilometer(feature.distance,
                                        1) + "km", "POLYGON");
                                this._renderers[node.id] = renderer;
                            }

                            renderer.clear();

                            var pointer = {
                                geometry: feature.geometry,
                                symbol: this["highlight" + feature.geometry.type] || {
                                    "type": "esriSFS",
                                    "color": [
                                        0,
                                        0,
                                        255,
                                        100
                                    ],
                                    "size": 5,
                                    "outline": {
                                        "color": [
                                            0,
                                            0,
                                            255,
                                            255
                                        ],
                                        "style": "esriSLSSolid",
                                        "type": "esriSLS",
                                        "width": 2
                                    },
                                    "style": "esriSFSNull",
                                    "xoffset": 0,
                                    "yoffset": 0
                                }
                            };
                            renderer.draw(pointer);
                            rendered = true;
                        }
                    }, this);

                    if (rendered) {
                        this.mapModel.fireModelStructureChanged();
                    }

                },

                deactivate: function () {

                }
            }
        );
    }
);