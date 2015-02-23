/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 02.10.13
 * Time: 09:24
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/_base/Deferred",
        "dojo/_base/json",
        "ct/Exception",
        "ct/array",
        "ct/_lang",
        "base/util/GraphicsRenderer",
        "esri/geometry/jsonUtils",
        "base/store/poi/POIServerStore",
        "base/util/Comparator"
    ],
    function (
        declare,
        d_lang,
        d_array,
        Deferred,
        d_json,
        Exception,
        ct_array,
        ct_lang,
        GraphicsRenderer,
        e_geometryUtils,
        POIServerStore,
        comparator
        ) {
        return declare([],
            {

                _searchResultNodeIdPattern: /SEARCH_RESULT/,

                constructor: function () {
                },

                activate: function () {
                },

                _isEsriMapLoaded: function () {
                    var def = new Deferred();
                    //wait for map since most of the params refer to it
                    Deferred.when(this._map.get("esriMapReference").waitForEsriMapLoad(),
                        d_lang.hitch(this, function (success) {
                            if (success) {
                                def.callback();
                            } else {
                                def.reject();
                            }
                        }));
                    return def;
                },

                persist: function () {
                    return this.encodeURLParameter();
                },

                read: function (obj) {
                    return this.decodeURLParameter(obj);
                },

                encodeURLParameter: function () {
                    var tmp = {};
                    var tmpArray = [];
                    var searchResultTmp = this._mapModel.getGlassPaneLayer().children;
                    var wasReordererd = false;
                    d_array.forEach(searchResultTmp, function (node) {
                        if (node.nodeType && node.nodeType.match(this._searchResultNodeIdPattern)) {
                            var hasGraphic = node.graphics && node.graphics.length && node.graphics.length > 0;
                            if (hasGraphic) {
                                var attr = {};
                                var attributes = node.graphics[0].attributes;
                                ct_lang.copyAllProps(attr, attributes, [
                                    "BoundingBox",
                                    "Location",
                                    "storeQueries",
                                    "graphic",
                                    "contentDeferred",
                                    "geocodeDeferred"
                                ], false);
                                if (attr.extent && attr.extent.toJson) {
                                    attr.extent = attr.extent.toJson();
                                }
                                var geometry = node.graphics[0].geometry;
                                if (geometry && geometry.toJson) {
                                    attr.geometry = geometry.toJson();
                                }
                                if (attr.store) {
                                    attr.store = {
                                        target: attr.store.target
                                    };
                                }
                                if (node.renderPriority !== undefined) {
                                    attr.renderPriority = node.renderPriority;
                                    wasReordererd = true;
                                }

                                if (!attr.preventDraw) {
                                    tmpArray[tmpArray.length] = attr;
                                }
                            }
                        }
                    }, this);
                    ct_array.arraySort(tmpArray, comparator.renderPriorityComparator);
                    if (!wasReordererd) {
                        tmpArray = tmpArray.reverse();
                    }
                    tmp.searchResult = d_json.toJson(tmpArray);
                    return tmp;
                },

                decodeURLParameter: function (urlObject) {
                    Deferred.when(this._isEsriMapLoaded(), d_lang.hitch(this, function () {
                        var graphicsNodes = urlObject && urlObject.searchResult && d_json.fromJson(urlObject.searchResult);
                        var dataAdded = false;
                        var exception = null;
                        try {
                            if (graphicsNodes && graphicsNodes !== undefined && graphicsNodes.length && graphicsNodes.length > 0) {
                                d_array.forEach(graphicsNodes, function (node) {
                                    if (node.type.match(this._searchResultNodeIdPattern)) {
                                        if (node.geometry) {
                                            node.geometry = e_geometryUtils.fromJson(node.geometry);
                                        }
                                        if (node.extent) {
                                            node.extent = e_geometryUtils.fromJson(node.extent);
                                        }
                                        if (node.type === "SEARCH_RESULT_POI" && node.store) {
                                            node.store = new POIServerStore(node.store);
                                        }
                                        this._drawGeometryEventReceiver._handleResultSelection(d_lang.mixin(node,
                                                {
                                                    parameterResolver: true
                                                }),
                                            false);
                                    }
                                }, this);
                                dataAdded = true;
                            }
                        } catch (e) {
                            exception = e;
                        }

                        if (dataAdded) {
                            this._mapModel.fireModelStructureChanged({
                                source: this
                            });
                        }

                        if (exception) {
                            throw Exception.illegalArgumentError("Could not complete URL parameter parsing",
                                exception);
                        }
                    }));
                },

                deactivate: function () {
                }
            }
        );
    }
);