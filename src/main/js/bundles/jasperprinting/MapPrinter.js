/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 23.04.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/json",
        "ct/Hash",
        "ct/Locale",
        "ct/Stateful",
        "ct/mapping/map/ViewPort",
        "ct/mapping/geometry",
        "esri/geometry/Extent",
        "esri/geometry/screenUtils",
        "esri/layers/GraphicsLayer",
        "esri/symbols/PictureMarkerSymbol",
        "esri/symbols/TextSymbol",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/geometry/Polyline",
        "esri/geometry/Point",
        "esri/geometry/Polygon",
        "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/WMSLayer",
        "esri/layers/WMTSLayer",
        "esri/layers/TiledMapServiceLayer",
        "esri/tileUtils",
        "esri/geometry/geodesicUtils",
        "esri/units"
    ],
    function (
        declare,
        d_array,
        d_lang,
        JSON,
        Hash,
        Locale,
        Stateful,
        ViewPort,
        geometry,
        Extent,
        e_screenUtils,
        GraphicsLayer,
        PictureMarkerSymbol,
        TextSymbol,
        SimpleMarkerSymbol,
        Polyline,
        Point,
        Polygon,
        ArcGISTiledMapServiceLayer,
        ArcGISDynamicMapServiceLayer,
        WMSLayer,
        WMTSLayer,
        TiledMapServiceLayer,
        e_tileUtils,
        e_geodesicUtils,
        e_units
        ) {
        return declare([Stateful],
            {
                esriMap: null,
                pdfUrl: null,
                deferredPrint: null,
                customExtent: null,
                transparencies: null,
                proxy: null,
                ignoreFeatures: null,
                _historicPointerNodeId: "pointer",
                scalebarDataName: "scalebar",
                scaleDataName: "scale",
                dataformKey: "map",

                DATAFORM_ELEMENT: [
                    {
                        "type": "label",
                        "value": "Title"
                    },
                    {
                        "type": "textbox",
                        "label": "Title",
                        "field": "print.map.title",
                        "max": 100
                    },
                    {
                        "type": "label",
                        "value": "Korte beschrijving"
                    },
                    {
                        "type": "textarea",
                        "label": "Korte beschrijving",
                        "field": "print.map.description",
                        "max": 255
                    }
                ],

                constructor: function () {
                },
                activate: function (componentCtx) {
                },

                deactivate: function () {
                },

                _convertUrlToAbsolute: function (url) {
                    if (url) {
                        if (url.indexOf("http") !== 0) {
                            var escapeHTML = function (s) {
                                return s.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');
                            };
                            var el = document.createElement('div');
                            el.innerHTML = '<a href="' + escapeHTML(url) + '">x</a>';
                            url = el.childNodes[0].href;
                        }
                    }
                    return url;
                },

                // adds a proxy if the proxy was configured in setProxy()
                _addProxy: function (url) {
                    if (url) {
                        if (this.proxy) {
                            url = this.proxy + url;
                        }
                    }
                    return url;
                },

                addEsriMap: function (esriMap) {
                    this.esriMap = esriMap;
                },

                // set proxy for map2pdf
                setProxy: function (proxy) {
                    this.proxy = proxy;
                },

                // ignore features in map2pdf, true:  only print if glasspanelayer has a property print:true,false: print features all the time
                setIgnoreFeatures: function (ignore) {
                    this.ignoreFeatures = ignore;
                },

                _renderGraphicsLayer: function (
                    preserveScale,
                    mapExtent,
                    targetExtent,
                    targetWidth,
                    targetHeight,
                    layer,
                    tileUrls,
                    dynamicUrls,
                    features
                    ) {

                    if (layer.graphics.length > 0) {
                        var geometries = [];

                        var graphics = layer.graphics;
                        for (var i = 0; i < graphics.length; i++) {

                            var geometry = graphics[i].geometry;
                            if (geometry) {
                                if (targetExtent.spatialReference.wkid !== geometry.spatialReference.wkid) {
                                    geometry = this.coordinateTransformer.transform(geometry,
                                        targetExtent.spatialReference.wkid);
                                }
                                if ((graphics[i].visible === undefined || graphics[i].visible) && targetExtent.intersects(geometry)) {

                                    geometry = e_screenUtils.toScreenGeometry(
                                        targetExtent, targetWidth, targetHeight, geometry);
                                    if (geometry instanceof Polygon) {
                                        geometries.push({
                                            "geometryType": "esriGeometryPolygon",
                                            "rings": geometry.rings,
                                            "symbol": graphics[i].symbol.toJson()
                                        });
                                    }
                                    else if (geometry instanceof Point) {

                                        if (graphics[i].symbol instanceof PictureMarkerSymbol) {
                                            geometries.push({
                                                "geometryType": "esriGeometryPoint",
                                                "x": geometry.x,
                                                "y": geometry.y,
                                                "symbol": graphics[i].symbol.toJson()
//                                        "symbolUrl" : ct.toAbsoluteURL(graphics[i].symbol.url)
                                            });
                                        } else if (graphics[i].symbol instanceof TextSymbol) {
                                            geometries.push({
                                                "geometryType": "esriGeometryPoint",
                                                "x": geometry.x,
                                                "y": geometry.y,
                                                "symbol": graphics[i].symbol.toJson()
                                            });
                                        } else if (graphics[i].symbol instanceof SimpleMarkerSymbol) {
                                            geometries.push({
                                                "geometryType": "esriGeometryPoint",
                                                "x": geometry.x,
                                                "y": geometry.y,
                                                "symbol": graphics[i].symbol.toJson()
                                            });
                                        }
                                    }
                                    else if (geometry instanceof Polyline) {
                                        geometries.push({
                                            "geometryType": "esriGeometryPolyline",
                                            "paths": geometry.paths,
                                            "symbol": graphics[i].symbol.toJson()
                                        });
                                    }
                                    else {
                                        console.log("Unknown geometry: ", geometry);
                                    }

                                }
                            }

                        }

                        var transparency = 1;
                        if (this.transparencies && this.transparencies.featureTransparency) {
                            transparency = this.transparencies.featureTransparency;
                        }
                        features.push({
                            "geometries": geometries,
                            "transparency": transparency,
                            "width": targetWidth,
                            "height": targetHeight
                        });
                    }

                },

                _renderArfGISLayer: function (
                    preserveScale,
                    mapExtent,
                    targetExtent,
                    targetWidth,
                    targetHeight,
                    layer,
                    tileUrls,
                    dynamicUrls
                    ) {

                    var newDynamicUrl = layer.url + "/export?bbox=" + targetExtent.xmin + ","
                        + targetExtent.ymin + "," + targetExtent.xmax + "," + targetExtent.ymax
                        + "&size=" + targetWidth + "," + targetHeight
                        + "&transparent=true&format=png24&f=image"
                        + "&bboxSR=" + targetExtent.spatialReference.wkid; // {"wkid" : 4326}

                    newDynamicUrl = this._addProxy(newDynamicUrl);
                    var dynamicUrl = this._addLayerDefinitionsToUrl(newDynamicUrl, layer);

                    // replace only if "this.layerdefs" is available AND the method "_addLayerDefinitionsToUrl" changed nothing
                    if (this.layerdefs && this.layerdefs.length > 0 && dynamicUrl === newDynamicUrl) {

                        d_array.forEach(this.layerdefs, function (layerdef) {
                            if (layer.__managed === layerdef.layerId) {
                                dynamicUrl += ("&layerdefs=" + escape(layerdef.layerdefs));
                            }
                        });
                    }

                    // handle layer visibility...
                    if (layer.visibleLayers.length > 0) {
                        dynamicUrl += "&layers=show:";
                        for (var i = 0; i < layer.visibleLayers.length; i++) {
                            dynamicUrl += layer.visibleLayers[i];
                            dynamicUrl += i + 1 < layer.visibleLayers.length ? "," : "";
                        }

                        var transparency = layer.opacity;
                        if (this.transparencies && this.transparencies.layerTransparency) {
                            transparency = this.transparencies.layerTransparency;
                        }
                        dynamicUrls.push({
                            "url": this._convertUrlToAbsolute(dynamicUrl),
                            "width": targetWidth,
                            "height": targetHeight,
                            "transparency": transparency
                        });
                    }

                },

                _renderWMSLayer: function (
                    preserveScale,
                    mapExtent,
                    targetExtent,
                    targetWidth,
                    targetHeight,
                    layer,
                    tileUrls,
                    dynamicUrls
                    ) {

                    var url;
                    layer.getImageUrl(targetExtent, targetWidth, targetHeight, function (wmsurl) {
                        url = wmsurl;
                    });
                    var transparency = layer.opacity;
                    if (this.transparencies && this.transparencies.layerTransparency) {
                        transparency = this.transparencies.layerTransparency;
                    }
                    dynamicUrls.push({
                        "url": this._convertUrlToAbsolute(url),
                        "width": targetWidth,
                        "height": targetHeight,
                        "transparency": transparency
                    });

                },

                _renderWMTSLayer: function (
                    preserveScale,
                    mapExtent,
                    targetExtent,
                    targetWidth,
                    targetHeight,
                    layer,
                    tileUrls,
                    dynamicUrls
                    ) {

                    var mockMap = {
                        width: targetWidth,
                        height: targetHeight,
                        __visibleDelta: {
                            x: 0,
                            y: 0
                        }
                    };
                    var candidateTileInfo = e_tileUtils.getCandidateTileInfo(mockMap, layer.tileInfo,
                        targetExtent);
                    var layerTileUrls = [];
                    var xTiles = Math.ceil(targetWidth / layer.tileInfo.width);
                    var yTiles = Math.ceil(targetHeight / layer.tileInfo.height);

                    var lodlevel = candidateTileInfo.lod.level;
                    for (var x = 0; x <= xTiles; x++) {
                        for (var y = 0; y <= yTiles; y++) {
                            var row = candidateTileInfo.tile.coords.col + x;
                            var col = candidateTileInfo.tile.coords.row + y;
                            var tileUrl = layer.getTileUrl(lodlevel, col, row);
                            layerTileUrls.push({
                                "url": this._convertUrlToAbsolute(tileUrl),
                                "row": col,
                                "col": row
                            });
                        }
                    }
                    tileUrls.push({
                        "tiles": layerTileUrls,
                        "transparency": layer.opacity,
                        "clipOptions": {
                            "offsetX": candidateTileInfo.tile.offsets.x,
                            "offsetY": candidateTileInfo.tile.offsets.y,
                            "width": targetWidth,
                            "height": targetHeight
                        }
                    });

                },

                findFittingLodIndex: function (
                    viewport,
                    layer
                    ) {
                    // here we simple try to find a matching lod by scale
                    var scale = viewport.getScale();
                    if (!scale) {
                        return -1;
                    }
                    var scalePixResolution = geometry.calcPixelResolutionAtScale(scale,
                            viewport.getGeo().spatialReference),
                        lods = layer.tileInfo.lods,
                    // here we go top down and check for scale differences,
                    // if the current tested scale difference negative so the previous is the correct lod
                    // to ignore some numeric errors we use an epsilon to decide if we stay at the current tested level
                    // our epsilon is 1 percent of the target pixcel resolution
                    // the epsilon is further divided by the lods length, so any overlay should be preserved
                        eps = scalePixResolution / 100 / lods.length,
                        neps = -eps,
                        i, l, d, lod;
                    for (i = 0, l = lods.length; i < l; ++i) {
                        lod = lods[i],
                            d = lod.resolution - scalePixResolution;
                        if (Math.abs(d) < eps) {
                            // accept the lod
                            break;
                        }
                        if (d < neps) {
                            // ok we are to detailed, choose previous
                            --i;
                            break;
                        }
                    }
                    return Math.max(0, Math.min(l - 1, i));
                },

                _renderTiledLayer: function (
                    preserveScale,
                    mapExtent,
                    targetExtent,
                    targetWidth,
                    targetHeight,
                    layer,
                    tileUrls,
                    dynamicUrls
                    ) {
                    var mockMap = {
                        width: targetWidth,
                        height: targetHeight,
                        __visibleDelta: {
                            x: 0,
                            y: 0
                        }
                    };
                    var candidateTileInfo = e_tileUtils.getCandidateTileInfo(mockMap, layer.tileInfo,
                        targetExtent);
                    var layerTileUrls = [];
                    var xTiles = Math.ceil(targetWidth / layer.tileInfo.width);
                    var yTiles = Math.ceil(targetHeight / layer.tileInfo.height);
                    var lang = Locale.getCurrent().getLanguageInspire();
                    for (var x = 0; x <= xTiles; x++) {
                        for (var y = 0; y <= yTiles; y++) {
                            var tileUrl = layer.tileServers[0] + "/" +
                                layer._layer + "/" +
                                candidateTileInfo.lod.level + "/" +
                                (candidateTileInfo.tile.coords.col + x) + "/" +
                                (candidateTileInfo.tile.coords.row + y) + "/" +
                                "256" + "/" +
                                "png8" + "?" +
                                "app_id=" + layer._appID + "&" +
                                "token=" + layer._token +
                                "&lg=" + lang;
                            layerTileUrls.push({
                                "url": this._convertUrlToAbsolute(tileUrl),
                                "row": candidateTileInfo.tile.coords.row + y,
                                "col": candidateTileInfo.tile.coords.col + x
                            });
                        }
                    }
                    tileUrls.push({
                        "tiles": layerTileUrls,
                        "transparency": layer.opacity,
                        "clipOptions": {
                            "offsetX": candidateTileInfo.tile.offsets.x,
                            "offsetY": candidateTileInfo.tile.offsets.y,
                            "width": targetWidth,
                            "height": targetHeight
                        }
                    });

                },

                _renderLayer: function (
                    preserveScale,
                    mapExtent,
                    targetExtent,
                    targetWidth,
                    targetHeight,
                    layer,
                    tileUrls,
                    dynamicUrls,
                    features
                    ) {

                    if (layer instanceof GraphicsLayer) {

                        this._renderGraphicsLayer(preserveScale, mapExtent, targetExtent, targetWidth,
                            targetHeight, layer, tileUrls, dynamicUrls, features);

                    } else if ((layer instanceof ArcGISDynamicMapServiceLayer) || layer instanceof ArcGISTiledMapServiceLayer) {

                        this._renderArfGISLayer(preserveScale, mapExtent, targetExtent, targetWidth,
                            targetHeight, layer, tileUrls, dynamicUrls);

                    } else if (layer instanceof WMSLayer) {

                        this._renderWMSLayer(preserveScale, mapExtent, targetExtent, targetWidth,
                            targetHeight, layer, tileUrls, dynamicUrls);

                    } else if (layer instanceof WMTSLayer) {

                        this._renderWMTSLayer(preserveScale, mapExtent, targetExtent, targetWidth,
                            targetHeight, layer, tileUrls, dynamicUrls);

                    } else {

                        this._renderTiledLayer(preserveScale, mapExtent, targetExtent, targetWidth,
                            targetHeight, layer, tileUrls, dynamicUrls);

                    }
                },

                getLayers: function (esriMap) {
                    var layers = [];
                    d_array.forEach(esriMap.layerIds, function (layerId) {
                        var layer = esriMap.getLayer(layerId);
                        if (layer.visible === true) {
                            layers.push(layer);
                        }
                    }, this);
                    return layers;
                },

                layersJson: function (
                    preserveScale,
                    mapExtent,
                    targetExtent,
                    targetWidth,
                    targetHeight,
                    esriMap
                    ) {
                    var tileUrls = [];
                    var dynamicUrls = [];

                    d_array.forEach(esriMap.layerIds, d_lang.hitch(this, function (layerId) {
                        var layer = esriMap.getLayer(layerId);
                        if (layer.visible === true) {
                            this._renderLayer(preserveScale, mapExtent, targetExtent, targetWidth,
                                targetHeight, layer, tileUrls, dynamicUrls, null);
                        }
                    }));

                    return {
                        "tileLayers": tileUrls,
                        "dynamicLayers": dynamicUrls
                    };
                },

                featuresJson: function (
                    preserveScale,
                    mapExtent,
                    targetExtent,
                    targetWidth,
                    targetHeight,
                    mapModel,
                    esriMap,
                    graphics
                    ) {
                    var features = [];

                    // filter print features
                    var glassPaneLayers = mapModel.getGlassPaneLayer().filterNodes(function (node) {
                        if (node.get("id") === this._historicPointerNodeId || node.get("id").indexOf("IGNORE_ALL") > 0) {
                            return null;
                        }
                        return node;
                    }, this);
                    var opNodes = mapModel.getOperationalLayer().filterNodes(function (node) {
                        //get pois and gipod
                        if (node.service && (node.service.serviceType === "POI" || node.service.serviceType === "GIPOD" || node.service.serviceType === "DirectKML")) {
                            return node;
                        }
                        return null;
                    }, this);
                    glassPaneLayers = glassPaneLayers.concat(opNodes);
                    var layerIDmap = new Hash();
                    d_array.forEach(glassPaneLayers, function (
                        layer,
                        index
                        ) {
                        if (layer.print === true || this.ignoreFeatures === false) {
                            layerIDmap.set(layer.id, index + 1);
                        } else {
                            console.log("layer will not printed " + layer.id + " i " + index);
                            console.log("if you want to print geometries from this layer add a print:true statement in services-init.json");
                        }
                    }, this);

                    if (!graphics) {
                        d_array.forEach(esriMap.graphicsLayerIds, function (
                            layerId,
                            index
                            ) {
                            var layer = esriMap.getLayer(layerId);
                            if (layerIDmap.get(layer.__managed)) { // good idea?!
                                this._renderLayer(preserveScale, mapExtent, targetExtent, targetWidth,
                                    targetHeight, layer, null, null, features);
                            } else {
                                console.log("layer will not printed " + layerId + " i " + index);
                            }
                        }, this);

                        if (esriMap.graphics !== null) {
                            this._renderLayer(preserveScale, mapExtent, targetExtent, targetWidth,
                                targetHeight, esriMap.graphics, null, null, features);
                        }
                    } else {
                        this._renderGraphicsLayerManual(preserveScale, mapExtent, targetExtent, targetWidth,
                            targetHeight, graphics, features);
                    }

                    return features;
                },

                _calculateMapExtent: function (
                    preserveScale,
                    mapExtent,
                    targetWidth,
                    targetHeight,
                    targetExtent,
                    layers
                    ) {

                    var screenWidth = this._mapState.getViewPort().getScreen().getWidth(),
                        screenHeight = this._mapState.getViewPort().getScreen().getHeight(),
                        resultExtent, extentCenterPoint, pixelCenterPoint, pixelPrintLayoutTargetExtent;

                    if (preserveScale) {

                        extentCenterPoint = mapExtent.getCenter();
                        pixelCenterPoint = e_screenUtils.toScreenGeometry(mapExtent, screenWidth,
                            screenHeight,
                            extentCenterPoint);
                        pixelPrintLayoutTargetExtent = new Extent(pixelCenterPoint.x - (targetWidth / 2),
                                pixelCenterPoint.y + (targetHeight / 2),
                                pixelCenterPoint.x + (targetWidth / 2),
                                pixelCenterPoint.y - (targetHeight / 2));//, this._mapState.getSpatialReference());
                        resultExtent = e_screenUtils.toMapGeometry(mapExtent, screenWidth,
                            screenHeight, pixelPrintLayoutTargetExtent);

                    } else {

                        extentCenterPoint = targetExtent.getCenter();
                        pixelCenterPoint = e_screenUtils.toScreenGeometry(mapExtent, screenWidth,
                            screenHeight, extentCenterPoint);

                        pixelPrintLayoutTargetExtent = new Extent({
                            xmin: pixelCenterPoint.x - Math.floor(targetWidth / 2),
                            ymin: pixelCenterPoint.y + Math.floor(targetHeight / 2),
                            xmax: pixelCenterPoint.x + Math.floor(targetWidth / 2),
                            ymax: pixelCenterPoint.y - Math.floor(targetHeight / 2)});

                        var pixelResultExtent = e_screenUtils.toScreenGeometry(mapExtent, screenWidth,
                            screenHeight, targetExtent);

                        var newHeight, newWidth, diff, oldHeight, oldWidth;
                        oldHeight = pixelPrintLayoutTargetExtent.getHeight();
                        oldWidth = pixelPrintLayoutTargetExtent.getWidth();
                        var facBefore = oldWidth / oldHeight;

                        //we are in screeen coordinates here! no normal extent operations work (ymin/ymax are switched)
                        pixelPrintLayoutTargetExtent.xmin = Math.min(pixelPrintLayoutTargetExtent.xmin,
                            pixelResultExtent.xmin);
                        pixelPrintLayoutTargetExtent.ymin = Math.max(pixelPrintLayoutTargetExtent.ymin,
                            pixelResultExtent.ymin);
                        pixelPrintLayoutTargetExtent.xmax = Math.max(pixelPrintLayoutTargetExtent.xmax,
                            pixelResultExtent.xmax);
                        pixelPrintLayoutTargetExtent.ymax = Math.min(pixelPrintLayoutTargetExtent.ymax,
                            pixelResultExtent.ymax);

                        var facAfter = pixelPrintLayoutTargetExtent.getWidth() / pixelPrintLayoutTargetExtent.getHeight();

                        //check what got bigger and resize the according other part
                        if (facAfter > facBefore) {
                            newHeight = Math.abs(oldWidth - pixelPrintLayoutTargetExtent.getWidth()) * facBefore + oldHeight;
                            diff = Math.ceil(Math.abs(pixelPrintLayoutTargetExtent.getHeight() - newHeight) / 2);
                            pixelPrintLayoutTargetExtent.ymin += diff;
                            pixelPrintLayoutTargetExtent.ymax -= diff;
                        } else {
                            newWidth = Math.abs(oldHeight - pixelPrintLayoutTargetExtent.getHeight()) * facBefore + oldWidth;
                            diff = Math.ceil(Math.abs(pixelPrintLayoutTargetExtent.getWidth() - newWidth) / 2);
                            pixelPrintLayoutTargetExtent.xmin -= diff;
                            pixelPrintLayoutTargetExtent.xmax += diff;
                        }

                        resultExtent = e_screenUtils.toMapGeometry(mapExtent, screenWidth,
                            screenHeight, pixelPrintLayoutTargetExtent);

                        d_array.forEach(layers, function (layer) {

                            if (layer instanceof TiledMapServiceLayer) {

                                var viewport = new ViewPort({
                                    screen: {xmin: 0, xmax: targetWidth, ymin: targetHeight, ymax: 0},
                                    geo: resultExtent,
                                    correctAspect: false
                                });
                                var lodlevel = this.findFittingLodIndex(viewport, layer);
                                var newviewport = viewport.createViewPortForLOD(layer.tileInfo.lods[lodlevel]);
                                resultExtent = newviewport.getGeo();

                            }

                        }, this);

                    }

                    return resultExtent;

                },

                // var transparencies = {featureTransparency: 0.5, layerTransparency: 1};
                // var layerdefs = [{layerid: "1", layerdefs: ""}];
                getPrintInfos: function (
                    preserveScale,
                    width,
                    height,
                    graphics,
                    /*optional: set custom extent manually*/
                    userExtent,
                    /*optional: transparency object*/
                    transparencies,
                    /*optional: layer definiton expressions object ("layerdefs=")*/
                    layerdefs,
                    /*optional: lod for bing object*/
                    lodLevel,
                    /*optional: center point for Bing*/
                    centerPoint
                    ) {
                    if (height !== undefined && height !== null) {
                        this.height = height;
                    }
                    if (width !== undefined && width !== null) {
                        this.width = width;
                    }
                    if (transparencies !== undefined && transparencies !== null) {
                        this.transparencies = transparencies;
                    }
                    if (layerdefs !== undefined && layerdefs !== null) {
                        this.layerdefs = layerdefs;
                    }

                    var mapExtent = this._mapState.getExtent();

                    var layers = this.getLayers(this.esriMap);

                    var targetExtent = this._calculateMapExtent(preserveScale, mapExtent, width, height,
                        userExtent, layers);

                    if (centerPoint !== undefined) {
                        this.centerPoint = centerPoint;
                    }
                    var layersJson = this.layersJson(preserveScale, mapExtent, targetExtent, width,
                        height, this.esriMap);
                    var featuresJson = this.featuresJson(preserveScale, mapExtent, targetExtent, width,
                        height, this._mapModel, this.esriMap, graphics);
                    var scalebarJson = this.scalebarJson(preserveScale, mapExtent, targetExtent, width, height);

                    var printInfos = {
                    };

                    printInfos.map = {
                        layers: layersJson,
                        features: featuresJson
                    };
                    printInfos.map[this.scalebarDataName] = scalebarJson;
                    printInfos.map[this.scaleDataName] = scalebarJson.distanceInMap + " " + scalebarJson.unit;

                    this.customExtent = null;

                    return printInfos;
                },

                scalebarJson: function (
                    preserveScale,
                    mapExtent,
                    targetExtent,
                    width,
                    height
                    ) {

                    var minWidth = 150,
                        maxWidth = 350;

                    var p1 = e_screenUtils.toMapPoint(targetExtent, width, height, {x: 0, y: 0});
                    var p2 = e_screenUtils.toMapPoint(targetExtent, width, height, {x: width, y: 0});
                    p1 = this.coordinateTransformer.transform(p1, "EPSG:4326");
                    p2 = this.coordinateTransformer.transform(p2, "EPSG:4326");

                    var dist = e_geodesicUtils.geodesicLengths([
                            new Polyline({
                                paths: [
                                    [
                                        [
                                            p1.x,
                                            p1.y
                                        ],
                                        [
                                            p2.x,
                                            p2.y
                                        ]
                                    ]
                                ],
                                spatialReference: p1.spatialReference
                            })
                        ],
                        e_units.METERS)[0];

                    var unit = "m";

                    dist = dist / width * minWidth;
                    var distanceInMap;

                    if (dist > 10000) {
                        if (dist % 10000 > 0) {
                            distanceInMap = dist + (10000 - dist % 10000);
                        }
                    } else if (dist > 1000) {
                        if (dist % 1000 > 0) {
                            distanceInMap = dist + (1000 - dist % 1000);
                        }
                    } else if (dist > 100) {
                        if (dist % 100 > 0) {
                            distanceInMap = dist + (100 - dist % 100);
                        }
                    } else {
                        if (dist % 10 > 0) {
                            distanceInMap = dist + (10 - dist % 10);
                        }
                    }

                    if (!distanceInMap) {
                        distanceInMap = Math.round(dist);
                    } else {
                        distanceInMap = Math.round(distanceInMap);
                    }

                    if (distanceInMap > 1000) {
                        distanceInMap /= 1000;
                        distanceInMap = Math.round(distanceInMap);
                        dist /= 1000;
                        unit = "km";
                    }

                    var length = Math.round(minWidth / dist * distanceInMap);

                    if (length > maxWidth) {
                        distanceInMap *= 2;
                        length = Math.round(minWidth / dist * distanceInMap);
                    }

                    return {
                        "unit": unit,
                        "fontSize": 16,
                        "transparency": 1,
                        "distanceInMap": distanceInMap,
                        "scalebarLength": length,
                        "linestroke": 2
                    };

                },

                _moveGeometry: function (
                    geometry,
                    offsetX,
                    offsetY
                    ) {
                    var i, j;
                    if (geometry.geometryType === "esriGeometryPolygon") {
                        for (i = 0; i < geometry.rings.length; i++) {
                            var ring = geometry.rings[i];
                            for (j = 0; j < ring.length; j++) {
                                var point = ring[j];
                                point[0] = point[0] + offsetX;
                                point[1] = point[1] + offsetY;
                                ring[j] = point;
                            }
                        }
                    } else if (geometry.geometryType === "esriGeometryPoint") {
                        geometry.x += offsetX;
                        geometry.y += offsetY;
                    } else if (geometry.geometryType === "esriGeometryPolyline") {
                        for (i = 0; i < geometry.paths.length; i++) {
                            var path = geometry.paths[i];
                            for (j = 0; j < path.length; j++) {
                                point = path[j];
                                point[0] = point[0] + offsetX;
                                point[1] = point[1] + offsetY;
                                path[j] = point;
                            }
                        }
                    }
                },
                _addLayerDefinitionsToUrl: function (
                    url,
                    layer
                    ) {
                    if (layer.layerDefinitions && layer.layerDefinitions.length > 0) {
                        var layerDefs = "";
                        d_array.forEach(layer.layerDefinitions, function (
                            layerdef,
                            index
                            ) {
                            if (layerdef) {
                                layerDefs += ((index > 0 && layerDefs !== "" ? ";" : "") + index + ":" + layerdef);
                            }
                        });
                        url += ("&layerdefs=" + escape(layerDefs));
                    }
                    return url;
                },

                readPrintData: function (
                    opts,
                    mapsettings
                    ) {
                    var infos;
                    if (mapsettings.map.useExtent) {
                        if (this.extentProvider && this.extentProvider.getExtent()) {
                            infos = this.getPrintInfos(false, opts.selectedTemplate.mapsize.w,
                                opts.selectedTemplate.mapsize.h, null, this.extentProvider.getExtent());
                        } else {
                            infos = this.getPrintInfos(false, opts.selectedTemplate.mapsize.w,
                                opts.selectedTemplate.mapsize.h, null, this._mapState.getExtent());
                        }
                    } else {
                        infos = this.getPrintInfos(true, opts.selectedTemplate.mapsize.w,
                            opts.selectedTemplate.mapsize.h);
                    }
                    if (this.legendPrinter) {
                        if (mapsettings[this.legendPrinter.KEY]) {
                            infos = d_lang.mixin(infos, this.legendPrinter.readPrintData(opts));
                        } else {
                            var t = {};
                            t[this.legendPrinter.KEY] = this.legendPrinter.EMPTY_TYPE;
                            infos = d_lang.mixin(infos, t);
                        }
                    }
                    return infos;
                }
            });
    });