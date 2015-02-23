define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/Exception",
        "ct/store/SpatialQuery",
        "dojo/store/util/QueryResults",
        "dojo/_base/Deferred",
        "ct/_lang",
        "ct/_when",
        "ct/array",
        "ct/mapping/geometry"
    ],
    function (
        declare,
        d_array,
        Exception,
        SpatialQuery,
        QueryResults,
        Deferred,
        ct_lang,
        ct_when,
        ct_array,
        ct_geometry
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */
        /**
         * @fileOverview This file provides the means to perform feature info requests for WMS services.
         */
        return declare([],
            /**
             * @lends ct.bundles.featureinfo.WMSFeatureInfoStore.prototype
             */
            {
                id: null,
                /**
                 * QUERY_LAYERS
                 */
                queryLayers: null,

                idProperty: "ctID",

                supportedSpatialOperators: {
                    "$envelopeintersects": true,
                    "$intersects": true,
                    "$contains": true,
                    "$within": true
                },

                _mapState: null,

                constructor: function (
                    graphics,
                    mapState,
                    pointTolerance
                    ) {
                    this._mapState = mapState;
                    this.pointTolerance = pointTolerance;
                    this.graphics = graphics;
                    this.idCounter = 0;
                },

                query: function (
                    query,
                    queryOptions
                    ) {
                    var geom = this._getGeometryFromQuery(query,
                        queryOptions);

                    var d = new Deferred();
                    //WORKAROUND FOR FEATUREINFO WINDOW RESIZE
                    setTimeout(function () {
                        d.resolve(true);
                    }, 500);
                    return new QueryResults(ct_when(d,
                        function () {
                            var results = [];
                            d_array.forEach(this.graphics,
                                function (graphic) {
                                    var geometry = graphic.geometry;
                                    if (geometry.type && geometry.type === "point") {
                                        geometry = this._calcExtentWithPixelTolerance(graphic.geometry,
                                            this.pointTolerance);
                                    }
                                    if (geom.intersects(geometry)) {
                                        var item = this._processItem(graphic);
                                        results.push(item);
                                    }
                                },
                                this);
                            return results;
                        },
                        function (error) {
                            return [];
                        }, this));
                },

                _calcExtentWithPixelTolerance: function (
                    geoPoint,
                    clickTolerance
                    ) {
                    var viewport = this._mapState.getViewPort();
                    return viewport.toGeo(ct_geometry.createExtent({
                        center: viewport.screen.getCenter(),
                        width: clickTolerance,
                        height: clickTolerance
                    })).centerAt(geoPoint);
                },

                _processItem: function (graphic) {
                    var obj = {};
                    ct_lang.forEachProp(graphic.attributes,
                        function (
                            value,
                            name
                            ) {
                            obj[name] = value.toString();
                            this._addFieldToMetadata(name);
                        }, this);
                    obj[this.idProperty] = this.idCounter++ + "";
                    return obj;
                },

                get: function () {
                },

                getIdProperty: function () {
                    return this.idProperty;
                },

                getIdentity: function (object) {
                    return object[this.idProperty];
                },

                _addFieldToMetadata: function (field) {
                    if (!this.metadata || !this.metadata.fields) {
                        this.metadata = {
                            fields: []
                        };
                    }
                    var index = ct_array.arrayFirstIndexOf(this.metadata.fields,
                        {
                            name: field
                        });
                    if (index > -1) {
                        return;
                    }
                    var newField = {
                        name: field,
                        length: 10,
                        title: field,
                        type: "string"
                    };
                    this.metadata.fields.push(newField);
                },

                getMetadata: function () {
                    return this.metadata;
                },

                _getGeometryFromQuery: function (
                    query,
                    options
                    ) {
                    var ast = SpatialQuery.parse(query,
                        options).ast;
                    var walker = ast.walker();
                    if (!walker.toFirstChild()) {
                        // no query (or) query for all features
                        throw Exception.illegalArgumentError("WMSFeatureInfoStore: empty query is not supported!");
                    }
                    var astNode = walker.current;
                    var spatialOperator = astNode.o;
                    if (!this.supportedSpatialOperators[spatialOperator]) {
                        throw Exception.illegalArgumentError("WMSFeatureInfoStore: a spatial query is required with one of following operators: " + this.supportedSpatialOperators);
                    }
                    return astNode.v;
                },

                setQueryLayers: function (layerNames) {
                    this.queryLayers = layerNames;
                }

            });
    });