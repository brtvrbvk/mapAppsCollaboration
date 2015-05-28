/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 17.04.2014.
 */
define([
        "dojo/_base/lang",
        "dojo/json",
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/dom-construct",
        "ct/array",
        "ct/request",
        "ct/Stateful",
        "ct/mapping/mapcontent/ServiceTypes",
        "ct/mapping/map/NodeTypes",
        "base/util/Comparator",
        "base/util/CommonID"
    ],
    function (d_lang, JSON, declare, d_array, d_domconstruct, ct_array, ct_request, Stateful, ServiceTypes, NodeTypes, comparator, CommonID) {

        return  declare(
            [Stateful],
            {

                KEY: "legend",
                NAME: "Legende",
                EMPTY_TYPE: [],
                DATAFORM_ELEMENT: [
                    {
                        "type": "checkbox",
                        "label": "Legende",
                        "disabled": true,
                        "field": "print.legend"
                    }
//                ,{
//                    "type":"label",
//                    "value":"Legende"
//                }
                ],
                /**
                 * @constructor
                 */
                constructor: function () {
                },

                activate: function () {

                    this.i18n = this._i18n.get().ui;

                },

                queryVisibleLayers: function (layers) {
                    this.legendChanged = false;
                    var legendItems = [];
                    if (layers && layers.length > 0) {
                        for (var i = 0; i < layers.length; i++) {
                            var opLayer = layers[i],
                                layer,
                                sublayers = opLayer.get("children");
                            if (opLayer.service) {
                                layer = this._createVisibleLayer(opLayer);

                            } else if (sublayers && sublayers.length > 0) {
                                for (var j = 0; j < sublayers.length; j++) {
                                    layer = this._createVisibleLayer(sublayers[j]);
                                }
                            } else {
                                var parent = opLayer.parent;
                                if (parent.service) {
                                    layer = this._createVisibleLayer(parent)
                                }
                            }
                            if (layer) {
                                if (layer.length > 1) {
                                    for (var j = 0; j < layer.length; j++) {
                                        legendItems.push(layer[j]);
                                    }
                                } else if (layer.length == 1) {
                                    legendItems.push(layer[0]);
                                }
                            }
                        }
                    }
                    return legendItems;
                },

                _getLegendMapping: function (mainLayer) {

                    var id = mainLayer.id.split("/")[mainLayer.id.split("/").length - 1];
                    id = CommonID.to(id);
                    var mapping = this.legendUI.getLegendMappingById(id);
                    if (mapping) {
                        if (mapping.type === "pdf") {
                            return {
                                id: mainLayer.id,
                                title: mainLayer.title,
                                link: mapping.legendURL
                            };
                        } else {
                            return {
                                id: mainLayer.id,
                                title: mainLayer.title,
                                url: mapping.legendURL
                            };
                        }
                    }

                },

                _createVisibleLayer: function (layer) {
                    if (!layer.enabled || !layer.visibleInExtent || !layer.visibleInScale) {
                        return null;
                    }
                    var response = [];
                    var mainLayer = this._getMainLayer(layer);
                    if (!mainLayer) {
                        console.error("Found no service for this layer!");
                    }

                    if (mainLayer.service.serviceType === ServiceTypes.POI) {

                        var graphics = mainLayer.layerObject && mainLayer.layerObject.graphics;
                        if (graphics && graphics.length > 0) {
                            //we just need the first graphic for the symbology
                            var symbol = graphics[0].symbol,
                                rgba = symbol.color.toRgba();
                            response.push({
                                type: "poi",
                                id: mainLayer.id,
                                title: mainLayer.title,
                                url: this.applicationUrl + "/resources/icons/generate/circle/20/20/5/" + rgba[0] + "/" + rgba[1] + "/" + rgba[2] + "/" + rgba[3] * 255
                            });
                        }

                    } else if (mainLayer.service.serviceType === ServiceTypes.GIPOD) {
                        var mapping = this._getLegendMapping(mainLayer);
                        if (mapping) {
                            mapping.type = "gipod";
                            response.push(mapping);
                        }
                    }
                    else if (mainLayer.service.serviceType === ServiceTypes.DirectKML) {
                        var esriMap = this.map.esriMap;

                        var esriLayerId = d_array.filter(esriMap.graphicsLayerIds, function (graphicLayerId) {
                            return esriMap.getLayer(graphicLayerId).__managed === mainLayer.id;
                        });
                        var esriLayer = esriMap.getLayer(esriLayerId[0]);
                        layer.layerObject = esriLayer;
                        var symbol = esriLayer.renderer.getSymbol();
                        rgba = symbol.color.toRgba();
                        response.push({
                            type: "directkml",
                            id: mainLayer.id,
                            title: mainLayer.title,
                            url: this.applicationUrl + "/resources/icons/generate/circle/20/20/5/" + rgba[0] + "/" + rgba[1] + "/" + rgba[2] + "/" + rgba[3] * 255
                        });

                    } else if (mainLayer.service.serviceType === ServiceTypes.AGS_DYNAMIC) {
                        var agsLayer = layer.get("children").slice();
                        if (agsLayer.length < 1) {
                            agsLayer.push(layer);
                        }
                        for (var j = 0; j < agsLayer.length; j++) {
                            if (agsLayer[j].enabled) {
                                response.push({
                                    type: "ags",
                                    id: parseInt(agsLayer[j].layer.layerId),
                                    title: agsLayer[j].parent.title,
                                    einh: agsLayer[j].einh,
                                    url: layer.service.serviceUrl
                                });
                            }
                        }
                    }
                    else if (mainLayer.service.serviceType === ServiceTypes.AGS_TILED) {
                        var serviceUrl = mainLayer.service.serviceUrl;
                        var tiledLayer = layer.get("children").slice();
                        if (tiledLayer.length < 1) {
                            tiledLayer.push(layer);
                        }
                        for (var j = 0; j < tiledLayer.length; j++) {
                            if (tiledLayer[j].enabled) {
                                if (tiledLayer[j].enabled && tiledLayer[j].layer) {
                                    var lay = tiledLayer[j];
                                    response.push({
                                        type: "ags",
                                        id: parseInt(lay.layer.layerId),
                                        title: lay.layer.title,
                                        einh: lay.layer.einh,
                                        url: serviceUrl
                                    });
                                }
                            }
                        }
                    }
                    else if (mainLayer.service.serviceType === ServiceTypes.WMTS) {
                        var mapping = this._getLegendMapping(mainLayer);
                        if (mapping) {
                            mapping.type = "wmts";
                            response.push(mapping);
                        }
                    }
                    else if (mainLayer.service.serviceType === ServiceTypes.WMS) {
                        var wmsLayers = layer.get("children").slice();
                        if (wmsLayers.length < 1) {
                            wmsLayers.push(layer);
                        }
                        for (var j = 0; j < wmsLayers.length; j++) {
                            var actWmsLayer = wmsLayers[j];
                            var legendURL = "";
                            if (!actWmsLayer.enabled) {
                                continue;
                            }
                            var styles, title, name, layerId;
                            var actLayer = actWmsLayer.layer || actWmsLayer.children[0].layer;
                            if (actLayer) {
                                title = layer.title;
                                name = actLayer.name;
                                layerId = actLayer.layerId;
                            }
                            if (actWmsLayer.parent.get("styles") && actWmsLayer.get("actualStyle")) {
                                var actStyle = ct_array.arraySearchFirst(actWmsLayer.parent.get("styles"), {
                                    NAME: actWmsLayer.get("actualStyle")
                                });
                                legendURL = actStyle.URL;
                            }
                            else {
                                var actualStyle = actWmsLayer.get("actualStyle");
                                var el = this.map.esriLayerManager.getEsriLayer(mainLayer);
                                var li = el.getLayerInfo(name) || el.getLayerInfo(layerId);
                                if (title && li) {
                                    styles = li.styles;
                                }
                                if (styles) {
                                    legendURL = this._findCorrectURL(styles, actualStyle);
                                    if (!legendURL) {
                                        if (title) {
                                            legendURL = li.legendURL;
                                        }
                                    }
                                }
                            }
                            response.push({
                                type: "wms",
                                id: actWmsLayer.id,
                                title: title,
                                url: legendURL
                            });
                        }
                    }
                    return response;
                },

                _addVisibleLayer: function (layer) {
                    if (layer.service.serviceType === ServiceTypes.AGS_DYNAMIC) {
                        var agsLayer = layer.get("children");
                        for (var j = 0; j < agsLayer.length; j++) {
                            if (agsLayer[j].enabled) {
                                this._visibleLayers.push({
                                    type: "ags",
                                    id: parseInt(agsLayer[j].layer.layerId),
                                    title: agsLayer[j].title,
                                    einh: agsLayer[j].einh,
                                    url: layer.service.serviceUrl
                                });
                            }
                        }
                    }
                    if (layer.service.serviceType === ServiceTypes.WMS) {
                        var wmsLayer = layer.get("children");
                        for (var j = 0; j < wmsLayer.length; j++) {
                            if (wmsLayer[j].enabled) {
                                var styles;
                                var hasStyles = true;
                                var esriLayer;
                                try {
                                    hasStyles = false;
                                    var esrilm = this.map.get("esriLayerManager");
                                    esriLayer = esrilm.getEsriLayer(layer);
                                    if (wmsLayer[j].layer) {
                                        styles = esriLayer.getLayerInfo(wmsLayer[j].layer.layerId,
                                            wmsLayer[j].title).styles;
                                    } else {
                                        styles = esriLayer.getLayerInfo(wmsLayer[j].children[0].layer.layerId,
                                            wmsLayer[j].title).styles;
                                    }
                                } catch (e) {
                                    console.debug("error in getting layerinfo");
                                    continue;
                                }
                                if (esriLayer && esriLayer.sld && esriLayer.sld != "") {
                                    var sldUrl = esriLayer.sld;
                                    var serviceUrl = esriLayer.url;
                                    var layerid = wmsLayer[j].layer.layerId;
                                    var styles = "";
                                    if (esriLayer.actualStyle && esriLayer.actualStyle != "" && !esriLayer.isUMN) {
                                        styles = esriLayer.actualStyle;
                                    }
                                    var url = dojo.replace(this.legendGraphicRequest, {
                                        url: serviceUrl,
                                        styles: styles,
                                        layerid: layerid,
                                        sld: sldUrl
                                    });
                                    this._visibleLayers.push({
                                        type: "sld",
                                        id: wmsLayer[j].id,
                                        url: url
                                    });
                                } else {
                                    var legendURL = this._findCorrectURL(styles, wmsLayer[j].id,
                                        wmsLayer[j].get("actualStyle"), hasStyles);
                                    if (!legendURL) {
                                        return;
                                    }
                                    if (legendURL == "sld" && wmsLayer[j].possibleStyles && wmsLayer[j].possibleStyles.length > 0) {
                                        var style = ct.arraySearchFirst(wmsLayer[j].possibleStyles, {
                                            label: wmsLayer[j].get("actualStyle")
                                        });
                                        if (style && style.url && style.url != "") {
                                            var sldUrl = style.url;
                                            var serviceUrl = wmsLayer[j].parent.service.serviceUrl;
                                            var layerid = wmsLayer[j].layer.layerId;
                                            var url = dojo.replace(this.legendGraphicRequest, {
                                                url: serviceUrl,
                                                layerid: layerid,
                                                sld: sldUrl
                                            });
                                            this._visibleLayers.push({
                                                type: "sld",
                                                id: wmsLayer[j].id,
                                                url: url
                                            });
                                        } else {
                                            //add error statement
                                        }
                                    } else {
                                        this._visibleLayers.push({
                                            type: "wms",
                                            id: wmsLayer[j].id,
                                            url: legendURL
                                        });
                                    }
                                }
                            }
                        }
                    }
                },

                _getMainLayer: function (layer) {
                    if (layer.service) {
                        return layer;
                    } else {
                        if (layer.parent) {
                            return this._getMainLayer(layer.parent);
                        } else {
                            return null;
                        }
                    }
                },

                _findCorrectURL: function (styles, actualStyle) {
                    for (var i = 0; i < styles.length; i++) {
                        if (styles[i].name == actualStyle) {
                            return styles[i].legendURL;

                        }
                    }
                    return styles[0].legendURL;
                },

                getGraphicLegendNodes: function () {

                    var gpNodes = this.mapModel.getGlassPaneLayer().filterNodes(function (node) {
                        if (node.id === "pointer" || node.id.indexOf("IGNORE") > -1) {
                            //don´t print the sync pointer of second map
                            return null;
                        }
                        //get search result and other stuff
                        if (node.nodeType) {
                            if ((node.nodeType.indexOf("SEARCH_RESULT") > -1) ||
                                (node.nodeType.indexOf("RESULT_IDENTIFY") > -1) ||
                                (node.nodeType.indexOf("POLYGON") > -1) ||
                                (node.nodeType.indexOf("TEXT") > -1) ||
                                (node.nodeType.indexOf("POINT") > -1 && node.id !== this._historicPointerNodeId) ||
                                (node.nodeType.indexOf("POLYLINE") > -1)
                                ) {
                                return node;
                            }
                        }
                        return null;
                    }, this);
                    var opNodes = this.mapModel.getOperationalLayer().filterNodes(function (node) {
                        //get pois and gipod
                        if (node.service && (node.service.serviceType === "POI" || node.service.serviceType == "GeoJSON" || node.service.serviceType == "GIPOD" || node.service.serviceType == "DirectKML")) {
                            return node;
                        }
                        return null;
                    }, this);

                    return gpNodes.concat(opNodes);

                },

                readPrintData: function (opts) {
                    return this.createLegendJson();
                },

                createLegendJson: function () {

                    var layers = this.mapModel.getEnabledServiceNodes(this.mapModel.getOperationalLayer());
                    var visibleLayers = this.queryVisibleLayers(layers);

                    var legendItems = {
                        graphicsLegend: [],
                        layersLegend: []
                    };
                    var gotALegend = false;
                    visibleLayers = visibleLayers.reverse();
                    d_array.forEach(visibleLayers, function (layer) {
                        if (layer.type === "wms" || layer.type === "wmts" || layer.type === "gipod") {
                            gotALegend = true;
                            legendItems.layersLegend.push({
                                legendTitle: layer.title,
                                legendImageUrl: !layer.link ? layer.url : null,
                                legendUrl: layer.link ? layer.link : null
                            });
                        }
                    }, this);

                    var items = this.getGraphicLegendNodes();
                    items = ct_array.arraySort(items, comparator.renderPriorityComparator);
                    var graphics, symbol;
                    d_array.forEach(items, function (graphicItem) {
                        graphics = null;
                        symbol = null;
                        if (graphicItem.service && graphicItem.service.serviceType === ServiceTypes.POI) {
                            gotALegend = true;
                            graphics = graphicItem.layerObject && graphicItem.layerObject.graphics;
                            if (graphics.length > 0) {
                                symbol = graphics[0].symbol;
                            } else {
                                symbol = graphicItem.layerObject.graphicResolver.getDefault();
                            }
                            var rgba = symbol.color.toRgba();
                            legendItems.graphicsLegend.push({
                                legendTitle: graphicItem.title,
                                legendImageUrl: this.applicationUrl + "/resources/icons/generate/circle/20/20/5/" + rgba[0] + "/" + rgba[1] + "/" + rgba[2] + "/" + rgba[3] * 255,
                                legendUrl: null
                            });
                        } else if (graphicItem.service && graphicItem.service.serviceType === ServiceTypes.DirectKML) {
                            gotALegend = true;
                            symbol = graphicItem.layerObject.renderer.getSymbol();
                            var rgba = symbol.color.toRgba();
                            if (rgba[3] === 0) {
                                rgba = symbol.outline.color.toRgba();
                            }
                            legendItems.graphicsLegend.push({
                                legendTitle: graphicItem.title,
                                legendImageUrl: this.applicationUrl + "/resources/icons/generate/circle/20/20/5/" + rgba[0] + "/" + rgba[1] + "/" + rgba[2] + "/" + rgba[3] * 255,
                                legendUrl: null
                            });
                        }
                        else if (graphicItem.nodeType) {
                            gotALegend = true;
                            var url;
                            //searchresuts and redlinig
                            if (graphicItem.nodeType.indexOf("SEARCH_RESULT_PARCEL") > -1 ) {
                                url = this.resourceUrl + "/" + graphicItem.nodeType + "_legend.png";
                            }
                            else if (graphicItem.nodeType.indexOf("SEARCH_RESULT") > -1 || graphicItem.nodeType.indexOf("RESULT_IDENTIFY") > -1) {
                                url = graphicItem.graphics[0].symbol.url;
                            } else {
                                url = this.resourceUrl + "/" + graphicItem.nodeType + "_legend.png";
                            }
                            legendItems.graphicsLegend.push({
                                legendTitle: graphicItem.title,
                                legendImageUrl: url,
                                legendUrl: null
                            });
                        }

                    }, this);

                    return gotALegend ? {
                        legend: [legendItems]
                    } : {
                        legend: []
                    };

                },
                _updatePrintInfo: function () {
                    if (this._timer) {
                        clearTimeout(this._timer);
                    }

                    this._timer = setTimeout(d_lang.hitch(this, function () {
                        var visibleNodes = this.mapModel.getOperationalLayer().filterNodes(function (n, ctx) {
                            var visibilityState = n.get("mapDependentVisibilityStates");
                            visibilityState = visibilityState && visibilityState["default"];
                            var visibleInMap = visibilityState.get("visibleInMap");
                            if (!n.get("enabled") || !visibleInMap) {
                                ctx.skipChildren = true;
                                return false;
                            }
                            var nodeType = n.get("type");
                            switch (nodeType) {
                                case NodeTypes.CATEGORY :
                                case NodeTypes.UNKNOWN :
                                    return false;
                                case NodeTypes.SERVICE:
                                    if (n.service.serviceType === ServiceTypes.WMTS) {
                                        return true;
                                    }
                                    return false;
                                default:
                                    return true;
                            }
                        }, this);
                        visibleNodes = visibleNodes.concat(this.mapModel.getGlassPaneLayer().filterNodes(function (n, ctx) {
                            var visibilityState = n.get("mapDependentVisibilityStates");
                            visibilityState = visibilityState && visibilityState["default"];
                            if (!visibilityState) {
                                return false;
                            }
                            var visibleInMap = visibilityState.get("visibleInMap");
                            if (!n.get("enabled") || !visibleInMap) {
                                ctx.skipChildren = true;
                                return false;
                            }
                            if (n.graphics && n.graphics.length > 0 &&
                                n.id !== "chartGeometryPane" && n.id !== "highlighterPane" && n.id !== "elevationNode" && n.id !== "pointer") {
                                return true;
                            }
                            return false;
                        }, this));

                        var length = visibleNodes.length;
                        this.DATAFORM_ELEMENT[0].disabled = length === 0;
                        if ((this._hasLegend && length === 0) ||
                            (!this._hasLegend && length > 0)) {

                            this._eventService.postEvent("agiv/printing/UPDATE_DIALOG");
                        }
                        this._hasLegend = length > 0;
                    }), 500);

                }
            });
    });