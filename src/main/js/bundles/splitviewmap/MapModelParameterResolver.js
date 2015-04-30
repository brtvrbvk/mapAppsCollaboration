/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 02.10.13
 * Time: 09:24
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/_base/Deferred",
        "dojo/json",
        "ct/Exception",
        "ct/array",
        "ct/mapping/mapcontent/MappingResourceFactory",
        "base/mapping/MappingResourceUtils"
    ],
    function (
        declare,
        d_lang,
        d_array,
        Deferred,
        JSON,
        Exception,
        ct_array,
        MappingResourceFactory,
        MappingResourceUtils
        ) {
        return declare([],
            {

                constructor: function () {
                },

                activate: function () {
                },

                encodeURLParameter: function () {
                    var tmp = {};
                    var enabledBaseLayer = ct_array.arraySearchFirst(this._secondMapModel.getBaseLayer().children,
                        {enabled: true});
                    if (enabledBaseLayer) {
                        tmp.histSbn = enabledBaseLayer.id;
                    }
                    return tmp;
                },

                decodeURLParameter: function (urlObject) {
                    var operationalLayers = urlObject && urlObject.son && JSON.parse(urlObject.son);
                    var baseLayer = urlObject && urlObject.histSbn;
                    var dataAdded = false;
                    var fire = false;
                    var exception = null;

                    try {
                        if (operationalLayers && operationalLayers !== undefined && operationalLayers.length && operationalLayers.length > 0) {
                            d_array.forEach(operationalLayers, function (node) {
                                var layer = this._mapModel.getNodeById(node.id);
                                this._secondMapModel.getOperationalLayer().addChild(layer);
                                dataAdded = true;
                            }, this);
                        }
                        if (baseLayer) {
                            var baseLayerChildren = this._secondMapModel.getBaseLayer().children;
                            if (baseLayerChildren) {
                                var currentBaseLayer = ct_array.arraySearchFirst(baseLayerChildren,
                                    {enabled: true});
                                if (currentBaseLayer.id !== baseLayer) {
                                    var newBl = ct_array.arraySearchFirst(baseLayerChildren,
                                        {id: baseLayer});
                                    if (newBl) {
                                        newBl.enabled = true;
                                        currentBaseLayer.enabled = false;
                                        fire = true;
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        exception = e;
                    }

                    if (dataAdded) {
                        this._secondMapModel.fireModelStructureChanged({
                            source: this
                        });
                    }
                    if (fire) {
                        this._secondMapModel.fireModelNodeStateChanged({
                            source: this
                        });
                    }
                    if (exception) {
                        throw Exception.illegalArgumentError("Could not complete URL parameter parsing",
                            exception);
                    }
                },

                deactivate: function () {
                }
            }
        )
    }
);