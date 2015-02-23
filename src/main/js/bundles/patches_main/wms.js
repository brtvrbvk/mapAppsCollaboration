/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/declare",
        "dojo/query",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/number",
        "dojo/io-query",
        "ct/array",
        "ct/mapping/layers/WMSLayer",
        "ct/Stateful",
        "esri/layers/WMSLayer",
        "ct/mapping/mapcontent/ServiceTypes",
        "ct/mapping/map/EsriLayerFactory",
        "ct/mapping/map/EsriService"
    ],
    function (
        declare,
        query,
        d_lang,
        d_array,
        d_number,
        d_ioq,
        ct_array,
        ct_WMSLayer,
        Stateful,
        e_WMSLayer,
        ServiceTypes,
        EsriLayerFactory,
        EsriService
        ) {
        var oldGetImageUrl = e_WMSLayer.prototype.getImageUrl,
            oldGetCaps = e_WMSLayer.prototype._getCapabilities,
            oldGetLayerInfo = e_WMSLayer.prototype._getLayerInfo;
        //declaredClass prevents inheretence. 
        delete ct_WMSLayer.prototype.declaredClass;

        d_lang.extend(e_WMSLayer, {
            _getCapabilities: function () {
                if (window.capabilitiesMap && window.capabilitiesMap[this._url.path]) {
                    var that = this;
                    setTimeout(function () {
                        that._parseCapabilities(window.capabilitiesMap[that._url.path]);
                    }, 300);
                } else {
                    oldGetCaps.apply(this, arguments);
                }
            },
            _parseCapabilities: function (xml) {
                if (!xml) {
                    this.onError("GetCapabilities request for " + this._getCapabilitiesURL + " failed. (Response is null.)");
                    return;
                }
                if (!window.capabilitiesMap) {
                    window.capabilitiesMap = {};
                }
                window.capabilitiesMap[this._url.path] = xml;
                this.version = this._getAttributeValue("WMS_Capabilities", "version", xml, null);
                if (!this.version) {
                    this.version = this._getAttributeValue("WMT_MS_Capabilities", "version", xml, "1.3.0");
                }
                var _1d = this._getTag("Service", xml);
                this.title = this._getTagValue("Title", _1d, "");
                if (!this.title || this.title.length == 0) {
                    this.title = this._getTagValue("Name", _1d, "");
                }
                this.copyright = this._getTagValue("AccessConstraints", _1d, "");
                this.description = this._getTagValue("Abstract", _1d, "");
                this.maxWidth = parseInt(this._getTagValue("MaxWidth", _1d, 5000));
                this.maxHeight = parseInt(this._getTagValue("MaxHeight", _1d, 5000));
                var _1e = this._getTag("Layer", xml);
                if (!_1e) {
                    this._getCapabilitiesError({
                        "error": {
                            "message": "Response does not contain any layers."
                        }
                    });
                    return;
                }
                var _1f = this._getLayerInfo(_1e);
                if (_1f) {
                    this.layerInfos = _1f.subLayers;
                    if (!this.layerInfos || this.layerInfos.length == 0) {
                        this.layerInfos = [_1f];
                    }
                    this.extent = _1f.extent;
                    this.allExtents = _1f.allExtents;
                    //patched for grouplayers
                    //calculates layer extent for group layers based on extents of sublayers
                    //PATCH BEGIN
                    var subextfunc = function (l) {
                        if (l.extent) {
                            return l.extent;
                        } else if (l.subLayers.length > 0) {
                            var t = d_array.map(l.subLayers, subextfunc),
                                tempExt = null;
                            d_array.forEach(t, function (temp) {
                                if (!tempExt) {
                                    tempExt = temp;
                                } else {
                                    tempExt = tempExt.union(temp);
                                }
                            });
                            return tempExt;
                        }
                        return null;
                    };
                    if (!this.extent) {
                        var ext = null;
                        d_array.forEach(this.layerInfos, function (l) {
                            if (!ext) {
                                ext = subextfunc(l);
                            } else {
                                var t = subextfunc(l);
                                if (t) {
                                    ext = ext.union(t);
                                }
                            }
                        });
                        this.extent = ext;
                    }
                    //PATCH END
                    this.spatialReferences = _1f.spatialReferences;
                    if (this.spatialReferences.length == 0 && this.layerInfos.length > 0) {
                        this.spatialReferences = this.layerInfos[0].spatialReferences;
                    }
                }
                this.getMapURL = this._getCapabilitiesURL;
                var _20 = query("DCPType", this._getTag("GetMap", xml));
                if (_20 && _20.length > 0) {
                    var _21 = query("HTTP", _20[0]);
                    if (_21 && _21.length > 0) {
                        var _22 = query("Get", _21[0]);
                        if (_22 && _22.length > 0) {
                            var _23 = this._getAttributeValue("OnlineResource", "xlink:href", _22[0], null);
                            if (_23) {
                                if (_23.indexOf("&") == (_23.length - 1)) {
                                    _23 = _23.substring(0, _23.length - 1);
                                }
                                this.getMapURL = _23;
                            }
                        }
                    }
                }
                this.getMapFormats = [];
                if (query("Operation", xml).length == 0) {
                    d_array.forEach(query("Format", this._getTag("GetMap", xml)), function (_24) {
                        this.getMapFormats.push(_24.text ? _24.text : _24.textContent);
                    }, this);
                } else {
                    d_array.forEach(query("Operation", xml), function (_25) {
                        if (_25.getAttribute("name") == "GetMap") {
                            d_array.forEach(query("Format", _25), function (_26) {
                                this.getMapFormats.push(_26.text ? _26.text : _26.textContent);
                            }, this);
                        }
                    }, this);
                }
                if (!d_array.some(this.getMapFormats, function (el) {
                    return el.indexOf(this.imageFormat) > -1;
                }, this)) {
                    this.imageFormat = this.getMapFormats[0];
                }
                this._initLayer();
                //call setters for watch callbacks
                this.set("minScale", 0);
                this.set("maxScale", 0);
                this.set("minScale", this._getScale(this.layerInfos, "minScale"));
                this.set("maxScale", this._getScale(this.layerInfos, "maxScale"));
                this.set("title", this._getTitleForVisibleLayers(this.layerInfos, this.visibleLayers));
            },

            _getTitleForVisibleLayers: function (
                layerInfos,
                visibleLayers
                ) {
                var title;
                d_array.forEach(layerInfos, function (li) {

                    d_array.forEach(visibleLayers, function (vl) {

                        if (vl === li.name) {
                            //we got our layer
                            title = li.title;
                        }

                    }, this);

                    if (!title && li.subLayers && li.subLayers.length > 0) {
                        title = this._getTitleForVisibleLayers(li.subLayers, visibleLayers);
                    }

                }, this);

                return title;

            },
            _getScale: function (
                layerInfos,
                paramName
                ) {
                var hasValue = false;
                var scale = 0;
                d_array.some(layerInfos, function (info) {
                    var subLayers = info.subLayers;
                    d_array.some(subLayers, function (item) {
                        d_array.some(this.visibleLayers, function (layer) {
                            if (item.name === layer) {
                                scale = item[paramName] ? item[paramName] : 0;
                                hasValue = true;
                                return true;
                            }
                        });
                        if (hasValue)
                            return true;
                    }, this);
                    if (hasValue)
                        return true;
                }, this);
                return scale;
            },

            _getStyle: function (node) {
                var tmp, style;
                if (tmp = this._getTag("LegendURL", node)) {
                    if (tmp = this._getTag("OnlineResource", tmp)) {
                        style = tmp.getAttribute("xlink:href");
                    }
                }
                return style;
            },
            _getLayerInfo: function (a) {
                var l = oldGetLayerInfo.apply(this, [a]);
                var maxScale = ct_array.arraySearch(a.childNodes, {
                    "tagName": "MaxScaleDenominator"
                });
                if (maxScale.length > 0) {
                    l.minScale = parseInt(this._getText(maxScale[0]));
                }
                var defaultStyle, hasConfiguredStyles = this.styles.length > 0, firstStyle, currentStyle;
                //fix to be able to define correct SLD styles and use the according legend URL if available
                d_array.forEach(a.childNodes, function (node) {
                    if ("Style" === node.nodeName) {

                        if (!currentStyle) {
                            firstStyle = this._getStyle(node);
                        }
                        currentStyle = this._getStyle(node);

                        var name = this._getTagValue("Name", node);
                        if (name === "default") {
                            defaultStyle = currentStyle;
                        }

                        if (hasConfiguredStyles) {
                            d_array.forEach(this.styles, function (style) {
                                if (name === style) {
                                    l.legendURL = currentStyle;
                                }
                            }, this);
                        } else if (defaultStyle) {
                            l.legendURL = defaultStyle;
                        } else {
                            l.legendURL = firstStyle;
                        }

                    }

                }, this);

                return l;
            }

        });

        d_lang.extend(ct_WMSLayer, {
            getLayerInfo: function (
                name,
                rootLayer
                ) {
                if (rootLayer && rootLayer.name && rootLayer.name === name) {
                    return rootLayer;
                }
                var sublayers = rootLayer ? rootLayer.subLayers : this.layerInfos,
                    matchLayer,
                    found = d_array.some(sublayers, function (l) {
                        if (!l.styles) {
                            l["styles"] = rootLayer.styles;
                        }
                        matchLayer = this.getLayerInfo(name, l);
                        return matchLayer;
                    }, this);
                if (found) {
                    return matchLayer;
                }
                return null;
            },
            getImageUrl: function (
                extent,
                width,
                height,
                callback
                ) {
                var that = this;
                oldGetImageUrl.apply(this, [
                    extent,
                    width,
                    height,
                    function (imageUrl) {
                        if (that.styles.length == 0 || that.styles.length != that.visibleLayers.length) {
                            // found correct style names, if not directly defined by the "styles" property
                            that.styles = [];
                            for (var i = 0; i < that.visibleLayers.length; ++i) {
                                var l = that.getLayerInfo(that.visibleLayers[i]);
                                that.styles[that.styles.length] = l && l.styles ? l.styles[0].name : "";
                            }
                        }
                        var stylesStr = that.styles.join(",");
                        // add styles to url
                        imageUrl = imageUrl.replace(/(STYLES=)[^&]*&/i, "$1" + stylesStr + "&");
                        // remove next line if org wms handles it correct
                        //PATCHED
                        //imageUrl = ct_request.getProxiedUrl(imageUrl);
                        console.debug('GetMap ---->> ' + imageUrl);
                        callback(imageUrl);
                    }
                ]);
            },
            getFeatureInfoUrl: function (
                pixPoint,
                extent,
                width,
                height,
                layerIds,
                format
                ) {
                var infoLayers = this.infoLayers && this.infoLayers.length > 0 ? this.infoLayers : this.visibleLayers;
                // check if all queryable
                infoLayers = d_array.filter(infoLayers, function (name) {
                    var l = this.getLayerInfo(name);
                    // if layer info not found, accept it
                    return !l || l.queryable;
                }, this);
                if (infoLayers.length == 0) {
                    // TODO: what if no layer is queryable ?
                    throw new Error("no wms layer is queryable!");
                }

                // filter layer ids if set
                layerIds = layerIds || [];
                if (layerIds.length) {
                    infoLayers = d_array.filter(infoLayers, function (name) {
                        return d_array.indexOf(layerIds, name) >= 0;
                    }, this);
                }

                if (infoLayers.length == 0) {
                    throw new Error("WMS layer(s) '" + layerIds.join(",") + "' not found!");
                }
                format = format ? format : "text/html";
                var selFormat = ct_array.arraySearchFirst(this.infoFormat, format);
                if (!selFormat) {
                    throw new Error("WMS does not support '" + format + "' format for getFeatureInfo operation! Supported types are: " + this.infoFormat.join(", "));
                }

                var featureCount = this.infoFeatureCount ? this.infoFeatureCount : 10,
                    additionalParams = {
                        INFO_FORMAT: selFormat,
                        QUERY_LAYERS: infoLayers.join(','),
                        FEATURE_COUNT: featureCount
                    },
                    xParam = 'X',
                    yParam = 'Y';
                if (this.version === '1.3.0') {
                    xParam = 'I';
                    yParam = 'J';
                }
                // here we uning dojo round because of error in some browsers, were pixpoint is not an int!
                additionalParams[xParam] = d_number.round(pixPoint.x, 0);
                additionalParams[yParam] = d_number.round(pixPoint.y, 0);

                var additionalQueryPart = d_ioq.objectToQuery(additionalParams);

                var url;
                this.getImageUrl(extent, width, height, function (imageUrl) {
                    var featureUrl = imageUrl.replace(/(REQUEST=)[^&]*&/i, "$1GetFeatureInfo&");
                    featureUrl = featureUrl.concat('&').concat(additionalQueryPart);
                    console.debug('GetFeatureInfo ---->> ' + featureUrl);
                    url = featureUrl;
                });
                return url;
            }
        });

        var WMS = declare([
            ct_WMSLayer,
            Stateful
        ], {

        });

        EsriLayerFactory.globalServiceFactories[ServiceTypes.WMS] = {
            create: function (
                node,
                url,
                mapmodel,
                mapstate
                ) {
                //TODO Optimize so that existing layer nodes are used
                // and the wms don't performs a GetCapabilities request again!
                return new EsriService({
                    mapModelNode: node,
                    reverseEnabledLayers: true,
                    createEsriLayer: function () {
                        var layer = new WMS(url, node.get("options") || {});
                        this.connectP(layer, "minScale", function (
                            name,
                            oldScale,
                            newScale
                            ) {
                            if (!node.minScale) {
                                node.set("minScale", newScale);
                                mapmodel.fireModelNodeStateChanged();
                            }
                        });
                        this.connectP(layer, "maxScale", function (
                            name,
                            oldScale,
                            newScale
                            ) {
                            if (!node.minScale) {
                                node.set("maxScale", newScale);
                                mapmodel.fireModelNodeStateChanged();
                            }
                        });
                        this.connectP(layer, "title", function (
                            name,
                            oldTitle,
                            newTitle
                            ) {
                            if (!node.title || node.title.length === 0 || node.title.indexOf("http://") > -1) {
                                node.set("title", newTitle);
                                mapmodel.fireModelNodeStateChanged();
                            }
                        });
                        return layer;
                    }
                });
            }
        };

    });
