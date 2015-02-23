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
                // overwrites _processSearchData method to retrieve location coordinates from the result attribute(item.Location.Lon_WGS84/item.Location.Lat_WGS84)
                _processSearchData: function (data) {
                    var items = data;
                    var returnedItems = [];
                    d_array.forEach(items, function (
                        item,
                        idx
                        ) {
                        if (item.Location) {
                            if (!item.title) {
                                item.title = item.Location.Address.Label;
                            }
                            if (!item.id) {
                                item.id = idx;
                            }
                            // add geometry
                            // get Geometry from Location Attribute
                            item.geometry = e_geometryUtils.fromJson({
                                x: item.Location.DisplayPosition.Longitude,
                                y: item.Location.DisplayPosition.Latitude,
                                spatialReference: {
                                    wkid: this.wkid
                                }
                            });
                            if (item.Location.AdditionalData) {
                                item.extent = e_geometryUtils.fromJson({
                                    // point has no extent but we want to zoom accordingly
                                    xmin: item.Location.AdditionalData[0].value,
                                    ymin: item.Location.AdditionalData[2].value,
                                    xmax: item.Location.AdditionalData[3].value,
                                    ymax: item.Location.AdditionalData[1].value,
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
                    if (content.prox.length < this.minQueryLength) {
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
                        prox: astNode.v
                    };
                    var qopts = walker.queryOptions;
                    var count = qopts.count;
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
                }
            });
    });