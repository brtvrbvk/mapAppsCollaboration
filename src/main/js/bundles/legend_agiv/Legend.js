define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/Deferred",
        "dojo/_base/kernel",
        "dojo/_base/array",
        "dojo/string",
        "dojo/dom",
        "dojo/dom-style",
        "dojo/dom-construct",
        "dojo/io-query",
        "ct/Locale",
        "ct/_Connect",
        "esri/dijit/Legend",
        "esri/geometry/scaleUtils",
        "base/util/CommonID"
    ],
    function (
        declare,
        lang,
        Deferred,
        d_kernel,
        d_array,
        d_string,
        d_dom,
        d_domStyle,
        d_domConstruct,
        d_io,
        Locale,
        Connect,
        EsriLegend,
        e_scaleUtils,
        CommonID
        ) {
        /*
         * COPYRIGHT 2011 con terra GmbH Germany
         */
        return declare([EsriLegend],
            {
                // expected to be provided
                mapModel: null,

                constructor: function () {

                    this._handler = new Connect({
                        defaultConnectScope: this
                    });

                },

                _refreshOnNodeStateChange: function () {
                    this.refresh();
                },
                /**
                 * This patches the orginial method and extend it to support the showBaseLayer flag.
                 */
                _isSupportedLayerType: function (layer) {
                    layer.isWMSLayer = false;
                    if (layer._getCapabilitiesURL && layer._getCapabilitiesURL != "") {
                        layer.isWMSLayer = true;
                    }
                    if(!this._showLayerInLegend(layer))
                        return false;
                    return (this.inherited(arguments) || layer.isWMSLayer) && (this.showBaseLayer || !this._isBaseLayer(layer));
                },
                
                _showLayerInLegend : function(layer){
                    var node = this.mapModel.getNodeById(layer.__managed);
                    var showInLegend = node && node.get("showInLegend");
                    return  (showInLegend || showInLegend===undefined) && (this.showBaseLayer || (!this._isBaseLayer(layer) && !node.get("isBaseLayerReference")) )
                },
                
                _isBaseLayer: function (esriLayer) {
                    var mapModel = this.mapModel;
                    // Note: here we access the __managed flag of the esriLayer, which is added by the EsriLayerManager Property
                    // it contains the id of the model node
                    return mapModel.getServiceNodes(mapModel.getBaseLayer(), function (baseLayerNode) {
                        return (esriLayer.__managed && baseLayerNode.get("id") === esriLayer.__managed);
                    }, this).length > 0;
                },
                /**
                 * Patch original method, to ensure that it allways returns a deferred.
                 */
                _legendRequest: function (layer) {
                    var d = null;
                    if (!layer.loaded) {
                        this.connect(layer, "onLoad", lang.hitch(this, "_legendRequest"));
                        return;
                    }

                    if (layer.isWMSLayer) {
                        d = this._legendRequestWMS(layer);
                    } else if (layer.version >= 10.01) {
                        d = this._legendRequestServer(layer);
                    } else {
                        d = this._legendRequestTools(layer);
                    }

                    if (!d) {
                        d = new Deferred();
                        d.resolve(true);
                    }
                    return d;
                },
                _legendRequestWMS: function (layer) {
                    this._hasSubLayers = false;
                    d_array.forEach(layer.layerInfos, function (layerInfo) {
                        /** add properties to conform to layer structure from esri **/

                            // should be using id, but use name since it is used for comparison in _buildLegendItems --> visibleLayers is shown with name, not id.
                        layerInfo.id = (layerInfo.name != "") ? layerInfo.name : layerInfo.title;

                        // check if it has sublayers. add to layerinfos --> create flat structure as in esri's
                        if (layerInfo.subLayers && layerInfo.subLayers.length > 0) {
                            this._hasSubLayers = true;
                            var subLayers = layerInfo.subLayers;
                            this._addToLayerInfos(layer.layerInfos, layerInfo, subLayers);
                            layerInfo.parentLayerId = -1;
                        } else {
                            layerInfo.subLayerIds = null;
                            layerInfo.parentLayerId = -1;
                        }
                    }, this);

                    /** filter layerinfos --> if parentLayerId = -1 && subLayerIds = null, has legend. if subLayerIds != null, no legend **/
                    var filteredLayerInfos;
                    if (this._hasSubLayers) {
                        filteredLayerInfos = d_array.filter(layer.layerInfos, function (layerInfo) {
                            return layerInfo.legendURL != undefined; // && layerInfo.subLayerIds == null
                        });
                    } else {
                        filteredLayerInfos = layer.layerInfos;
                    }

                    var resp = this._buildLegendResponse(filteredLayerInfos);
                    this._processLegendResponse(layer, resp);
                },

                /** override, to ignore all the connects to events. Managed the the legend refresh by _uiVisible() and _uiInvisible() **/
                _activate: function () {
                },

                _uiVisible: function () {
                    this._handler.disconnect();
                    this._handler.connect(this.map, "onLayerAdd", function () {
                        this.refresh();
                    });
                    this._handler.connect(this.map, "onLayersRemoved", function () {
                        this.refresh();
                    });
                    this._handler.connect(this.map, "onLayersReordered", function () {
                        this.refresh();
                    });
                },

                _uiInvisible: function () {
                    this._handler.disconnect();
                },
                _buildLegendResponse: function (layerInfos) {
                    var layers = [];
                    var mappings = this.mappings;
                    var maps = undefined;

                    if (mappings) {
                        maps = mappings[layerInfos[0].legendURL.split("?")[0]];
                    }

                    if (maps && maps != undefined) {
                        d_array.forEach(layerInfos, function (layerInfo) {
                            var sm = maps[layerInfo.id];
                            if (sm == layerInfo.id) {
                                this._generateAndPushLayer(layerInfo, layers);
                            } else {
                                this._generateAndPushLayer(this._getReplacementLayerInfo(layerInfos, sm),
                                    layers);
                            }
                        }, this);
                    } else {
                        d_array.forEach(layerInfos, function (layerInfo) {
                            this._generateAndPushLayer(layerInfo, layers);
                        }, this);
                    }

                    return {
                        layers: layers
                    }
                },
                _getReplacementLayerInfo: function (
                    layerInfos,
                    id
                    ) {
                    for (var i = 0; i < layerInfos.length; i++) {
                        if (layerInfos[i].id == id) return layerInfos[i];
                    }
                    return undefined;
                },
                _generateAndPushLayer: function (
                    layerInfo,
                    layers
                    ) {
                    if (layerInfo && layerInfo != undefined)
                        layers.push({
                            layerId: layerInfo.id,
                            layerName: layerInfo.name,
                            legend: [
                                {
                                    contentType: "image/png",
                                    label: layerInfo.name,
                                    url: (layerInfo.legendURL) ? this._trimLegendURL(layerInfo.legendURL) : "" // TODO: need to change style parameter to default
                                }
                            ]
                        });
                },
                _addToLayerInfos: function (
                    layerInfos,
                    layerInfo,
                    subLayers
                    ) {
                    layerInfo.subLayerIds = [];
                    d_array.forEach(subLayers, function (subLayer) {
                        var name = subLayer.name;
                        layerInfo.subLayerIds.push(name);
                        subLayer.id = name;
                        subLayer.subLayerIds = null;
                        subLayer.parentLayerId = layerInfo.id || layerInfo.name;
                        layerInfos.push(subLayer);
                    });
                },
                _trimLegendURL: function (url) {
                    var decodedURL = decodeURIComponent(url);
                    var q = decodedURL.substring(decodedURL.indexOf("?") + 1, decodedURL.length);
                    var queryObj = d_io.queryToObject(q);
                    if (queryObj.style && queryObj.style.indexOf(":") !== -1) {
                        queryObj.style = queryObj.style.split(":")[1];
                    }
                    queryObj.LANGUAGE = Locale.getCurrent().getLanguageISO6392B();
                    var urlQuery = d_io.objectToQuery(queryObj);
                    return decodedURL.substring(0, decodedURL.indexOf("?") + 1) + urlQuery;
                },
                _buildLegendItems: function (
                    response,
                    layer,
                    pos
                    ) {
                    var mappings = this.mappings;
                    if (mappings) {
                        var maps = mappings[response.url];
                        var isMappedLayer = false;
                        if (maps) {
                            var mappedId = maps[layer.id];
                            (mappedId) ? isMappedLayer = true : isMappedLayer = false;
                        }
                    }

                    var _34 = false;
                    var _35 = d_dom.byId(this.id + "_" + response.id);
                    var subLayerIds = layer.subLayerIds;
                    var _37 = layer.parentLayerId;
                    if (subLayerIds && !isMappedLayer) {

                        var _38 = d_domConstruct.create("div", {
                                id: this.id + "_" + response.id + "_" + layer.id + "_group",
                                style: "display: none;",
                                "class": (_37 == -1) ? ((pos > 0) ? "esriLegendGroupLayer" : "") : (this.alignRight ? "esriLegendRight" : "esriLegendLeft")
                            },
                            (_37 == -1) ? _35 : d_dom.byId(this.id + "_" + response.id + "_" + _37 + "_group"));
                        if (d_kernel.isIE) {
                            d_domStyle.set(d_dom.byId(this.id + "_" + response.id + "_" + layer.id + "_group"),
                                "display", "none");
                        }
                        d_domConstruct.create("td", {
                            innerHTML: (layer.name) ? layer.name.replace(/[\<]/g, "&lt;").replace(/[\>]/g,
                                "&gt;") : "",
                            align: (this.alignRight ? "right" : "")
                        }, d_domConstruct.create("tr", {}, d_domConstruct.create("tbody", {},
                            d_domConstruct.create("table",
                                {
                                    width: "95%",
                                    "class": "esriLegendGroupLayerLabel"
                                },
                                _38))));
                    } else {
                        if (response.visibleLayers && ("," + response.visibleLayers + ",").indexOf("," + layer.id + ",") == -1) {
                            return _34;
                        }
                        var d;
                        if (isMappedLayer) {
                            d = d_domConstruct.create("div", {
                                    id: this.id + "_" + response.id + "_" + layer.id + "_group",
                                    style: "display:none;",
                                    "class": (_37 > -1) ? (this.alignRight ? "esriLegendRight" : "esriLegendLeft") : ""
                                },
                                (_37 == -1) ? _35 : d_dom.byId(this.id + "_" + response.id + "_" + _37 + "_group"));
                            if (d_kernel.isIE) {
                                d_domStyle.set(d_dom.byId(this.id + "_" + response.id + "_" + layer.id + "_group"),
                                    "display", "none");
                            }
                        } else {
                            d = d_domConstruct.create("div", {
                                    id: this.id + "_" + response.id + "_" + layer.id,
                                    style: "display:none;",
                                    "class": (_37 > -1) ? (this.alignRight ? "esriLegendRight" : "esriLegendLeft") : ""
                                },
                                (_37 == -1) ? _35 : d_dom.byId(this.id + "_" + response.id + "_" + _37 + "_group"));
                            if (d_kernel.isIE) {
                                d_domStyle.set(d_dom.byId(this.id + "_" + response.id + "_" + layer.id),
                                    "display", "none");
                            }
                        }

                        var layerName;
                        if (response.isWMSLayer) {
                            layerName = ""; // to avoid overlapping text with the graphic
                        } else {
                            layerName = layer.name;
                        }

                        d_domConstruct.create("td", {
                            innerHTML: (layerName) ? layerName.replace(/[\<]/g, "&lt;").replace(/[\>]/g,
                                "&gt;") : "",
                            align: (this.alignRight ? "right" : "")
                        }, d_domConstruct.create("tr", {}, d_domConstruct.create("tbody", {},
                            d_domConstruct.create("table",
                                {
                                    width: "95%",
                                    "class": "esriLegendLayerLabel"
                                },
                                d))));
                        if (response.legendResponse) {
                            _34 = _34 || this._buildLegendItems_Tools(response, layer, d, mappedId);
                        } else {
                            if (response.renderer) {
                                _34 = _34 || this._buildLegendItems_Renderer(response, layer, d);
                            }
                        }

                    }

                    return _34;

                },
                _buildLegendItems_Tools: function (
                    _39,
                    layer,
                    _3b,
                    mappedId
                    ) {
                    var _3c = layer.parentLayerId;
                    var _3d = e_scaleUtils.getScale(this.map);
                    var _3e = false;
                    var ID = (mappedId) ? mappedId : layer.id;

                    var replacements = this.replacements[_39.url],
                        replacementItem;
                    if (replacements) {
                        replacementItem = replacements[layer.id];
                    }

                    if (!this._respectCurrentMapScale || (this._respectCurrentMapScale && this._isLayerInScale(_39,
                        layer,
                        _3d))) {
                        for (var i = 0; i < _39.legendResponse.layers.length; i++) {
                            if (ID == _39.legendResponse.layers[i].layerId) {
                                var _3f = _39.legendResponse.layers[i].legend;
                                if (_3f.length == 3 && _3f[0].label.replace(/\s+/g,
                                    "").indexOf(":Band_") > -1) {
                                } else {
                                    var _40 = d_domConstruct.create("tbody", {},
                                        d_domConstruct.create("table", {
                                            cellpadding: 0,
                                            cellspacing: 0,
                                            width: "95%",
                                            "class": "esriLegendLayer"
                                        }, _3b));
                                    d_array.forEach(_3f, function (_41) {
                                        if ((_41.url && _41.url.indexOf("http") === 0) || (_41.imageData && _41.imageData.length > 0)) {
                                            _3e = true;
                                            this._buildRow_Tools(_41, _40, _39, ID, replacementItem);
                                        }
                                    }, this);
                                }
                                break;
                            }
                        }
                    }

                    if (_3e) {
                        var node;
                        if (mappedId) {
                            node = d_dom.byId(this.id + "_" + _39.id + "_" + layer.id + "_group");
                        } else {
                            node = d_dom.byId(this.id + "_" + _39.id + "_" + layer.id);
                        }
                        if (node) {
                            d_domStyle.set(node, "display", "block");
                        }
                        if (_3c > -1 || (typeof(_3c) == 'string' && _3c != "")) {
                            d_domStyle.set(d_dom.byId(this.id + "_" + _39.id + "_" + _3c + "_group"),
                                "display", "block");
                            this._findParentGroup(_39.id, _39, _3c);
                        }
                    }
                    return _3e;
                },
                _createLegend: function () {
                    d_domStyle.set(this.domNode, "position", "relative");
                    d_domConstruct.create("div", {
                        id: this.id + "_msg",
                        innerHTML: this.i18n.ui.createLegend
                    }, this.domNode);

                    var operationalLayers = this.mapModel.getOperationalLayer().children;
                    var enabledLayers = d_array.filter(operationalLayers, function (layer) {
                        return layer.get("enabled") === true ;
                    });
                    if (this.legendMapping && enabledLayers.length > 0) {
                        d_array.forEach(enabledLayers, function (layer) {
                            var showInLegend = layer.showInLegend;
                            if(layer.showInLegend+"" != "false")
                                layer.showInLegend=true;
                            if(showInLegend){
                                var id = layer.id.split("/")[layer.id.split("/").length - 1];
                                id = CommonID.to(id);
                                d_array.forEach(this.legendMapping, function (item) {
                                    if (id === item.id) {
                                        var push = true;
                                        d_array.forEach(this.layers, function (legendlayer) {
                                            //find managed esri layer
                                            if (legendlayer.__managed === layer.id) {
                                                push = false;
                                                legendlayer.legendURL = item.legendURL;
                                                legendlayer.legendType = item.type;
                                            }

                                        }, this);

                                        if (push) {
                                            layer.set("legendURL", item.legendURL);
                                            layer.set("legendType", item.type);
                                            this.layers.push(layer);
                                        }
                                    }
                                }, this);
                            }
                        }, this);
                    }

                    var _15 = [];
                    d_array.forEach(this.layers, function (_16) {
                        if (_16.declaredClass == "esri.layers.KMLLayer") {
                            d_array.forEach(_16.getLayers(), function (_17) {
                                if (_17.declaredClass == "esri.layers.FeatureLayer" && _16._titleForLegend) {
                                    _17._titleForLegend = _16._titleForLegend + " - ";
                                    if (_17.geometryType == "esriGeometryPoint") {
                                        _17._titleForLegend += "Points";
                                    } else {
                                        if (_17.geometryType == "esriGeometryPolyline") {
                                            _17._titleForLegend += "Lines";
                                        } else {
                                            if (_17.geometryType == "esriGeometryPolygon") {
                                                _17._titleForLegend += "Polygons";
                                            }
                                        }
                                    }
                                    _15.push(_17);
                                }
                            });
                        } else {
                            _15.push(_16);
                        }
                    }, this);
                    var _18 = [];
                    d_array.forEach(_15, function (
                        _19,
                        index
                        ) {
                        if ((_19.visible === true && (_19.layerInfos || _19.renderer)) || _19.get("enabled")) {
                            var cssClass = "esriLegendService";
                            if (index === 0) {
                                cssClass += "-lastItem"
                            }
                            var d = d_domConstruct.create("div", {
                                id: this.id + "_" + _19.id,
                                "class": cssClass
                            });
                            d_domConstruct.create("span", {
                                innerHTML: this._getServiceTitle(_19),
                                "class": "esriLegendServiceLabel"
                            }, d_domConstruct.create("td", {
                                align: (this.alignRight ? "right" : "")
                            }, d_domConstruct.create("tr", {}, d_domConstruct.create("tbody", {},
                                d_domConstruct.create("table",
                                    {
                                        width: "95%"
                                    },
                                    d)))));
                            d_domConstruct.place(d, this.id, "first");
                            if ((_19.legendResponse || _19.renderer || _19.legendURL) && !this._dynamicLayerChanged) {
                                this._createLegendForLayer(_19);
                            } else {
                                _18.push(this._legendRequest(_19));
                            }
                            this._dynamicLayerChanged = false;
                        }
                    }, this);
                    if (_18.length === 0) {
                        d_dom.byId(this.id + "_msg").innerHTML = this.i18n.ui.noLegend;
                        this._activate();
                    } else {
                        var _1a = new dojo.DeferredList(_18);
                        _1a.addCallback(dojo.hitch(this, function (_1b) {
                            d_dom.byId(this.id + "_msg").innerHTML = this.i18n.ui.noLegend;
                            this._activate();
                        }));
                    }
                },
                _createLegendForLayer: function (_1f) {
                    if (_1f.legendResponse || _1f.renderer || _1f.legendURL) {
                        var _20 = false;
                        if (_1f.legendResponse) {
                            d_array.forEach(_1f.layerInfos, function (
                                _21,
                                i
                                ) {
                                if (!_1f._hideLayersInLegend || d_array.indexOf(_1f._hideLayersInLegend,
                                    _21.id) == -1) {
                                    var f = this._buildLegendItems(_1f, _21, i);
                                    _20 = _20 || f;
                                }
                            }, this);
                        } else if (_1f.renderer) {
                            var id;
                            if (!_1f.url) {
                                id = "fc_" + _1f.id;
                            } else {
                                id = _1f.url.substring(_1f.url.lastIndexOf("/") + 1, _1f.url.length);
                            }
                            var _22 = {
                                id: id,
                                name: null,
                                subLayerIds: null,
                                parentLayerId: -1
                            };
                            _20 = this._buildLegendItems(_1f, _22, 0);
                        } else if (_1f.legendURL) {
                            if (_1f.legendType === "image" ) {
                                 //BartVerbeeck voorlopig Loes titel image legende
                                if(_1f.service && _1f.service.serviceType ==="WMTS")
                                var d = d_domConstruct.create("span", {
                                innerHTML: _1f.title,
                                "class": "esriLegendServiceLabel"
                                });
                                
                                _20 = d_domConstruct.create("img", {
                                    "src": _1f.legendURL,
                                    "class": "ctLegendServiceImage"
                                }, d_dom.byId(this.id + "_" + _1f.id));
                                 //BartVerbeeck voorlopig Loes titel image legende
                                 if(_1f.service && _1f.service.serviceType ==="WMTS")
                                d_domConstruct.place(d, this.id + "_" + _1f.id,"first");
                            } else if (_1f.legendType === "pdf") {
                                
                                _20 = d_domConstruct.create("a", {
                                    "href": _1f.legendURL,
                                    "target": "_blank",
                                    "innerHTML": d_string.substitute(this.i18n.ui.externalLink, {
                                        title: _1f._titleForLegend || _1f.title
                                    }),
                                    "class": "ctLegendServiceURL"
                                }, d_dom.byId(this.id + "_" + _1f.id));
                            }
                        }
                        if (_20) {
                            d_domStyle.set(d_dom.byId(this.id + "_" + _1f.id), "display", "block");
                            d_domStyle.set(d_dom.byId(this.id + "_msg"), "display", "none");
                        }
                    }
                },
                _processLegendResponse: function (
                    layer,
                    legendLayers
                    ) {
                    if (legendLayers && legendLayers.layers) {
                        layer.legendResponse = legendLayers;
                        //        _2.empty(_2.byId(this.id+"_"+_30.id));
                        this._createLegendForLayer(layer);
                    } else {
                        console.log("Legend could not get generated for " + layer.url + ": " + _2.toJson(legendLayers));
                    }
                },

                _buildRow_Tools: function (
                    _42,
                    _43,
                    _44,
                    _45,
                    replacementItem
                    ) {
                    var tr = d_domConstruct.create("tr", {}, _43);
                    var _46;
                    var _47;
                    if (this.alignRight) {
                        _46 = d_domConstruct.create("td", {
                            align: "right"
                        }, tr);
                        _47 = d_domConstruct.create("td", {
                            align: "right",
                            width: 35
                        }, tr);
                    } else {
                        _47 = d_domConstruct.create("td", {
                            width: 35
                        }, tr);
                        _46 = d_domConstruct.create("td", {}, tr);
                    }
                    var src = _42.url;
                    if ((!dojo.isIE || dojo.isIE > 8) && _42.imageData && _42.imageData.length > 0) {
                        src = "data:image/png;base64," + _42.imageData;
                    } else {
                        if (_42.url.indexOf("http") !== 0) {
                            src = _44.url + "/" + _45 + "/images/" + _42.url;
                            var _48 = _44._getToken();
                            if (_48) {
                                src += "?token=" + _48;
                            }
                        }
                    }
                    if (replacementItem) {
                        d_domConstruct.create("span", {
                            innerHTML: replacementItem
                        }, _47);
                    } else {
                        var img = d_domConstruct.create("img", {
                            src: src,
                            border: 0
//                        style:"opacity:"+_44.opacity
                        }, _47);
                        d_domConstruct.create("td", {
//                            innerHTML: _42.label.replace(/[\<]/g, "&lt;").replace(/[\>]/g, "&gt;"),
                            align: (this.alignRight ? "right" : "")
                        }, d_domConstruct.create("tr", {}, d_domConstruct.create("tbody", {},
                            d_domConstruct.create("table",
                                {
                                    width: "95%",
                                    dir: "ltr"
                                },
                                _46))));
                        if (dojo.isIE < 9) {
//                        img.style.filter="alpha(opacity="+(_44.opacity*100)+")";
                        }
                    }
                }

            });
    });