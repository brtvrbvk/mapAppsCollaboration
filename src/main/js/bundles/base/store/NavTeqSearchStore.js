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
        "./_Store",
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
        _Store,
        ComplexQuery
        ) {

        return declare(
            [_Store],
            {
                minQueryLength: 3,

                constructor: function () {
                },

                activate: function () {
                    this.inherited(arguments);
                    this.i18n = this._i18n.get().stores.navteqStore;
                },
                // overwrites _processSearchData method to retrieve location coordinates from the result attribute(item.Location.Lon_WGS84/item.Location.Lat_WGS84)
                _processSearchData: function (data) {
                    var items = data;
                    var returnedItems = [];
                    d_array.forEach(items, function (
                        item,
                        idx
                        ) {
                        var location;
                        if (item.Location) {
                            location = item.Location;
                        } else if (item.Place && item.Place.Locations && item.Place.Locations.length > 0) {
                            location = item.Place.Locations[0];
                            if (item.Place.Name) {
                                var titleExtend = item.Place.Name;
                            }
                        }
                        if (location) {
                            if (!location.Address.Label) {
                                return;
                            }
                            if (!item.title) {
                                item.title = location.Address.Label;
                            }
                            if (titleExtend) {
                                item.title = item.title + ", " + titleExtend;
                            }
                            if (!item.id) {
                                item.id = idx;
                            }
                            // add geometry
                            // get Geometry from Location Attribute
                            var loc = (location.NavigationPosition && location.NavigationPosition[0]) || location.DisplayPosition;
                            item.geometry = e_geometryUtils.fromJson({
                                x: loc.Longitude,
                                y: loc.Latitude,
                                spatialReference: {
                                    wkid: this.wkid
                                }
                            });
                            if (location.AdditionalData) {
                                item.extent = e_geometryUtils.fromJson({
                                    // point has no extent but we want to zoom accordingly
                                    xmin: location.AdditionalData[0].value,
                                    ymin: location.AdditionalData[2].value,
                                    xmax: location.AdditionalData[3].value,
                                    ymax: location.AdditionalData[1].value,
                                    spatialReference: {
                                        wkid: this.wkid
                                    }
                                });
                            }
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
                        item.value = item.title;
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
                    this.queryValue = content.searchtext;
                    if (content.searchtext.length < this.minQueryLength) {
                        return QueryResults();
                    }
                    return QueryResults(ct_when(ct_request.requestJSON({
                        url: this.url,
                        content: content,
                        timeout: this.timeout
                    }), function (response) {
                        if (response && response.Response && response.Response.View && response.Response.View.length > 0) {
                            var total = response.Response.View[0].Result.length;
                            var result = this._processSearchData(response.Response.View[0].Result);
                            //                        result = StoreUtil.sort(result,options);
//                            if (result.length > 0 && options.deep) {
//                                result[0].deep = options.deep;
//                            } else {
//                                this._addSelectorItem(result);
//                            }
                            result.total = total;
                            return result;
                        } else {
                            return [];
                        }
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
                        searchtext: astNode.v
                    };
                    var qopts = walker.queryOptions;
                    var count = qopts.count;
                    if (qopts.deep) {
                        count = 1;
                    }
                    if (count !== Infinity) {
                        content.maxresults = count;
                    }
                    var start = qopts.start;
                    if (start) {
                        content.start = start;
                    }
                    content.app_id = this.appid;
                    content.token = this.token;

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
            });
    });