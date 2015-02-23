/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/store/util/QueryResults",
        "dojo/_base/Deferred",
        "ct/_lang",
        "ct/array",
        "ct/_when",
        "ct/request",
        "ct/mapping/geometry",
        "ct/store/SpatialQuery",
        "ct/_Connect",
        "./rbush",
        "./_POIParser"
    ],

    function (
        declare,
        d_array,
        d_lang,
        QueryResults,
        Deferred,
        ct_lang,
        ct_array,
        ct_when,
        ct_request,
        ct_geometry,
        SpatialQuery,
        Connect,
        rbush,
        _POIParser
        ) {
        return declare([
            _POIParser,
            Connect
        ], {

            target: null,
            idProperty: "id",
            idList: null,
            _hasFetched: false,
            minQueryLength: 0,

            constructor: function (opts) {
                this.id = opts.id;
                this.target = opts.target;
                this.useIn = opts.useIn;
                this.poitype = opts.poitype ? opts.poitype : null;
                this.poiID = opts.poiID ? opts.poiID : null;
                this.currentScale = opts.currentScale || null;
                this.minQueryLength = opts.minQueryLength || this.minQueryLength;
                this.srs = opts.srs || null;
                this.idList = [];
                this.queryOptions = opts.queryOptions || {};
                this._metadata = opts.metadata || {
                    fields: [
                        {
                            "name": "geometry",
                            "type": "geometry"
                        },
                        {
                            "name": "id",
                            "type": "string"
                        },
                        {
                            "name": "poitype",
                            "type": "string"
                        },
                        {
                            "name": "primaryLabel",
                            "type": "string"
                        },
                        {
                            "name": "note",
                            "type": "string"
                        },
                        {
                            "name": "viaLink",
                            "type": "string"
                        },
                        {
                            "name": "address",
                            "type": "string"
                        },
                        {
                            "name": "isCluster",
                            "type": "string"
                        }
                    ]
                };
            },

            setCurrentScale: function (s) {
                this.currentScale = s;
            },

            _handleScaleChanged: function (evt) {
                var scale = evt._properties.entries.scale;
                if (scale) {
                    this.setCurrentScale(scale);
                }
            },

            onUpdateStart: function (evt) {
            },
            onUpdateEnd: function (evt) {
            },

            /**
             * query
             *
             *
             * options
             *    geometry
             *    fields
             *    queryRadius
             *    suggestContains
             *
             */
            query: function (
                query,
                options
                ) {
                //- parse query
                var content = {};
                options = options || {};
                if (this.poitype && !options.loosePOItype) {
                    content.POIType = this.poitype
                }

                if (this.poiID) {
                    //TODO get this from the old query geometry
                    content.srsOut = "3857";
                    if (this._hasFetched) {
                        content.fromCache = true;
                        content.id = this.poiID;
                    } else {
                        //if we have a poiID we override the query
                        query = {"id": {$eqw: this.poiID}};
                    }
                }

                if (options.hasOwnProperty("start") && options.hasOwnProperty("count")) {
                    options = d_lang.mixin(options, {
                        fromCache: true
                    });
                }

                this.currentScale = options.currentScale || this.currentScale;

                options = d_lang.mixin(options, this.queryOptions);

                this._convertQuery(content, query, options);
                var d;
                var r = new Deferred(function () {
                    canceled = true;
                    d.reject();
                });
                if (content.isSuggest) {
                    delete content.isSuggest;
                    if (content.keyword.length < this.minQueryLength) {
                        return QueryResults();
                    }
                }
                if (!content.srsOut) {
                    content.srsOut = "3857";
                }
                if (content.fromCache) {
                    if (!this._hasFetched) {
                        //we need to wait
                        this.connect("waitforrequest", this, "onUpdateEnd", function () {
                            this.disconnect("waitforrequest");
                            d = this._fetchFromCache(content);
                            ct_when(d, function (res) {
                                if (res && res.length > 0) {
                                    res.total = res.length;
                                    r.resolve(res);
                                } else {
//                            r.reject("error while fetching from cache");
                                    r.resolve([]);
                                }
                            }, function (err) {
                                r.reject(err);
                            }, this);
                        });
                    } else {
                        d = this._fetchFromCache(content);
                        ct_when(d, function (res) {
                            if (res && res.length > 0) {
                                res.total = res.length;
                                r.resolve(res);
                            } else {
//                            r.reject("error while fetching from cache");
                                r.resolve([]);
                            }
                        }, function (err) {
                            r.reject(err);
                        }, this);
                    }

                } else {
                    this._hasFetched = false;
                    this.onUpdateStart();

                    d = ct_request.requestJSON({
                        content: content,
                        url: this.target
                    });
                    ct_when(d, function (res) {
                        //- parse results
                        try {
                            var t = this._parseResults(res);

                            if (!content.preventCacheUpdate && t.length > 0) {
                                this._createIdList(t);
                                this._cache = t;
                                this._searchtree = new rbush(10, [
                                    ".geometry.x",
                                    ".geometry.y",
                                    ".geometry.x",
                                    ".geometry.y"
                                ]);
                                this._searchtree.load(t);
                            }

                            t.total = t.length;

                            this._hasFetched = true;
                            r.resolve(t);
                        } catch (e) {
                            r.reject(e);
                        }
                        this.onUpdateEnd();
                    }, function (err) {
                        this._hasFetched = false;
                        this.onUpdateEnd();
                        r.reject(err);
                    }, this);
                }

                //- decorate results
                r.total = ct_when(r, function (results) {
                    return results ? results.total : 0;
                });
                return QueryResults(r);
            },

            _createIdList: function (list) {
                this.idList = [];
                d_array.forEach(list, function (item) {
                    this.idList.push(item[this.idProperty]);
                }, this);
            },

            _calcRadiusForScale: function () {
                //19px ~ 0,5cm @ 96dpi to each side

                var res = ct_geometry.calcPixelResolutionAtScale(this.currentScale,
                    ct_geometry.createSpatialReference({wkid: this.srs}),
                    96);
                var rad = res * 5;

                return rad;
            },

            _fetchFromCache: function (content) {
                var d = new Deferred(function () {
                    canceled = true;
                    d.cancel();
                });

                if (!this._cache) {
                    d.resolve([]);
//                    d.reject("no cache found");
                    return d;
                }

                if (content.inIDs) {
                    var ids = content.inIDs;
                    //fetch by IDs
                    if (ids && ids.length > 0) {
                        console.debug("fetch from store by Ids");
                        var res = d_array.filter(this._cache, function (item) {
                            if (ct_array.arraySearchFirst(ids, item[this.idProperty])) {
                                return item;
                            }
                            return null;
                        }, this);
                        d.resolve(res);
                    } else {
                        console.debug("fetch all from store");
                        d.resolve(this._cache);
                    }
                } else if (content.spatialRel == "overlaps") {
                    //we currently only support points
                    //we create an extent with a radius coupled to the scale
                    if (content.geometry.type != "point") {
                        throw new Error("We only support points right now");
                    }
                    var rad = this._calcRadiusForScale();
                    var geom = content.geometry;
//                    var start = new Date().getTime();
//                    var buffer = ct_geometry.createExtent({
//                        xmin: geom.x - rad,
//                        xmax: geom.x + rad,
//                        ymin: geom.y - rad,
//                        ymax: geom.y + rad,
//                        spatialReference: geom.spatialReference
//                    });

                    var res = this._searchtree.search([
                            geom.x - rad,
                            geom.y - rad,
                            geom.x + rad,
                            geom.y + rad
                    ]);

//                    var res = d_array.filter(this._cache, function (item) {
//                        if (buffer.intersects(item.geometry)) {
//                            return item;
//                        }
//                        return null;
//                    }, this);
//                    var end = new Date().getTime();
//                    console.log("overlaps search took "+(end-start));
                    d.resolve(res);
                } else if (content.spatialRel == "within") {
                    var bbox = content.bbox;
                    if (!bbox) {
                        throw new Error("No bbox attr found");
                    }
                    bbox = bbox.split("|");
//                    var ext = ct_geometry.createExtent({
//                        xmin: bbox[0],
//                        xmax: bbox[2],
//                        ymin: bbox[1],
//                        ymax: bbox[3],
//                        spatialReference: {wkid:content.srsIn}
//                    });

                    var res = this._searchtree.search([
                        bbox[0],
                        bbox[1],
                        bbox[2],
                        bbox[3]
                    ]);

//                    var res = d_array.filter(this._cache, function (item) {
//                        if (ext.contains(item.geometry)) {
//                            return item;
//                        }
//                        return null;
//                    }, this);
                    d.resolve(res);
                } else if (content.queryAll) {
                    d.resolve(this._cache);
                } else if (content.count === 0 && content.start === 0) {
                    d.resolve(this._cache);
                } else if (content.count !== undefined && content.start !== undefined) {
                    var res = this._cache.slice(content.start, content.count + content.start);
                    d.resolve(res);
                } else if (content.id) {
                    var tmpq = {};
                    tmpq[this.idProperty] = content.id;
                    var res = ct_array.arraySearchFirst(this._cache, tmpq);
                    d.resolve([res]);
                } else {
                    console.error("no correct query", content);
                    d.reject("no correct query");
                }

                return d;
            },

            getMetadata: function () {
                var d = new Deferred();
                d.resolve(this._metadata);
                return d;
            },

            get: function (
                id,
                directives
                ) {
                directives.srsOut = directives.srsOut || this.srs;
                directives.loosePOItype = true;
                return this.query({"id": {$eqw: id}}, directives);
            },

            /**
             * Returns an object's identity
             */
            getIdentity: function (object) {
                return object[this.idProperty];
            },

            getIdProperty: function () {
                return this.idProperty;
            },

            _convertQuery: function (
                targetQuery,
                query,
                options
                ) {

                // see specification of SpatialQueries!
                var ast = SpatialQuery.parse(query, options).ast;
                var walker = ast.walker();

                // check first for a spatial operator
                if (this._convertToSpatialQuery(targetQuery, walker)) {
                    //we have a spatial query
                }
                // check if no ast is defined
                ast.optimize();
                walker = ast.walker();
                // now check if any
                // where clause is needed
                if (targetQuery.geometry && !walker.hasChildren()) {
                    // don't add AllFeaturesQuery if spatial query was present
                    return;
                }
                if (options.queryRadius != undefined) {
                    if (this.currentScale) {
                        //TBT should be tested out
                        targetQuery.radius = this._calcRadiusForScale();
                    } else {
                        targetQuery.radius = options.queryRadius;
                    }
                }

                if (options.count) {
                    targetQuery.maxcount = options.count;
                }

                if (options.start) {
                    targetQuery.startindex = options.start;
                }

                this._removeTrashFromOptions(options);

                d_lang.mixin(targetQuery, options);

            },

            _removeTrashFromOptions: function (opts) {
                for (var k in opts) {

                    //only check for special cases and apply changes
                    switch (k) {
                        case "geometry":
                            delete opts[k];
                            break;
                        case "resolution":
                            delete opts[k];
                            break;
                        case "currentScale":
                            delete opts[k];
                            break;
                    }

                }

            },

            _addQueryOperator: function (
                targetQuery,
                walker
                ) {
                var astNode = walker.current;
                var rel = astNode.o.substring(1);

                if (rel === "in") {
                    //we have a query for items by ID
                    targetQuery.fromCache = true;
                    targetQuery.inIDs = astNode.v || [];
                    return true;
                } else if (rel === "eq" && astNode.n === this.idProperty) {
                    //we have a query for an item by ID
                    targetQuery.fromCache = true;
                    targetQuery.inIDs = [astNode.v];
                    return true;
                } else if (rel === "eqw" && astNode.n === this.idProperty) {
                    targetQuery.id = astNode.v;
                    return true;
                } else if (walker.hasChildren() && walker.current.o === "$and") {
                    walker.toFirstChild();
                    this._convertToSpatialQuery(targetQuery, walker);
                    return true;
                }
            },

            _convertToSpatialQuery: function (
                targetQuery,
                walker
                ) {
                // here we don't walk, we simple check some cases for geometry
                // otherwise the query will not be "valid"
                if (walker.isROOT() && !walker.toFirstChild()) {
                    // no query (or) query for all features
                    return false;
                }
                if (this._addSpatialOperator(targetQuery, walker)) {
                    // direct spatial query, without attributes
                    return true;
                }
                else if (this._addQueryOperator(targetQuery, walker)) {
                    return true;
                }
                if (walker.hasChildren() && walker.current.o === "$and") {
                    // query has $and and one of it childs maybe an geometry query
                    walker.toFirstChild();
                    while (!this._convertToSpatialQuery(targetQuery,
                        walker) && walker.toNextSibling()) {
                    }
                    return true;
                } else if (walker.current.o === "$suggest") {
                    targetQuery.keyword = walker.current.v;
                    targetQuery.isSuggest = true;
                    targetQuery.srsOut = this.srs;
                }
                return false;
            },

            _addSpatialOperator: function (
                targetQuery,
                walker
                ) {
                var astNode = walker.current;
                var spatialRel = astNode.o.substring(1);
                //TODO comment out the bbxo/east-north elements when service supports them
                if ((spatialRel === "within" && astNode.n === "geometry") || (spatialRel === "envelopeintersects" && astNode.n === "geometry")) {
                    var geom = astNode.v;
                    if (this.currentScale && this.currentScale < 577799) {
                        targetQuery.bbox = geom.xmin + "," + geom.ymin + "|" + geom.xmax + "," + geom.ymax;
                        targetQuery.spatialRel = spatialRel;
                    }
                    targetQuery.srsIn = geom.spatialReference.wkid + "";
                    targetQuery.srsOut = geom.spatialReference.wkid + "";
                    return true;
                } else if (spatialRel === "intersects" && astNode.n === "geometry") {
                    var geom = astNode.v;
//                    targetQuery.east = 4.700460240564312;
//                    targetQuery.north = 50.881881342688914;
                    if (geom.xmin) {
                        geom = geom.getCenter();
                    }
                    targetQuery.east = geom.x;
                    targetQuery.north = geom.y;
                    targetQuery.srsIn = geom.spatialReference.wkid + "";
//                    targetQuery.srsIn = 4326 + "";
                    targetQuery.srsOut = geom.spatialReference.wkid + "";
                    return true;
                } else if (spatialRel === "overlaps" && astNode.n === "geometry") {
                    var geom = astNode.v;
                    targetQuery.fromCache = true;
                    targetQuery.spatialRel = "overlaps";
                    targetQuery.geometry = geom;
                }
                return false;
            }

        });
    });