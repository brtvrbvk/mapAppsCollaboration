define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/Deferred",
        "dojo/store/util/QueryResults",
        "esri/geometry/jsonUtils",
        "ct/array",
        "ct/request",
        "ct/_when",
        "ct/store/StoreUtil",
        "./_AgivStore",
        "ct/store/ComplexQuery"
    ],
    function (
        d_lang,
        declare,
        d_array,
        Deferred,
        QueryResults,
        e_geometryUtils,
        ct_array,
        ct_request,
        ct_when,
        StoreUtil,
        _AgivStore,
        ComplexQuery
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */

        return declare(
            [_AgivStore],
            /**
             * @lends agiv.bundles.agivsearch.AgivSearchStore.prototype
             */
            {
                minQueryLength: 3,

                /**
                 * @constructs
                 * @author fba
                 */
                constructor: function () {
                },

                activate: function () {
                    this.inherited(arguments);
                    this.selectorID = this._properties.selectorID;
                    this.i18n = this._i18n.get().stores.agivSearchStore;
                },

                // overwrites _processSearchData method to retrieve location coordinates from the result attribute(item.Location.Lon_WGS84/item.Location.Lat_WGS84)
                _processSearchData: function (data) {
                    var items = [];
                    if (data[this.response.resultArrayName]) {
                        items = data[this.response.resultArrayName];
                    } else {
                        var msg = "Unable to parse response ('" + this.response.resultArrayName + "' expected)!";
                        if (data.status && data.status.message) {
                            msg = data.status.message;
                        }
                        console.error("agiv.bundles.agivsearch.AgivSearchStore._processSearchData: " + msg, data);
                        throw Exception.illegalStateError(msg);
                    }
                    var returnedItems = [];
                    d_array.forEach(items, function (
                        item,
                        idx
                        ) {
                        if (item.Location) {
                            if (!item.title) {
                                item.title = item.FormattedAddress;
                            }
                            if (!item.id) {
                                item.id = idx;
                            }
                            // add geometry
                            // get Geometry from Location Attribute
                            item.geometry = e_geometryUtils.fromJson({
                                x: item.Location.Lon_WGS84,
                                y: item.Location.Lat_WGS84,
                                spatialReference: {
                                    wkid: this.wkid
                                }
                            });
                            item.extent = e_geometryUtils.fromJson({
                                // point has no extent but we want to zoom accordingly
                                xmin: item.BoundingBox.LowerLeft.Lon_WGS84,
                                ymin: item.BoundingBox.LowerLeft.Lat_WGS84,
                                xmax: item.BoundingBox.UpperRight.Lon_WGS84,
                                ymax: item.BoundingBox.UpperRight.Lat_WGS84,
                                spatialReference: {
                                    wkid: this.wkid
                                }
                            });
                        } else {
                            var title = item;
                            item = {}
                            // add title
                            item.title = title;
                            // add id
                            if (!item.id) {
                                item.id = idx;
                            }
                        }
                        returnedItems.push(item);
                    }, this);
                    this._data = returnedItems;
                    return returnedItems;
                },
                get: function (id) {
                    //replace last /Lookup with /Lookation
                    var d = new Deferred();
                    if (this._data && this._data.length > 0) {
                        d.callback(ct_array.arraySearchFirst(this._data, {
                            id: id
                        }));
                    }
                    return d;
                },
                query: function (
                    query,
                    options
                    ) {
                    var content = this._extractContentFromQuery(query, options);
                    this.queryValue = content.q;
                    if (content.q.length < this.minQueryLength) {
                        return QueryResults();
                    }
                    return QueryResults(ct_when(ct_request.requestJSON({
                        url: this.url,
                        content: content,
                        timeout: this.timeout
                    }), function (response) {
                        var total = response.count;
                        var result = this._processSearchData(response);
//                        result = StoreUtil.sort(result,options);
                        if (result.length > 0 && options.deep) {
                            result[0].deep = options.deep;
                        } else {
                            this._addSelectorItem(result);
                        }
                        result.total = total;
                        return result;
                    }, this));
                },
                _extractContentFromQuery: function (
                    query,
                    options
                    ) {
                    var ast = ComplexQuery.parse(query, options).ast;
                    var walker = ast.walker();
                    if (!walker.toFirstChild()) {
                        throw illegalArgumentError("LocationFinderStore: No query found!");
                    }
                    var astNode = walker.current;
                    var operation = astNode.o.substring(1);
                    if (operation !== "suggest") {
                        throw illegalArgumentError("LocationFinderStore: No 'suggest' query!");
                    }
                    var content = {
                        q: astNode.v
                    };
                    var qopts = walker.queryOptions;
                    var count = qopts.count;
                    if (qopts.deep) {
                        count = 1;
                    }
                    if (count !== Infinity) {
                        content.c = count;
                    }
                    var start = qopts.start;
                    if (start) {
                        content.start = start;
                    }
                    d_lang.mixin(content, this.parameters);
                    return content;
                },

                _addSelectorItem: function (result) {
                    if (this.selector) {
                        var selectorID = this.selectorID;
                        if (!selectorID) {
                            selectorID = this.orgStroe.selectorID;
                        }
                        var item = {
                            id: selectorID,
                            title: this.i18n.switchStoreCommand,
                            searchValue: this.queryValue
                        }
                        result.splice(result.length, 0, item);
                    }
                }
                //             ,
                //
                //             _fetchItems: function(request, fetchHandler, errorHandler){
                //                 var qp = this.request.queryParameter,
                //                 query = request && request.query && request.query[qp],
                //                 l = this.request.minQueryLength;
                //                 if (query && l && query.length<l) {
                //                     request.query[qp] = "";
                //                 }
                //
                //                 this.inherited(arguments);
                //
                //             }

            });
    });