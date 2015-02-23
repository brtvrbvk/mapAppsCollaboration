define([
        "dojo",
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/Deferred",
        "ct/_lang",
        "ct/_when",
        "ct/array",
        "ct/request",
        "ct/Exception",
        "esri/tasks/query",
        "esri/tasks/QueryTask",
        "ct/mapping/geometry",
        "dojo/store/util/QueryResults",
        "ct/store/ComplexQuery",
        "dojo/date/locale"
    ],
    function (
        dojo,
        d_lang,
        declare,
        d_array,
        Deferred,
        ct_lang,
        ct_when,
        ct_array,
        ct_request,
        Exception,
        Query,
        QueryTask,
        geometry,
        QueryResults,
        ComplexQuery,
        locale
        ) {

        var removeSlash = function (url) {
                return url.replace(/\/+$/, "");
            },

            createSpatialReference = geometry.createSpatialReference,

            mergeAttributes = function (g) {
                // used to convert the features provided by the query task, from graphics, back to "normal" objects
                return d_lang.mixin({}, g.attributes || {}, {
                    geometry: g.geometry,
                    symbol: g.symbol,
                    infoTemplate: g.infoTemplate
                });
            },
            buildExpressionForNode = function (
                astNode,
                operator,
                queryOptions
                ) {
                var n = astNode.n;
                var val = astNode.v;
                var t = astNode.vt;
                return buildExpression(n, operator, val, t, queryOptions);
            },
            buildExpression = function (
                name,
                operator,
                value,
                valueType,
                queryOptions
                ) {
                if (queryOptions.ignoreCase && valueType === "string") {
                    value = value.toLowerCase();
                    name = "LOWER(" + name + ")";
                }
                if (valueType === 'string') {
                    value = surroundByQuotes(value);
                }
                return name + operator + value;
            },
            surroundByQuotes = function (s) {
                return "'" + s + "'";
            },
        // NOTE: we currently don't support JOINS (property chains)
            sqlOperatorMapping = {
                "$eq": {
                    toSQL: function (
                        astNode,
                        queryOptions
                        ) {
                        return buildExpressionForNode(astNode, " = ", queryOptions);
                    }
                },
                "$lt": {
                    toSQL: function (
                        astNode,
                        queryOptions
                        ) {
                        return buildExpressionForNode(astNode, " < ", queryOptions);
                    }
                },
                "$lte": {
                    toSQL: function (
                        astNode,
                        queryOptions
                        ) {
                        return buildExpressionForNode(astNode, " <= ", queryOptions);
                    }
                },
                "$gt": {
                    toSQL: function (
                        astNode,
                        queryOptions
                        ) {
                        return buildExpressionForNode(astNode, " > ", queryOptions);
                    }
                },
                "$gte": {
                    toSQL: function (
                        astNode,
                        queryOptions
                        ) {
                        return buildExpressionForNode(astNode, " >= ", queryOptions);
                    }
                },
                "$exists": {
                    toSQL: function (
                        astNode,
                        queryOptions
                        ) {
                        return astNode.n + (astNode.v ? " IS NOT NULL" : " IS NULL");
                    }
                },
                "$or": {
                    toSQL: function (
                        astNode,
                        queryOptions,
                        subExpressions
                        ) {
                        return "(" + subExpressions.join(" OR ") + ")";
                    }
                },
                "$and": {
                    toSQL: function (
                        astNode,
                        queryOptions,
                        subExpressions
                        ) {
                        return "(" + subExpressions.join(" AND ") + ")";
                    }
                },
                "$in": {
                    values: true,
                    toSQL: function (
                        astNode,
                        queryOptions
                        ) {
                        var name = astNode.n;
                        var values = astNode.v;
                        var types = astNode.vt;
                        return name + " IN(" + d_array.map(values, function (
                            v,
                            i
                            ) {
                            return (types[i] === "string") ? surroundByQuotes(v) : v
                        }).join(",") + ")";
                    }
                },
                "$not": {
                    toSQL: function (
                        astNode,
                        queryOptions,
                        subExpressions
                        ) {
                        // TODO: check NOT for correct syntax
                        return "(NOT " + subExpressions + ")"
                    }
                },
                "$eqw": {
                    toSQL: function (
                        astNode,
                        queryOptions
                        ) {
                        var value = astNode.v;
                        // replace wild card operators by db equivalents
                        value = value.replace(/_/, "?").replace(/\*/g, "%");
                        return buildExpression(astNode.n, " like ", value, astNode.vt, queryOptions);
                    }
                },
                "$suggest": {
                    toSQL: function (
                        astNode,
                        queryOptions
                        ) {
                        // $suggest is looking if target property starts with the given string
                        // but allways ignore case
                        var prefix = queryOptions.suggestContains ? "%" : "";
                        return buildExpression(astNode.n, " like ", prefix + astNode.v + "%", astNode.vt,
                            d_lang.delegate(queryOptions, {
                                ignoreCase: true
                            }));
                    }
                }
            };

        return declare(
            [],
            /**
             * @lends ct.mapping.store.MapServerLayerStore.prototype
             */
            {
                /**
                 * the target url pointing to the query layer, e.g.:
                 * http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/9
                 */
                target: "",
                /**
                 * Indicates the property to use as the identity property. The values of this
                 * property should be unique.
                 */
                idProperty: "OBJECTID",
                /**
                 * the inner query task used to executed the queries against the ags.
                 * @private
                 */
                queryTask: null,
                /**
                 * This store provides the dojo.store interface implemented over the MapServerQueryStore interface.
                 * @constructs
                 */
                constructor: function (options) {
                    d_lang.mixin(this, options);
                    this.target = removeSlash(this.target);
                    this.queryTask = new QueryTask(this.target);
                    this.queryTaskMuni = new QueryTask(this.municipalityUrl);
                },
                /**
                 * Retrieves an object by its identity.
                 * @param {String|Number} id The identity to use to lookup the object
                 * @param {Object} options options to manipulate the request.
                 * @return {Object} The object in the store that matches the given id.
                 */
                get: function (
                    id,
                    options
                    ) {
                    var query = {};
                    query[this.idProperty] = {
                        $in: [id]
                    };
                    return ct_when(this.query(query, options), function (features) {
                        return features[0];
                    });
                },

                /**
                 * Returns an object's identity
                 */
                getIdentity: function (object) {
                    return object[this.idProperty];
                },

                query: function (
                    query,
                    options
                    ) {
                    // TODO: how to handle paging?
                    d_lang.mixin(options, {
                        fields: this.outFields
                    });
                    var taskQuery = this._toTaskQuery(query, options || {});
                    var r;
                    var mapSRS = taskQuery.outSpatialReference;
                    var ensureSRSCode = mapSRS && mapSRS.wkid === 3857 ? this.correctSRSCode : undefined;
                    var results = this.queryTask.execute(taskQuery,
                        function (featureset) {
                            // Some server might return features with 102100 SRS code (this is an esri specification).
                            // As this code became the EPSG:3857 code, there are two codes with the same definition.
                            if (ensureSRSCode) {
                                ensureSRSCode(featureset, mapSRS.wkid);
                            }

                            var results = featureset.features;
                            var total = results.length;
                            // paginate the results (is only pseudo pagination, because the result is limited by the server)
                            if (options && (options.start || options.count)) {
                                results = results.slice(options.start || 0,
                                        (options.start || 0) + (options.count || Infinity));
                            }
                            results = d_array.map(results, mergeAttributes);
                            results.total = total;
                            r.resolve(results);
                        },
                        function (e) {
                            r.reject(e);
                        });
                    var muniOpts = d_lang.clone(options);
                    muniOpts.fields = this.muniFields;
                    var muniQuery = this._toTaskQuery(query, muniOpts || {}),
                        m,
                        muniResult = this.queryTaskMuni.execute(muniQuery,
                            function (featureset) {
                                // Some server might return features with 102100 SRS code (this is an esri specification).
                                // As this code became the EPSG:3857 code, there are two codes with the same definition.
                                if (ensureSRSCode) {
                                    ensureSRSCode(featureset, mapSRS.wkid);
                                }

                                var results = featureset.features;
                                var total = results.length;
                                // paginate the results (is only pseudo pagination, because the result is limited by the server)
                                if (options && (options.start || options.count)) {
                                    results = results.slice(options.start || 0,
                                            (options.start || 0) + (options.count || Infinity));
                                }
                                results = d_array.map(results, mergeAttributes);
                                results.total = total;
                                m.resolve(results);
                            },
                            function (e) {
                                m.reject(e);
                            });
                    m = new Deferred(function () {
                        muniResult.cancel();
                    });

                    // here we use an own deferred, to ensure correct cancelation
                    r = new Deferred(function () {
                        results.cancel();
                    });
                    // total will contain the full result count
                    //                r.total = ct.when(r, function(results){
                    //                    return results.total;
                    //                });

                    var dl = new dojo.DeferredList([
                        r,
                        m
                    ]);

                    var delayedDeferred = new Deferred();
                    ct_when(dl, function (resp) {
                        var data = [],
                            muniFields = this.muniFields;
                        d_array.forEach(resp, function (
                            response,
                            idx
                            ) {
                            if (response[0]) {
                                var features = response[1];
                                if (idx === 0) {
                                    data = features;
                                } else {
                                    data = d_array.map(data, function (f) {
                                        d_array.forEach(features, function (feat) {
                                            var key;
                                            for (key in muniFields) {
                                                f[key] = feat[key];
                                            }
                                        });
                                        return f;
                                    });
                                }
                            }
                        });

                        //apply new fieldmappings
                        data = d_array.map(data, function (
                            item,
                            idx
                            ) {
                            var k;
                            for (k in this.fieldMappings) {
                                if (item[k]) {
                                    var t = item[k],
                                        temp = this.fieldMappings[k];
                                    item[temp] = t;
                                    delete item[k];
                                    if (ct_array.arrayFirstIndexOf(this.dateOutFields, temp) > -1) {
                                        item[temp] = locale.format(new Date(item[temp]), {
                                            datePattern: this.dateFormatter,
                                            selector: "date"
                                        });
                                    }
                                }
                            }
                            item[this.idProperty] = idx + 1 + "";

                            return item;
                        }, this);

                        delayedDeferred.resolve(data);
                    }, function (err) {
                        delayedDeferred.reject(err);
                    }, this);

                    delayedDeferred.total = ct_when(delayedDeferred, function (results) {
                        return results.total;
                    });

                    return QueryResults(delayedDeferred);
                },

                correctSRSCode: function (
                    featureset,
                    newCode
                    ) {
                    if (featureset.spatialReference && featureset.spatialReference.wkid !== newCode) {
                        featureset.spatialReference.wkid = newCode;
                        d_array.forEach(featureset.features, function (item) {
                            var geom = item.geometry;
                            if (geom) {
                                geom.spatialReference.wkid = newCode;
                            }
                        });
                    }
                },

                // current implementation ignores the object, but gets metadata of the layer
                getMetadata: function (object) {
                    // object is ignored.
                    return this._metadata || this._metadataReq || (this._metadataReq = ct_when(ct_request.requestJSON({
                            url: this.target,
                            content: {
                                f: 'json'
                            },
                            callbackParamName: "callback"
                        }),
                        function (metadata) {
                            delete this._metadataReq;
                            return (this._metadata = this._parseMetaData(metadata));
                        }, function (err) {
                            delete this._metadataReq;
                            return err;
                        }, this));
                },
                _parseMetaData: function (metadata) {
                    // here we prepare the layer info response to match the criteria of ComplexQuery Definitions
                    // most definitions are the same, like "description","extent"
                    metadata.title = metadata.name || "";
                    d_array.forEach(metadata.fields, function (f) {
                        // convert esri field definition like:
                        /*{ "name" : "LAND_NAME",
                         "type" : "esriFieldTypeString",
                         "alias" : "LAND_NAME",
                         "length" : 25}*/
                        // to ComplexQuery definition:
                        /*{ "name" : "LAND_NAME",
                         "type" : "string",
                         "title" : "LAND_NAME",
                         "length" : 25}*/
                        f.title = f.alias;
                        f.type = f.type.replace("esriFieldType", "").toLowerCase();
                        switch (f.type) {
                            case "double" :
                                f.type = "number";
                                f.precision = "double";
                                break;
                            case "float" :
                                f.type = "number";
                                f.precision = "float";
                                break;
                            case "smallinteger" :
                                f.type = "number";
                                f.precision = "smallinteger";
                                break;
                            case "biginteger" :
                                f.type = "number";
                                f.precision = "biginteger";
                                break;
                            case "oid" :
                                f.type = "number";
                                f.precision = "biginteger";
                                f.identifier = true;
                                break;
                        }
                    });
                    return metadata;
                },
                _toTaskQuery: function (
                    query,
                    options
                    ) {
                    var taskQuery = new Query();
                    //direct 'objectIds' support? currently automatically converted to "IN ( ... )" where clause
                    this._convertQuery(taskQuery, query, options);

                    // now check options
                    // convert { sort: [{attribute: "name", descending:false}] option
                    taskQuery.orderByFields = this._convertToSort(options.sort);
                    // convert field option { fieldA : 1, fieldB :1}
                    var fields = options.fields || {};
                    taskQuery.outFields = this._convertToOutFields(fields);
                    taskQuery.returnGeometry = fields.geometry ? true : false;
                    // convert "geometry" option flags
                    var geomQueryOptions = options.geometry || {};
                    var sr = geomQueryOptions.sr;
                    if (sr) {
                        taskQuery.outSpatialReference = createSpatialReference(sr);
                    }
                    taskQuery.maxAllowableOffset = geomQueryOptions.maxAllowableOffset || undefined;
                    return taskQuery;
                },
                _convertToSort: function (sort) {
                    if (sort && sort.length) {
                        return d_array.map(sort, function (sortDef) {
                            return sortDef.attribute + (sortDef.descending ? " DESC" : " ASC");
                        });
                    }
                    return [];
                },
                /**
                 * converts { fieldname : 1, fieldname2:1 } to [fieldname,fieldname2].
                 * It also ensures that the idProperty (OBJECTID) is allways requested.
                 * The support for {fieldname : 0) is only implemented for "geometry".
            */
                _convertToOutFields: function (fields) {
                    var required = [];
                    var idProperty = this.idProperty;
                    ct_lang.forEachProp(fields, function (
                        allowed,
                        fieldName
                        ) {
                        if (allowed && fieldName !== "geometry") {
                            required.push(fieldName);
                        }
                    });
                    if (!required.length) {
                        return ['']
                    }
                    if (!fields[idProperty]) {
                        required.push(idProperty)
                    }
                    return required;
                },
                _convertQuery: function (
                    taskQuery,
                    query,
                    options
                    ) {
                    // see specification of ComplexQueries!

                    var ast = ComplexQuery.parse(query, options).ast;
                    var walker = ast.walker();
                    // check first for a spatial operator
                    this._convertToSpatialQuery(taskQuery, walker);
                    // check if no ast is defined
                    ast.optimize();
                    walker = ast.walker();
                    // now check if any
                    // where clause is needed
                    if (taskQuery.geometry && !walker.toFirstChild()) {
                        // don't add AllFeaturesQuery if spatial query was present
                        return;
                    }
                    this._convertToWhere(taskQuery, walker);
                },
                _convertToWhere: function (
                    taskQuery,
                    walker
                    ) {
                    taskQuery.where = this._astToSQL(walker);
                },
                //"looking for all features", here we use a trick asking for all feautes with a feature id > -1
                _getAllFeaturesQuery: function () {
                    return this.idProperty + " > -1";
                },
                _astToSQL: function (walker) {
                    if (!walker.toFirstChild()) {
                        return this._getAllFeaturesQuery();
                    }
                    // now travers the ast
                    var subExpressionStack = [
                        []
                    ];
                    var sqlOps = sqlOperatorMapping;
                    var ops = ComplexQuery.Parser.prototype.operators;
                    walker.walk(function (
                        node,
                        walker,
                        childIndex,
                        childrenCount
                        ) {
                        var o = ops[node.o];
                        if (childIndex === -1) {
                            // preorder
                            if (o.parent) {
                                subExpressionStack.push([]);
                            }
                        } else if (childIndex === childrenCount) {
                            // post order
                            var sqlOp = sqlOps[node.o];
                            var toSQL = sqlOp && sqlOp.toSQL;
                            if (!toSQL) {
                                console.warn("MapServerQueryStore: Operator <" + node.o + "> can't be translated into SQL! (" + this.target + ")");
                                return;
                            }
                            var subexpression = toSQL(node, walker.queryOptions,
                                subExpressionStack[subExpressionStack.length - 1]);
                            if (o.parent) {
                                subExpressionStack.pop();
                            }
                            if (subexpression) {
                                subExpressionStack[subExpressionStack.length - 1].push(subexpression);
                            }
                        }
                    });
                    return subExpressionStack[0][0];
                },
                _convertToSpatialQuery: function (
                    taskQuery,
                    walker
                    ) {
                    delete taskQuery.spatialRelationship;
                    // here we don't walk, we simple check some cases for geometry
                    // otherwise the query will not be "valid"
                    if (!walker.toFirstChild()) {
                        // no query (or) query for all features
                        return;
                    }
                    if (this._checkSpatialOperator(taskQuery, walker)) {
                        // direct spatial query, without attributes
                        return;
                    }
                    if (walker.hasChildren() && walker.current.o === "$and") {
                        // query has $and and one of it childs maybe an geometry query
                        walker.toFirstChild();
                        while (!this._checkSpatialOperator(taskQuery, walker) && walker.toNextSibling());
                    }
                },
                _checkSpatialOperator: function (
                    taskQuery,
                    walker
                    ) {
                    var astNode = walker.current;
                    var spatialRel = Query["SPATIAL_REL_" + astNode.o.substring(1).toUpperCase()];
                    if (spatialRel) {
                        taskQuery.geometry = astNode.v;
                        taskQuery.spatialRelationship = spatialRel;
                        // remove the $geometry node from the ast
                        walker.toParent();
                        var p = walker.current;
                        var i = d_array.indexOf(p.c, astNode);
                        p.c.splice(i, 1);
                        return true;
                    }
                    return false;
                }
            });
    });