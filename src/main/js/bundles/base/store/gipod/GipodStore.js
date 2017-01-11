/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 26.09.13
 * Time: 15:19
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "ct/util/css",
        "dojo/date/locale",
        "dojo/store/util/QueryResults",
        "dojo/_base/Deferred",
        "ct/_lang",
        "ct/array",
        "ct/_when",
        "ct/request",
        "ct/mapping/geometry",
        "ct/store/SpatialQuery",
        "ct/_Connect",
        "./_GipodParser",
        "../StoreResultFilterPlugin",
        "../StoreDuplicateFilterPlugin",
        "../StoreResultClusterPlugin"
    ],
    function (declare, d_array, d_lang, ct_css,d_date, QueryResults, Deferred, ct_lang, ct_array, ct_when, ct_request, ct_geometry, SpatialQuery, Connect, GipodParser, StoreResultFilterPlugin, StoreDuplicateFilterPlugin, StoreResultClusterPlugin) {
        return declare([
                Connect,
                GipodParser
            ],
            {

                _dateFormat: "yyyy-MM-dd",
                _plugins: null,
                
                constructor: function (args) {

                    this.id = args.id;

                    this._plugins = [];

                    //pluginorder is important!
                    this._plugins.push(new StoreDuplicateFilterPlugin({
                        duplicateIdentifier: "gipodId"
                    }));

                    this._plugins.push(new StoreResultFilterPlugin({
                        filterOptions: args.filterOptions
                    }));

                    this._plugins.push(new StoreResultClusterPlugin({
                        scaleThreshold: args.scaleThreshold
                    }));

                    this.target = args.target;
                    this.baseUrl = args.target;

                    this.fixedQueryOptions = args.fixedQueryOptions || {};
                    this.queryOptions = args.queryOptions || {};

                    this._metadata = args.metadata || {
                        fields: [
                            {
                                "name": "geometry",
                                "type": "geometry"
                            },
                            {
                                "name": "gipodId",
                                "type": "string"
                            },
                            {
                                "name": "eventType",
                                "type": "string"
                            }
                        ]
                    };

                    if (args.gipodType) {
                        this.gipodType = args.gipodType;
                        this.target += "/" + args.gipodType;
                    }

                },

                _parseResults: function (results, targetQuery, options) {
                    //arguments[0] = arguments[0].slice(0,);
                    var res = this.inherited(arguments);

                    d_array.forEach(this._plugins, function (p) {

                        res = p.process(res, targetQuery, options);

                    });

                    return res;

                },

                getMetadata: function () {
                    var d = new Deferred();
                    d.resolve(this._metadata);
                    return d;
                },

                query: function (query, options) {

                    options = d_lang.mixin(d_lang.clone(this.queryOptions), options);
                    this._currentScale = options.currentScale;

                    options = d_lang.mixin(options, this.fixedQueryOptions);

                    var restoption = options.rest || "";

                    var targetQuery = this._convertQuery(query, options);

                    var r = new Deferred();

                    this.onUpdateStart();

                    var d = ct_request.requestJSON({
                        content: targetQuery,
                        url: this.target + restoption,
                        headers: {
                            "Accept": "application/json"
                        }
                    });

                    ct_when(d, function (res) {
                        if (r && (r.isResolved() || r.isCanceled() || r.isRejected())) {
                            this.onUpdateEnd();
                            return;
                        }
                        //- parse results
                        if (this._currentScale !== options.currentScale) {
                            try {
                                r.resolve([]);
                            } catch (e) {

                            }
                            this.onUpdateEnd();
                        } else {
                            var t = this._parseResults(res, targetQuery, options);
                            t.total = t.length;
                            try {
                                r.resolve(t);
                            } catch (e) {

                            }
                            this.onUpdateEnd(t);
                        }

                    }, function (err) {
                        this.onUpdateEnd();
                        if (r && (r.isResolved() || r.isCanceled() || r.isRejected())) {
                            return;
                        }
                        try {
                            r.reject(err);
                        } catch (e) {

                        }

                    }, this);

                    //- decorate results
                    r.total = ct_when(r, function (results) {
                        return results ? results.total : 0;
                    });

                    return QueryResults(r);

                },

                _convertQuery: function (query, options) {

                    var targetQuery = {};
                    var opts = d_lang.clone(options) || {};

                    var ast = SpatialQuery.parse(query, opts).ast;
                    var walker = ast.walker();

                    if (walker.isROOT() && !walker.toFirstChild()) {
                        // no query (or) query for all features
                    } else {

                        this._convertComplexQuery(targetQuery, walker);

                    }

                    this._convertOptions(opts);

                    targetQuery = d_lang.mixin(opts, targetQuery);

                    return targetQuery;

                },

                onUpdateStart: function (evt) {
                    if(document.bart_gipodParameterWidget){
                        document.bart_gipodParameterWidget._workers++;
                        if (document.bart_gipodParameterWidget._workers > 0) {
                            //document.bart_gipodParameterWidget.showMessage("loading","ik verwerk nog "+ document.bart_gipodParameterWidget._workers + " verzoek(en)");
                            document.bart_gipodParameterWidget.showMessage("loading","zoekresultaten ophalen");
                        }
                        
                        
                    }
                },
                onUpdateEnd: function (evt) {
                    if(document.bart_gipodParameterWidget){
                        document.bart_gipodParameterWidget._workers--;
                        if (document.bart_gipodParameterWidget._workers > 0) {
                            //document.bart_gipodParameterWidget.showMessage("loading","ik verwerk nog "+ document.bart_gipodParameterWidget._workers + " verzoek(en)");
                            document.bart_gipodParameterWidget.showMessage("loading","zoekresultaten ophalen");
                        }else
                            if(document.bart_gipodParameterWidget._workers <= 0)
                                document.bart_gipodParameterWidget.hideMessage();
                        if (document.bart_gipodParameterWidget._workers < 0)
                            document.bart_gipodParameterWidget._workers = 0
                    }
                },

                _convertOptions: function (options) {

                    for (var k in options) {

                        //only check for special cases and apply changes
                        switch (k) {
                            case "crs":
                                options[k] = "EPSG" + options[k];
                                break;
                            case "startdate":
                                if (!options[k].length) {
                                    options[k] = d_date.format(options[k], {
                                        selector: "date",
                                        datePattern: this._dateFormat
                                    });
                                }
                                break;
                            case "enddate":
                                if (options[k] && !options[k].length) {
                                    options[k] = d_date.format(options[k], {
                                        selector: "date",
                                        datePattern: this._dateFormat
                                    });
                                }
                                break;
                            case "geometry":
                                delete options[k];
                                break;
                            case "eventType":
                                delete options[k];
                                break;
                            case "resolution":
                                delete options[k];
                                break;
                            case "rest":
                                delete options[k];
                                break;
                            case "currentScale":
                                delete options[k];
                                break;
                        }

                    }

                },

                _convertComplexQuery: function (targetQuery, walker) {

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
                    if (walker.hasChildren() && ( walker.current.o === "$and" || walker.current.o === "$or")) {
                        // query has $and and one of it childs maybe an geometry query
                        walker.toFirstChild();
                        this._convertComplexQuery(targetQuery, walker);
                        while (walker.toNextSibling()) {
                            this._convertComplexQuery(targetQuery, walker);

                        }
                        return true;
                    }
                    return false;
                },

                _addQueryOperator: function (targetQuery, walker) {

                    var astNode = walker.current;
                    var rel = astNode.o.substring(1);
                    var attr = astNode.n;

                    if (attr && (rel === "eqw" || rel === "eq")) {

                        targetQuery[attr] = astNode.v;
                        return true;

                    }

                    return false;

                },

                _addSpatialOperator: function (targetQuery, walker) {

                    var astNode = walker.current;
                    var spatialRel = astNode.o.substring(1);

                    if (spatialRel === "envelopeintersects") {

                        var geom = astNode.v;
                        if (geom.type === "extent" && astNode.n == "geometry") {
                            targetQuery.bbox = geom.xmin + "," + geom.ymin + "|" + geom.xmax + "," + geom.ymax;
                        } else {
                            throw new Error("We only support geometry type extent for 'bbox' queries");
                        }
                        return true;

                    } else if (spatialRel === "intersects") {
                        var geom = astNode.v;
                        if (geom.type === "point" && astNode.n == "geometry") {
                            targetQuery.point = geom.x + "," + geom.y;
                        } else {
                            throw new Error("We only support geometry type point for 'intersects' queries");
                        }
                        return true;
                    }
                    return false;
                }
            }
        )
    }
);