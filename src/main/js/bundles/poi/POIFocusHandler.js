/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 22.05.13
 * Time: 08:43
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/DeferredList",
        "dojo/Deferred",
        "ct/_Connect",
        "ct/_equal",
        "ct/Stateful",
        "ct/_when",
        "ct/array",
        "ct/store/CompositeStore",
        "dojo/has",
        "dojo/_base/sniff"
    ],
    function (
        declare,
        d_lang,
        d_array,
        DeferredList,
        Deferred,
        Connect,
        ct_equal,
        Stateful,
        ct_when,
        ct_array,
        CompositeStore,
        has
        ) {
        return declare([
                Connect,
                Stateful
            ],
            {
                constructor: function () {
                },

                activate: function () {
                    this._connectToMouseOver();
                },

                _connectToMouseOver: function () {
                    this.connect("onGraphicMouseOver", this.mapstate,
                        "onGraphicMouseOver",
                        this.handleOnGraphicOver);
                },
                _connectToMouseOut: function () {
                    this.connect("onGraphicMouseOut", this.mapstate,
                        "onGraphicMouseOut",
                        this.handleOnGraphicOut);
                    this.connect("onGraphicMouseOut", this.mapstate,
                        "onMouseOut",
                        this.handleOnGraphicOut);
                },

                addStores: function (store) {
                    if (!this._stores) {
                        this._stores = [];
                    }
                    if (!ct_array.arraySearchFirst(this._stores, {id: store.id})) {
                        ct_array.arrayAdd(this._stores, store);
                        this._refreshStores();
                    }
                },

                removeStores: function (store) {
                    ct_array.arrayRemove(this._stores, store);
                    this._refreshStores();
                },

                _refreshStores: function () {
                    this._compStore = new CompositeStore();
                    d_array.forEach(this._stores, function (s) {
                        this._compStore.addStore(s, s.datasource);
                    }, this);
                },

                handleOnGraphicOver: function (evt) {

                    if (evt && evt.graphic) {

                        var geometry = evt.graphic.geometry;
                        var attr = evt.graphic && evt.graphic.attributes;
                        var isPoi = attr && attr.poitype && attr.type === "POI";

                        if (isPoi && geometry) {
                            this._handlePOIhover(evt);
                        }

                    }
                },

                _handlePOIhover: function (evt) {
                    //we must disconnect the graphic over event to prevent doublicated executions
                    this.disconnect("onGraphicMouseOver");
                    var graphic = evt.graphic;
                    var geometry = graphic.geometry;
                    var content = {
                        geometry: geometry,
                        graphic: graphic
                    };
                    // http://codepen.io/billdwhite/pen/rgEbc
                    var l, t;
                    if (!has("ie") || has("ie") > 8) {
                        var matrix = evt.target.getScreenCTM();
                        var cx = evt.target.getAttribute("cx");
                        var cy = evt.target.getAttribute("cy");
                        l = cx ? matrix.translate(cx, cy).e : evt.pageX;
                        t = cy ? matrix.translate(cx, cy).f : evt.pageY;
                    } else {
                        l = evt.pageX;
                        t = evt.pageY;
                    }
                    var context = d_lang.mixin({
                        source: "POIFocusHandler",
                        type: "POIHoverInfoWidget",
                        position: {
                            l: l,
                            t: t
                        }
                    }, {});
                    if (this._lastQuery) {
                        this._lastQuery.cancel();
                    }
                    if (this.queryAllLayers) {

                        this._lastQuery = this._queryAllStores(geometry);
                        ct_when(this._lastQuery, function (res) {
                            if (res && res.length > 0) {
                                content.items = d_array.map(res, function (item) {

                                    var s = this._compStore._getSubstoreById(item.compositeId.split("@@")[0]);
                                    item.graphicResolver = s.layer.graphicResolver;
                                    item.title = (s.mmNode && s.mmNode.title) || null;
                                    return item;

                                }, this);

                                this._lastQuery = null;
                            } else {
                                this._connectToMouseOut();
                            }
                        }, this);

                    } else {

                        content.items = [graphic.attributes];

                    }

                    var contentInfo = this.contentviewer.findContentInfoById("poihover");
                    this.contentviewer.closeContentInfo(contentInfo);
                    content.id = "poihover";
                    ct_when(this.contentviewer.showContentInfo(content,
                            context,
                            false),
                        function (w) {
                            this._lastWindow = w;
                            this._connectToMouseOut();
                        }, function (err) {
                        }, this);

                    if (this.highlightHoveredPOI) {
                        var itemIds = d_array.map(res, function (item) {
                            return item["id"];
                        }, this);
                        var defs = [];
                        d_array.forEach(this._stores, function (s) {
                            s.setSelected(itemIds, true);
                            this._lastSelection = itemIds;
                            //we want to update all items to get rid of previous selections
                            defs.push(s.triggerNodeRefresh(itemIds));
                        }, this);
                        var defList = new DeferredList(defs);
                        ct_when(defList, function () {
                            this._connectToMouseOut();
                        }, this);
                    }
                },

                queryAllStores: function (geom) {
                    var d = new Deferred();
                    if (this._compStore) {
                        ct_when(this._queryAllStores(geom), function (res) {

                            var result = d_array.map(res, function (item) {

                                var s = this._compStore._getSubstoreById(item.compositeId.split("@@")[0]);
                                item.graphicResolver = s.layer.graphicResolver;
                                return item;

                            }, this);

                            d.resolve(result);

                        }, function (error) {
                            d.reject(error);
                        }, this);
                    } else {
                        d.reject();
                    }

                    return d;

                },

                _queryAllStores: function (geom) {
                    var query = {
//                        "$and": [
//                            {
                        "geometry": {
                            "$overlaps": geom
                        }
//                            }
//                            {
//                                "fromCache": {
//                                    "$eq": true
//                                }
//                            }
//                        ]
                    };

                    return this._compStore.query(query, {silent: true});
                },

                getStoreForType: function (type) {
                    var res = d_array.filter(this._stores, function (item) {
                        if (item.datasource && item.datasource.poitype === type) {
                            return item;
                        }
                    });
                    return res && res.length > 0 ? res[0] : undefined;
                },

                _closeWindow: function (w) {
                    if (w) {
                        w.close();
                    }
                },

                handleOnGraphicOut: function (evt) {
                    this.disconnect("onGraphicMouseOut");
                    this._closeWindow(this._lastWindow);
                    if (this.highlightHoveredPOI) {
                        var defs = [];
                        d_array.forEach(this._stores, function (s) {
                            s.setSelected(this._lastSelection, false);
                            defs.push(s.triggerNodeRefresh(this._lastSelection));
                        }, this);
                        var defList = new DeferredList(defs);
                        ct_when(defList, function () {
                            this._connectToMouseOver();
                        }, this);
                    } else {
                        this._connectToMouseOver();
                    }

                },

                closeContentInfo: function (contentInfo) {
                    if (contentInfo && contentInfo.contentWindow) {
                        this._closeWindow(contentInfo.contentWindow);
                    }
                },

                deactivate: function () {
                    this.disconnect();
                }
            }
        );
    }
);