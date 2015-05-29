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
        "base/mapping/MappingResourceUtils",
        "base/util/CommonID"
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
        MappingResourceUtils,
        commonID
        ) {
        return declare([],
            {
                _operationalNodeName: "__operationallayer__",
                decodeableProperty: "son",

                _poiNode: "my poi", // see POISelectionHandler

                constructor: function () {
                },

                activate: function () {
                    this._mrFactory = new MappingResourceFactory();
                    this.insertionNode = this._mapModel.getNodeById(this._operationalNodeName);
                    this.decodeableProperty = this._properties.decodeableProperty !== undefined ? this._properties.decodeableProperty : this.decodeableProperty;
                },

                _disableChildNodes: function (node) {
                    node.set("enabled", false);
                    d_array.forEach(node.get("children"), this._disableChildNodes, this);
                },

                _findAndSelectChildren: function (
                    mainNode,
                    enabledNodeIds
                    ) {
                    mainNode.visit(true, null, function (node) {
                        node.set("enabled", d_array.indexOf(enabledNodeIds, node.get("id")) > -1);
                        // enable the sibling layers
                        var parent = node.get("parent");
                        if (parent.get("service") && d_array.indexOf(enabledNodeIds, parent.id) > -1) {
                            d_array.forEach(parent.children, function (child) {
                                if (!child.get("enabled")) {
                                    child.set("enabled", true);
                                }
                            });
                        }
                    }, this);
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

                persist: function (opts) {
                    return this.encodeURLParameter(opts);
                },

                read: function (obj) {
                    return this.decodeURLParameter(obj);
                },

                encodeURLParameter: function (opts) {
                    opts = opts || {};
                    var tmp = {};
                    var tmpArray = [];
                    var sonTmp = this._mapModel.getOperationalLayer().children;
                    d_array.forEach(sonTmp, function (node) {
                        var id = node.get("id");
                        var title = node.get("title") || "";
                        var renderPriority = node.get("renderPriority") || 0;
                        var opacity = node.get("opacity");
                        var enabled = node.enabled;
                        if (opts.addLayerMetadata || (node.added && node.added === true) || (node.children[0] && node.children[0].get("title") === this._poiNode)) {
                            var child = node.children[0];
                            var tmp = {
                                id: id,
                                title: title,
                                renderPriority: renderPriority,
                                opacity: opacity,
                                url: node.service.serviceUrl,
                                type: node.service.serviceType,
                                enabled: enabled,
                                options: node.service.options
                            };
                            if (child) {
                                tmp.layers = [
                                    {
                                        id: child.get("id"),
                                        title: child.get("title")
                                    }
                                ];
                                if (child.get("title") === this._poiNode) {
                                    if (child.layer && child.layer.poiID) {
                                        tmp.poiID = child.layer.poiID
                                    }
                                }
                            } else {
                                tmp.layers = [];
                            }

                            tmpArray[tmpArray.length] = tmp;
                        } else if (!node.added) {
                            var tmp = {
                                id: id,
                                title: title,
                                renderPriority: renderPriority,
                                opacity: opacity,
                                enabled: enabled
                            };
                            if (node.children[0]) {
                                tmp["layers"] = [
                                    {
                                        id: node.children[0].get("id"),
                                        title: node.children[0].get("title")
                                    }
                                ];
                            }
                            tmpArray[tmpArray.length] = tmp;
                        }
                    }, this);
                    if (this.decodeableProperty) {
                        tmp[this.decodeableProperty] = JSON.stringify(tmpArray);
                    }

                    var enabledBaseLayer = ct_array.arraySearchFirst(this._mapModel.getBaseLayer().children,
                        {enabled: true});
                    if (enabledBaseLayer) {
                        tmp.sbn = enabledBaseLayer.id;
                    }

                    return tmp;
                },

                decodeURLParameter: function (urlObject,basemapswitcher) {
                    Deferred.when(this._isEsriMapLoaded(), d_lang.hitch(this, function () {
                        var selectedOperationalNodes = urlObject && urlObject[this.decodeableProperty] && JSON.parse(urlObject[this.decodeableProperty]);
                        var fire = false;
                        var dataAdded = false;
                        var exception = null;

                        try {
                            if (selectedOperationalNodes && selectedOperationalNodes !== undefined && selectedOperationalNodes.length && selectedOperationalNodes.length > 0) {
                                var nodeIds = [this._operationalNodeName];
                                d_array.forEach(selectedOperationalNodes, function (node) {

                                    if (node.url && node.type && node.url) {
                                        //we need to check for / in id´s
                                        if (node.id.indexOf("/") > -1) {
                                            node.id = node.id.split("/")[node.id.split("/").length - 1];
                                        }
                                        node.id = commonID.get(node.id);
                                        var lid = node.layers && node.layers[0] && node.layers[0].id;
                                        if (lid && lid.indexOf("/") > -1) {
                                            node.layers[0].id = lid.split("/")[lid.split("/").length - 1];
                                        }
//                                        else {
//                                            node.layers = [];
//                                        }

                                        var service = MappingResourceUtils.getServiceResource(this.mrr,
                                            this._mrFactory,
                                            node.url,
                                            node.type,
                                            node.title,
                                            node.options);
                                        var serviceMapModelNode = MappingResourceUtils.addServiceMapModelNode(service,
                                                node.title || node.id || title,
                                            this.insertionNode,
                                            node.id,
                                            node.renderPriority,
                                            node.options);
                                        serviceMapModelNode.set("opacity", node.opacity);
                                        serviceMapModelNode.set("enabled", node.enabled);
                                        var poiProps = {};
                                        if (node.poiID) {
                                            poiProps = {
                                                poiID: node.poiID,
                                                lookupTable: this._properties.poiSearchLookupTable
                                            }
                                        }
                                        serviceMapModelNode.added = true;
                                        if (lid) {
                                            MappingResourceUtils.addLayer(this.mrr, this._mrFactory, service,
                                                node.layers[0], node.type,
                                                serviceMapModelNode, poiProps);
                                        }
                                        dataAdded = true;
                                        fire = true;
                                    } else {
                                        //try our common id if we don´t find the node
                                        var mmNode = this._mapModel.getNodeById(node.id);
                                        if (!mmNode) {
                                            mmNode = commonID.findIdInModel(this._mapModel, node);
                                        }
                                        if (mmNode && !mmNode.length) {
                                            this._applyNodeChanges(mmNode, node);
                                            fire = true;
                                        }
                                    }

                                    if (node.enabled) {
                                        nodeIds.push(node.id);
                                    }
                                    if (node.layers && node.layers.length && node.layers.length > 0) {
                                        nodeIds.push(node.layers[0].id);
                                    }

                                }, this);
                            }
                            var sbn = urlObject.sbn;
                            if (sbn) {
                                var baseLayerChildren = this._mapModel.getBaseLayer().children;
                                if (baseLayerChildren) {
                                    var currentBaseLayer = ct_array.arraySearchFirst(baseLayerChildren,
                                        {enabled: true});
                                    if (currentBaseLayer.id !== sbn) {
                                        var newBl = ct_array.arraySearchFirst(baseLayerChildren,
                                            {id: sbn});
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
                            this._mapModel.fireModelStructureChanged({
                                source: this
                            });
                        }
                        if (fire) {
                            this._mapModel.fireModelNodeStateChanged({
                                source: this
                            });
                        }

                        if (exception) {
                            throw Exception.illegalArgumentError("Could not complete URL parameter parsing",
                                exception);
                        }
                    }));
                },

                _applyNodeChanges: function (
                    mmNode,
                    node
                    ) {
                    mmNode.set("renderPriority", node.renderPriority);
                    mmNode.set("opacity", node.opacity);
                    mmNode.set("enabled", node.enabled);
                },

                deactivate: function () {
                }
            }
        )
    }
);