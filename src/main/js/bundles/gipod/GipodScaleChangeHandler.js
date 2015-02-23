/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by tfu on 07.07.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "ct/Stateful",
        "ct/_Connect",
        "ct/_when",
        "ct/request",
        "dojo/Deferred",
        "dojo/DeferredList",
        "ct/mapping/edit/GraphicsRenderer",
        "base/mapping/graphics/StoreLookupGraphicResolver",
        "./GipodSymbolLookupStrategy"
    ],
    function (
        declare,
        d_lang,
        d_array,
        Stateful,
        Connect,
        ct_when,
        ct_request,
        Deferred,
        DeferredList,
        GraphicsRenderer,
        StoreLookupGraphicResolver,
        GipodSymbolLookupStrategy
        ) {
        return declare([
                Stateful,
                Connect
            ],
            {
                constructor: function () {
                },

                activate: function () {
                    var graphicLayerId = this._graphicNodeId || "highlighterPane";
                    this._manifestationRenderer = GraphicsRenderer.createForGraphicsNode(graphicLayerId + "_man",
                        this.mapModel);
                    this._workassignmentRenderer = GraphicsRenderer.createForGraphicsNode(graphicLayerId + "_work",
                        this.mapModel);
                    this._resolver = new StoreLookupGraphicResolver({
                        symbolLookupStrategy: new GipodSymbolLookupStrategy({
                            lookupAttributeName: "gipodType",
                            lookupTable: this.lookupTable
                        })
                    });
                },

                setManifestationStore: function (store) {
                    this._connectStore(store, "_manifestationStore", "_manifestationRenderer");
                },
                unsetManifestationStore: function () {
                    this._disconnectStore("_manifestationStore", "_manifestationRenderer");
                },
                setWorkassignmentStore: function (store) {
                    this._connectStore(store, "_workassignmentStore", "_workassignmentRenderer");
                },
                unsetWorkassignmentStore: function () {
                    this._disconnectStore("_workassignmentStore", "_workassignmentRenderer");
                },

                _connectStore: function (
                    store,
                    storeName,
                    rendererName
                    ) {

                    this[storeName] = store;

                    this.connect(storeName, this[storeName], "onUpdateEnd", function (args) {
                        this._renderGeometry(args, this[storeName], this[rendererName]);
                    });

                },

                _disconnectStore: function (
                    storeName,
                    rendererName
                    ) {

                    this.disconnect(storeName);
                    this[storeName] = null;
                    this[rendererName].clear();

                },

                _getDetailInfo: function (result) {
                    var features = [];
                    d_array.forEach(result, function (obj) {
                        var d = new Deferred();
                        if (!obj.isCluster && obj.items[0].detail) {
                            ct_when(ct_request.requestJSON({
                                    url: obj.items[0].detail
                                }),
                                function (res) {
                                    res = d_lang.mixin(res, obj);
                                    d.resolve(res);
                                }, function (err) {
                                    d.resolve({error: err});
                                }, this);
                        } else {
                            d.reject();
                        }
                        features.push(d);
                    }, this);
                    return new DeferredList(features);
                },

                _renderGeometry: function (
                    result,
                    store,
                    renderer
                    ) {
                    if (result && this._isVisible(renderer)) {
                        ct_when(this._getDetailInfo(result), function (features) {
                            renderer.clear();
                            d_array.forEach(features, function (feature) {
                                if (feature[0]) {
                                    var item = feature[1];
                                    var geom = store._parseGeometry(item.location.geometry);
                                    var thingWithGeometry = {
                                        geometry: d_lang.isArray(geom) ? geom[0] : geom,
                                        attributes: item
                                    };
                                    var context = {
                                        count: 1,
                                        store: store,
                                        storeId: store.id,
                                        serviceType: "GIPOD",
                                        gipodType: item.gipodType
                                    };
                                    var graphic = this._createGraphic(thingWithGeometry, context);
                                    renderer.draw(graphic);
                                }
                            }, this);
                        }, this);
                    }
                },

                _isVisible: function (renderer) {
                    var lod = this.mapState.getLOD();
                    var isOnRenderZoomScale = Math.round(lod.scale) <= this.geometryZoomScale;
                    if (!isOnRenderZoomScale && renderer) {
                        renderer.clear();
                        return false;
                    } else {
                        return true;
                    }
                },

                _createGraphic: function (
                    thingWithGeometry,
                    context
                    ) {
                    return this._resolver._createGraphic(thingWithGeometry, context);
                },

                deactivate: function () {
                    this.disconnect();
                    this._workassignmentRenderer.clear();
                    this._manifestationRenderer.clear();
                    this._workassignmentRenderer = null;
                    this._manifestationRenderer = null;
                }

            }
        );
    }
);