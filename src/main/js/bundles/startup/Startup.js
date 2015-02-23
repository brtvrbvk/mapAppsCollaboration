define([
        "ct",
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/Deferred",
        "dojo/string",
        "ct/_when",
        "ct/request",
        "esri/geometry/jsonUtils",
        "ct/Stateful",
        "ct/mapping/edit/GraphicsRenderer",
        "ct/mapping/edit/SymbolTableLookupStrategy",
        "."
    ],
    function (
        ct,
        d_lang,
        declare,
        Deferred,
        d_string,
        ct_when,
        ct_request,
        e_geometryUtils,
        Stateful,
        GraphicsRenderer,
        SymbolTableLookupStrategy,
        _moduleRoot
        ) {
        /*
         * COPYRIGHT 2011 con terra GmbH Germany
         */

        return _moduleRoot.Startup = declare(
            [Stateful],
            {
                topics: {
                    UPDATE_START: "ct/startup/UPDATE_START",
                    UPDATE_END: "ct/startup/UPDATE_END"
                },

                constructor: function () {
                },

                encodeURLParameter: function (opts) {
                    // current extent is set as parametrized extent
                    return {
                        municipalityId: ""
                    };
                },

                activate: function () {
                    var props = this._properties || {};
                    var grapicLayerId = props._graphicNodeId || "highlighterPane",
                        symbolTable = props._symbolTable;
                    this._renderer = GraphicsRenderer.createForGraphicsNode(grapicLayerId, this._mapModel);
                    this._renderer.set({
                        symbolLookupStrategy: new SymbolTableLookupStrategy({
                            lookupByGeometryType: true,
                            lookupTable: symbolTable
                        })
                    });
                    if (this._renderer.get("hasNodeCreated")) {
                        this._mapModel.fireModelStructureChanged({
                            source: this
                        });
                    }
                },

                decodeURLParameter: function (parameterObject) {
                    Deferred.when(this._isEsriMapLoaded(), d_lang.hitch(this, function () {
                        var id = parameterObject.municipalityId;
                        if (id && id != "") {
                            var url = this.queryUrl,
                                content = this.query,
                                where = this.query.where;
                            if (!url || !content || !where) {
                                throw ct.Exception.illegalArgumentError("Illegal Parameters for 'url' and/or 'query['where']'.");
                            }
                            var wkid = this._mapState.getSpatialReference().wkid;
                            content["outSR"] = wkid;
                            content["f"] = "json";
                            content["returnGeometry"] = true;
                            content["geometryType"] = this.query.geometryType || "esriGeometryPolygon";
                            content["where"] = d_string.substitute(where, {
                                municipalityId: id
                            });
                            this._broadcast(this.topics.UPDATE_START, {});
                            var d = ct_request.requestJSON({
                                url: url,
                                content: content
                            });

                            ct_when(d, function (res) {
                                if (res.error) {
                                    console.log("Query not successful: " + res);
                                    return;
                                }
                                if (res.features.length > 0) {
                                    var geometry = res.features[0].geometry;
                                    geometry.spatialReference = res.spatialReference;
                                    geometry = e_geometryUtils.fromJson(geometry);
                                    if (geometry.spatialReference._isWebMercator()) {
                                        geometry.spatialReference.wkid = 3857;
                                    }
                                    geometry = this._ct.transform(geometry, wkid);
                                    this._zoomToGeometry(geometry);
                                } else {
                                    this._zoomToGeometry(geometry);
                                }
                                this._broadcast(this.topics.UPDATE_END, {});
                            }, function (err) {
                                console.debug(err);
                                this._broadcast(this.topics.UPDATE_END, {});
                            }, this);
                        }
                    }));
                },

                _broadcast: function (
                    topic,
                    obj
                    ) {
                    if (this._eventService) {
                        this._eventService.postEvent(topic, obj);
                    }
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

                _zoomToGeometry: function (geometry) {
                    this._mapState.setExtent(geometry.getExtent());
                    if (this._renderGeometry) {
                        this._draw(geometry);
                    }
                    this._mapModel.fireModelNodeStateChanged({
                        source: this
                    });
                },

                _draw: function (geometry) {
                    if (!geometry) {
                        console.warn("Startup._draw: no geometry to draw.");
                        return;
                    }
                    this._renderer.clear();
                    this._renderer.draw({
                        geometry: geometry
                    });
                }

            });
    });