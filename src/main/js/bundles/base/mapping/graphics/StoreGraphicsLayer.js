/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 30.09.13
 * Time: 10:10
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/_base/Deferred",

        "ct/_when",
        "ct/array",
        "ct/_Connect",
        "ct/Stateful",

        "esri/layers/GraphicsLayer"

    ],

    function (
        declare,
        d_array,
        d_lang,
        Deferred,
        ct_when,
        ct_array,
        Connect,
        Stateful,
        GraphicsLayer
        ) {
        return declare([
            GraphicsLayer,
            Connect,
            Stateful
        ], {

            /**
             * the store containing the features to draw.
             * implementing the dojo.store.api.Store interface
             */
            store: null,
            /**
             * the graphic resolver to use for rendering.
             */
            graphicResolver: null,

            mapModel: null,

            enablePaging: false,

            itemStartIndex: null,

            maxNumberOfItems: null,

            constructor: function (opts) {
                this.graphicResolver = opts.graphicResolver;
                this.clusterGraphicResolver = opts.clusterGraphicResolver;
                this.store = opts.store;
            },

            _onExtentChangeHandler: function (
                _2f,
                _30,
                _31,
                lod
                ) {
                //workaround to ensure refresh on pan
                arguments[2] = true;
                this.inherited(arguments);
            },

            _createGraphic: function (
                feature,
                count
                ) {
                var store = this.store;
                return this.graphicResolver.resolve(feature, {
                    storeId: store && store.id,
                    store: store,
                    highlightFeatures: this.highlightFeatures,
                    count: count
                });
            },
            _setHighlightFeatures: function (hf) {
                this.highlightFeatures = hf;
                this.refresh();
            },
            _setStore: function (store) {
                this.store = store;
                this.refresh();
            },
            _setGraphicResolver: function (resolver) {
                this.graphicResolver = resolver;
                this.refresh();
            },

            _findMatchingGraphic: function (
                itemId,
                graphics,
                idProperty
                ) {
                var graphicIndex = ct_array.arrayFirstIndexOf(graphics, function (graphicItem) {
                    return itemId == graphicItem.attributes[idProperty];
                });
                return graphics[graphicIndex];
            },

            refresh: function (itemsObj) {
                return this._refresh(true, itemsObj);
            },

            _refresh: function (
                refetch,
                itemsObj
                ) {
                //update the position of old items before fetching new ones
                var d = new Deferred();
                var map = this._map;
                if (!map) {
                    d.reject("no map found");
                    return d;
                }
                var sr = map.spatialReference;
                if (itemsObj) {
                    var items = itemsObj.changedItems;
                    var deleted = itemsObj.deleted;
                }
                var store = this.store;

                if (!this._params.drawMode || !map) {
                    d.reject("no map found or not in drawmode");
                    return d;
                }
                if (this._lastQuery) {
                    this._lastQuery.cancel();
                }
                if (this._lastGraphicQuery) {
                    this._lastGraphicQuery.cancel();
                }
                // we asume the feature geometry is stored in property "geometry".
                if (items instanceof Array && items.length != 0 && items[0] != undefined) {
                    d = this._updateItems(items, store, deleted, sr);
                } else if (items === true) {
                    d = this._updateItems([], store, deleted, sr);
                } else {
                    var gs = this.graphics, il = gs.length, i, _36 = this._draw;
                    for (i = 0; i < il; i++) {
                        _36(gs[i], refetch);
                    }

                    if (refetch) {

                        var query = {
                            geometry: {
                                $bbox: map.extent
                            }
                        };
                        var options = {
//                        count: this.maxcount||500,
                            geometry: true,
                            resolution: this._map.extent.getWidth() / this._map.width
//                        geometry: {
//                            maxAllowableOffset: maxAllowableOffset,
//                            sr: sr
//                        },
//                        fields: {}
                        };
                        options = d_lang.mixin(options, this._queryOptions || {});

                        if (this.enablePaging) {
                            options.start = this.startItemIndex;
                            options.count = this.itemsPerPage;
                        }

                        options.currentScale = this._map.__LOD.scale;

                        this._lastQuery = store.query(query, options);
                        ct_when(this._lastQuery, function (res) {
                            this._parseData(res, d);
                        }, function (err) {
                            d.reject();
                        }, this);

                    }
                }
                return d;
            },

            setQueryOptions: function (
                opts,
                overwrite
                ) {
                if (overwrite) {
                    this._queryOptions = opts;
                } else {
                    this._queryOptions = d_lang.mixin(this._queryOptions || {}, opts);
                }

            },

            _createClusterGraphic: function (feature) {
                return this.clusterGraphicResolver.resolve(feature, {
                });
            },

            _parseData: function (
                res,
                d
                ) {
                var count = res.length;
                if (count > 0) {
                    var graphics = [];
                    d_array.forEach(res, function (item) {

                        graphics.push(this._createGraphic(item, count));

                        if (this.showClusterLabels && item.isCluster && this.clusterGraphicResolver) {
                            var t = this._createClusterGraphic(item);
                            if (t) {
                                graphics.push(t);
                            }
                        }

                    }, this);

                    // inner functionen needed , because original "add" reacts on index of forEach.
                    var add = function (x) {
                        this.add(x);
                    };
                    this._lastGraphicQuery = ct_when(graphics, function (g) {
                        this.clear();
                        d_array.forEach(g, add, this);
                        d.resolve(true);
                    }, this);

                } else {
                    this.clear();
                    d.resolve(true);
                }
            },

            _updateItems: function (
                items,
                store,
                deleted,
                sr
                ) {
                var d = new Deferred();
                var opts = {
                    sr: sr
                };
                var idProperty = store.idProperty;
                var fields = opts.fields = {};
                fields.geometry = false;
                var query = {};
                query[idProperty] = {
                    $in: items
                };
                if (deleted) {
                    d_array.forEach(items, function (itemId) {
                        this._removeItem(itemId, idProperty);
                    }, this);
                    d.resolve(true);
                    return d;
                }

                //we do updates without loading spinner
                opts.silent = true;
                var storeItem = store.query(query, opts);
                ct_when(storeItem, function (resolvedItems) {
                    var idProperty = store.idProperty;
                    if (items.length === 0) {
                        //we update all items
                        this.clear();
                    }
                    d_array.forEach(resolvedItems || [], function (rItem) {
                        var resolvedItemId = rItem[idProperty];
                        if (items.length !== 0) {
                            this._removeItem(resolvedItemId, idProperty);
                        }
                        if (rItem.geometry) {
                            var graphic = this._createGraphic(rItem);
                            this.add(graphic);
                        }
                    }, this);
                    d.resolve(true);
                }, this);
                return d;
            },

            _removeItem: function (
                itemId,
                idProperty
                ) {
                var oldGraphic = this._findMatchingGraphic(itemId, this.graphics, idProperty);
                this.remove(oldGraphic);

            }

        });
    });