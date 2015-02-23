define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/_lang",
        "ct/_when",
        "ct/array",
        "ct/Stateful",
        "ct/mapping/map/GraphicsLayerNode",
        "ct/mapping/map/CategoryNode",
        "base/util/GraphicsRenderer",
        "./NumberedSymbolLookupStrategy",
        "base/mapping/MappingResourceUtils"
    ],
    function (
        d_lang,
        declare,
        d_array,
        ct_lang,
        ct_when,
        ct_array,
        Stateful,
        GraphicsLayerNode,
        CategoryNode,
        GraphicsRenderer,
        NumberedSymbolLookupStrategy,
        MappingResourceUtils
        ) {
        /*
         * COPYRIGHT 2013 con terra GmbH Germany
         */

        return declare([Stateful], {

            CONTENT_MODEL_LAYER_ADD: "contentModelLayerAdd",

            constructor: function () {
                this._nodes = [];
                this._results = [];
            },

            activate: function () {
                this.pointZoomScale = this.pointZoomScale || 1000;
            },

            deactivate: function () {

            },

            _handleResultClear: function () {
                this._clear();
            },

            _handleResultSelectionIdentify: function (evt) {

                this._handleResultSelection(evt.getProperties().result, false);

            },

            _handleResultSelection: function (
                evt,
                doZoom
                ) {
                var item = evt && evt._properties && evt._properties.entries.result || evt;
                var nodes = this._mapModel.getGlassPaneLayer().children;
                var foundIdx = ct_array.arrayFirstIndexOf(nodes, {
                    title: item.title
                });
                var preventDraw = false;
                if (foundIdx !== -1) {
                    //we already have an item on the map, so don´t draw it, just zoom
                    preventDraw = true;
                }
                var geometry = item && item.geometry;
                if (geometry) {
                    item.geometry = geometry = this._ct.transform(geometry,
                        this._mapState.getSpatialReference().wkid);
                }
                var extent = item && item.extent;
                if (extent) {
                    item.extent = extent = this._ct.transform(extent, this._mapState.getSpatialReference().wkid);
                }

                if (!geometry) {
                    console.debug("DrawHandler.handle: Unable to draw item since no geometry is found.");
                    return;
                }
                var graphicLayerId;
                if (!preventDraw && !item.preventDraw) {

                    if (item.contentDeferred) {
                        ct_when(item.contentDeferred, function (res) {

                            graphicLayerId = this._renderItem(item, res.geometry, doZoom);
                            this._results.push({
                                id: graphicLayerId,
                                item: item
                            });

                        }, function (error) {
                            //TODO
                        }, this);
                        return;
                    } else {
                        graphicLayerId = this._renderItem(item, geometry, doZoom);
                        this._results.push({
                            id: graphicLayerId,
                            item: item
                        });
                    }

                } else {
                    if (doZoom === undefined || (doZoom !== undefined && doZoom)) {
                        this._zoomTo(item);
                    }
                }

            },

            _renderItem: function (
                item,
                geometry,
                doZoom
                ) {

                var graphicLayerId = "searchResult_" + new Date().getTime() + Math.floor(Math.random() * 10000),
                    symbolTable = this._symbolTable;
                this._nodes.push({id: graphicLayerId});
                item.resultNumber = item.resultNumber || this._nodes.length;
                item.renderPriority = item.renderPriority || MappingResourceUtils.getHighestRenderPriorityOfChildren(this._mapModel.getGlassPaneLayer()) + 1;
                var attributes = this._getAttributesFromItem(item);
                var renderer = GraphicsRenderer.createForGraphicsNode(graphicLayerId, this._mapModel, item.title,
                    attributes.type ? attributes.type : "SEARCH_RESULT", undefined,
                    item.renderPriority);

                renderer.set({
                    symbolLookupStrategy: new NumberedSymbolLookupStrategy({
                        lookupByGeometryType: true,
                        lookupTable: this.symbolTableProvider.get("symbolTable"),
                        lookupAttributeName: this.symbolTableProvider.get("lookupAttributeName")
                    }),
                    templateLookupStrategy: null
                });

                console.debug("DrawHandler.handle: Drawing geometry: ", geometry);
                renderer.draw({
                    geometry: geometry,
                    attributes: attributes
                });

                var opts = {
                    source: this
                };
                if (!item.parameterResolver) {
                    opts["action"] = this.CONTENT_MODEL_LAYER_ADD;
                }
                if (graphicLayerId) {
                    opts["graphicLayerId"] = graphicLayerId;
                }
                this._mapModel.fireModelStructureChanged(opts);

                if (doZoom === undefined || (doZoom !== undefined && doZoom)) {
                    this._zoomTo(item);
                }

                this._eventService ? this._eventService.postEvent("agiv/search/RESULT_RENDERED", {result: item}) : null;

                return graphicLayerId;

            },

            _refreshRenderings: function () {

                this._clear(true);
                this._results = d_array.map(this._results, function (result) {
                    var id = this._renderItem(result.item, result.item.geometry);
                    result.id = id;
                    return result;
                }, this);

                this._mapModel.fireModelStructureChanged({
                    source: this
                });

            },

            _handleRemove: function (evt) {
                var id = evt.getProperty("itemId");
                var elem = ct_array.arraySearchFirst(this._results, {
                    id: id
                });
                if (elem) {
                    d_array.forEach(this._results, function (res) {
                        if (res.item.resultNumber > elem.item.resultNumber) {
                            res.item.resultNumber--;
                        }
                    }, this);
                    ct_array.arrayRemove(this._results, 0, {
                        id: id
                    });
                    this._refreshRenderings();
                }
            },

            _handleItemClick: function (evt) {

                var layer = evt.getProperty("layer");
                layer = layer.layerObject || layer;
                var geometry = layer.graphics && layer.graphics[0] && layer.graphics[0].geometry;
                var attributes = layer.graphics && layer.graphics[0] && layer.graphics[0].attributes;
                var item = d_lang.mixin({}, attributes);
                item.geometry = geometry;
                this._zoomTo(item);

            },

            _zoomTo: function (item) {

                if (!item.preventZoom) {
                    if (item.extent && item.zoomToExtent) {
                        this._mapState.setExtent(item.extent);
                    } else if (item.geometry.type === "point") {
                        this._mapState.centerAndZoomToScale(item.geometry, this.pointZoomScale);
                    } else {
                        this._mapState.setExtent(item.geometry.getExtent());
                    }
                }

            },

            _getAttributesFromItem: function (item) {
                var attributes = {};
                ct_lang.copyAllProps(attributes, item, ["geometry"], false);
                return attributes;
            },

            _handleClearAll: function () {

                this._results = [];
                this._clear();

            },

            _clear: function (silent) {
                d_array.forEach(this._nodes, function (n) {
                    var elem = ct_array.arraySearchFirst(this._results, {
                        id: n.id
                    });
                    if (elem) {
                        var node = this._mapModel.getNodeById(n.id);
                        elem.item.renderPriority = node.renderPriority;
                    }
                    this._mapModel.removeNodeById(n.id);
                }, this);
                this._nodes = [];
                if (!silent) {
                    this._mapModel.fireModelStructureChanged({
                        source: this
                    });
                }
            }

        });
    });