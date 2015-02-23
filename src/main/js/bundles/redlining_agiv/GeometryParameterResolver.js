define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/Deferred",
        "dojo/_base/json",
        "dojo/_base/array",
        "base/util/GraphicsRenderer",
        "ct/mapping/geometry",
        "ct/Exception",
        "esri/symbols/jsonUtils",
        "esri/geometry/jsonUtils",
        "esri/graphic",
        "."
    ],
    function (
        d_lang,
        declare,
        Deferred,
        d_json,
        d_array,
        GraphicsRenderer,
        ct_geometry,
        Exception,
        e_symbolUtils,
        e_geometryUtils,
        Graphic,
        _moduleRoot
        ) {
        /*
         * COPYRIGHT 2010-2011 con terra GmbH Germany
         */
        return _moduleRoot.GeometryParameterResolver = declare([],
            /**
             * @lends ct.bundles.map.GeometryParameterResolver.prototype
             */
            {


                drawingNodeId: "drawingtoolsetNode",

                _pattern: /drawingtoolsetNode[0-9]/,

                /**
                 *De- and encodes necessary parameters of the mapstate for URL generation
                 * @constructs
                 */
                constructor: function () {

                },

                activate: function () {
                    console.debug("agiv.bundles.drawing_agiv.GeometryParameterResolver.activate");
                    if (!this._coordinateTransformer) {
                        console.warn("GeometryParameterResolver.activate: reference '_coordinateTransformer' not bound, coordinate transformation not possible!");
                        // register dummy transformer
                        this._coordinateTransformer = {
                            transform: function (ex) {
                                return ex;
                            }
                        };
                    }
                },

                deactivate: function () {
                    console.debug("agiv.bundles.drawing_agiv.GeometryParameterResolver.deactivate");
                },

                persist: function (opts) {
                    return this.encodeURLParameter(opts);
                },

                read: function (obj) {
                    return this.decodeURLParameter(obj);
                },

                encodeURLParameter: function () {
                    var tmp = {};
                    var tmpArray = [];
                    var drawingTmp = this._mapModel.getGlassPaneLayer().children;
                    d_array.forEach(drawingTmp, function (node) {
                        if (node.get("id").match(this._pattern)) {
                            if (node && node.graphics && node.graphics.length > 0) {
                                //we know we just have one graphic here!
                                tmpArray[tmpArray.length] = d_lang.mixin(this._encodeGraphics(node.graphics,
                                        node.title),
                                    {
                                        id: node.id
                                    });
                            }
                        }
                    }, this);
                    tmpArray.reverse();
                    tmp.drawing = d_json.toJson(tmpArray);
                    return tmp;
                },

                _encodeGraphics: function (
                    graphics,
                    title
                    ) {
                    //we know we just have one graphic here!
                    var graphic = graphics[0];
                    var geometry = graphic.geometry.toJson();
                    delete geometry.spatialReference;
                    geometry.spatialReference = {
                        wkid: graphic.geometry.spatialReference.wkid
                    };
                    var obj = {
                        "geometry": geometry,
                        "symbol": graphic.symbol.toJson()
                    };
                    if (obj.symbol.text) {
                        obj.text = obj.symbol.text;
                    }
                    if (graphic.attributes) {
                        obj.attributes = graphic.attributes;
                        obj.title = graphic.attributes.comment || title;
                    }

                    return obj;
                },

                _isEsriMapLoaded: function () {
                    var def = new Deferred();
                    //wait for map since most of the params refer to it
                    Deferred.when(this._map.get("esriMapReference").waitForEsriMapLoad(),
                        d_lang.hitch(this,
                            function (success) {
                                if (success) {
                                    def.callback();
                                } else {
                                    def.reject();
                                }
                            }));
                    return def;
                },

                _decodeGraphics: function (thingWithGeometry) {

                    if (thingWithGeometry.symbol) {
                        thingWithGeometry.symbol = e_symbolUtils.fromJson(thingWithGeometry.symbol);
                    }
                    thingWithGeometry.geometry = e_geometryUtils.fromJson(thingWithGeometry.geometry);
                    return thingWithGeometry;

                },

                decodeURLParameter: function (url) {
                    Deferred.when(this._isEsriMapLoaded(),
                        d_lang.hitch(this, function () {
                            var graphicsNodes = url && url.drawing && d_json.fromJson(url.drawing);
                            var dataAdded = false;
                            var exception = null;
                            try {
                                if (graphicsNodes && graphicsNodes !== undefined && graphicsNodes.length && graphicsNodes.length > 0) {
                                    d_array.forEach(graphicsNodes,
                                        function (graphic) {

                                            var thingWithGeometry = this._decodeGraphics(graphic);

                                            this._renderer.renderGeometry(thingWithGeometry,
                                                {},
                                                graphic.id);

                                        },
                                        this);
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
                }
            });
    });