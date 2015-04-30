define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/request",
        "ct/_when",
        "ct/mapping/geometry",
        "ct/Exception",
        "ct/_lang",
        "ct/store/ComplexQuery",
        "dojo/store/util/QueryResults",
        "ct/store/StoreUtil"
    ],
    function (
        d_lang,
        declare,
        d_array,
        ct_request,
        ct_when,
        ct_geometry,
        Exception,
        ct_lang,
        ComplexQuery,
        QueryResults,
        StoreUtil
        ) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */
        /**
         * @fileOverview This file implements the dojo store to provide a search store for the locationfinder search service.
         */
        var illegalArgumentError = Exception.illegalArgumentError;

        return declare([],
            /**
             */
            {
                /**
                 * The location finder service's url.
                 * @type string
                 * @property
                 */
                url: null,

                /**
                 * wkid of search service (default is 32632).
                 * @type Number
                 * @property
                 */
                wkid: 32632,

                /**
                 * Adds type to found item (default is true).
                 * @type boolean
                 * @property
                 */
                resolveType: true,

                timeout: 5000,

                typeResolver: {
                    "Gemeinde": "Community",
                    "TopoName": "Topographical name",
                    "Ort": "Place",
                    "Stra\u00DFe": "Street",
                    "Kreis": "County",
                    "Regierungsbezirk": "District",
                    "Adresse": "Address"
                },

                /**
                 * This store provides an interface for the location finder service.
                 * @constructs
                 * @param args arguments
                 */
                constructor: function (
                    /*Object*/
                    args
                    ) {
                    args = args || {};
                    var i18n = (args._i18n && args._i18n.get()) || {};
                    if (i18n.typeResolver) {
                        this.typeResolver = i18n.typeResolver;
                    }
                    d_lang.mixin(this, args);
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
                        type: "json",
                        query: astNode.v
                    };
                    var qopts = walker.queryOptions;
                    var count = qopts.count;
                    if (count !== Infinity) {
                        content.limit = count;
                    }
                    var start = qopts.start;
                    if (start) {
                        content.start = start;
                    }
                    d_lang.mixin(content, this.parameters);
                    return content;
                },

                query: function (
                    query,
                    options
                    ) {
                    var content = this._extractContentFromQuery(query, options);
                    var promise = ct_when(ct_request.requestJSON({
                        url: this.url,
                        content: content,
                        timeout: this.timeout
                    }), function (response) {
                        var total = response.count;
                        var result = this._processSearchData(response);
                        result = StoreUtil.sort(result, options);
                        result.total = total;
                        return result;
                    }, this);
                    // need delegate, because the promise is frozen in chrome
                    promise = d_lang.delegate(promise, {
                        total: promise.then(function (result) {
                            return result.total;
                        })
                    });
                    return QueryResults(promise);
                },
                _processSearchData: function (data) {
                    // check if response is okay
                    if (!data.ok) {
                        var msg = data.info;
                        throw illegalArgumentError("LocationFinderStoreException:" + msg);
                    }
                    var wkid = this.wkid;
                    if (data.sref) {
                        var index = data.sref.indexOf(":");
                        wkid = index > -1 ? data.sref.substring(index + 1) : Number(data.sref);
                    }
                    var items = data.locations || data.locs;
                    if (!items) {
                        throw illegalArgumentError("LocationFinderStore.parserException: 'locations' or 'locs' array not found in response!");
                    }
                    return d_array.map(items, function (item) {
                        return this._prepareItem(item, wkid);
                    }, this);
                },
                _prepareItem: function (
                    item,
                    wkid
                    ) {
                    var resolveType = this.resolveType;
                    var typeResolver = this.typeResolver;
                    var newItem = d_lang.clone(item);
                    // merge fields
                    if (newItem.fields) {
                        newItem = d_lang.mixin({}, newItem.fields, newItem);
                        delete newItem.fields;
                    }
                    // add geometry
                    newItem.geometry = ct_geometry.createPoint({
                        x: newItem.cx,
                        y: newItem.cy,
                        wkid: wkid
                    });
                    // apply type resolved type
                    var type = typeResolver[newItem.type] || newItem.type;
                    if (resolveType && type) {
                        newItem.type_resolved = type;
                    }
                    // set extent manually since it differs from the point
                    // item.geometry.extent?
                    //minx,miny,maxx,maxy,wkid
                    newItem.extent = ct_geometry.createExtent(newItem.xmin, newItem.ymin, newItem.xmax,
                        newItem.ymax, wkid);
                    return newItem;
                },
                get: function (id) {
                    //replace last /Lookup with /Lookation
                    var url = this.url.replace(/\/Lookup$/, "/Location");
                    return ct_when(ct_request.requestJSON({
                        url: url,
                        content: {
                            id: id
                        }
                    }), function (data) {
                        return this._processSearchData(data)[0]
                    }, this);
                },

                getIdentity: function (item) {
                    ct_lang.hasProp(item, "id", true, "LocationFinderStore: Item has no 'id' property!");
                    return item.id;
                },

                getMetadata: function () {
                    var metadata = this.metadata || {};
                    var url = this.url.replace(/\/Lookup$/, "/Version");
                    var i18n = this._i18n.get().stores.fields;
                    return ct_when(ct_request.requestJSON({
                        url: url,
                        timeout: this.timeout
                    }), function (response) {
                        var fields = (response.explicitFields || "").split(",");
                        metadata.fields = d_array.map(fields, function (field) {
                            return {
                                name: field,
                                title: i18n[field] || field,
                                type: "string"
                            }
                        }).concat(metadata.fields || []);
                        return metadata;
                    }, function (error) {
                        throw illegalArgumentError("Error querying metadata from service!", error);
                    }, this);
                }
            });
    });