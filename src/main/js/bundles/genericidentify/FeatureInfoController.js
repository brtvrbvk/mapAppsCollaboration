define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/Deferred",
        "dojo/string",
        "dojo/sniff",
        "ct/_lang",
        "ct/_when",
        "ct/_Connect",
        "ct/Stateful",
        "ct/mapping/geometry",
        "base/analytics/AnalyticsConstants",
        "base/store/gipod/GipodStore"
    ],
    function (
        d_lang,
        declare,
        d_array,
        Deferred,
        d_string,
        d_sniff,
        ct_lang,
        ct_when,
        _Connect,
        Stateful,
        geometry,
        AnalyticsConstants,
        GipodStore
        ) {
        /**
         * COPYRIGHT 2012 con terra GmbH Germany
         * @fileOverview This file provides the means to perform feature info requests.
         */
        return declare([
                Stateful,
                _Connect
            ],
            /**
             * @lends ct.bundles.featureinfo.FeatureInfoController.prototype
             */
            {

                /**
                 * @constructs
                 */
                constructor: function () {
                },

                activate: function () {
                    this.i18n = this._i18n.get();
                    this.clickTolerance = ct_lang.chk(this.clickTolerance, 5);
                    this.showNoQueryLayersFoundMsg = ct_lang.chk(this.showNoQueryLayersFoundMsg, true);
                    this.noQueryLayersFoundMsg = this._i18n.get().ui.noQueryLayersFound;

                    this._municipalityLink = d_string.substitute(this.municipalityLink, {
                        year: this.year,
                        municipality: "${municipality}"
                    });
                    this._stores = {};
                    this._isTouch = d_sniff("ios") || d_sniff("android");

                },

                deactivate: function () {
                    this.deactivateFeatureInfo();
                },

                activateFeatureInfo: function (params) {
                    this.deactivateFeatureInfo();
                    this.connect("click", this._mapState, "onClick", this, function (params) {
                        this._isHistoricMapClicked = false;
                        this.executeFeatureInfo(params);
                    });
                    if (this._historicMap) {
                        this.connect("click", this._secondMapState, "onClick", this, function (params) {
                            this._isHistoricMapClicked = true;
                            this.executeFeatureInfo(params);
                        });
                    }
                },

                deactivateFeatureInfo: function () {
                    this.disconnect("click");
                },

                executeFeatureInfoOnGraphic: function (params) {
                    try {
                        var content = {
                            storeQueries: [], // required, a rule for ContentRegistration (see generic identify bundle)
                            geometry: params.geometry,
                            graphic: params.graphic
                        };
                        var context = d_lang.mixin({
                            source: "featureInfo",
                            managedLayerId: params.graphic.getLayer().__managed
                        }, params.context || {});
                        this._showFeatureInfo(content, context);
                    } catch (e) {
                        console.error("FeatureInfoController.executeFeatureInfo: Unexpected Exception: " + e,
                            e);
                        throw e;
                    }
                },

                /**
                 * Performs the feature info on the given geometry (must be a Point)
                 */
                executeFeatureInfo: function (params) {
                    try {
                        console.debug("FEATUREINFO ", params);
                        var geo = params.mapPoint;
                        var graphic = params.graphic;
                        var attributes = graphic && graphic.attributes;

                        if ((graphic && attributes && attributes.isCluster) ||
                            (graphic && attributes && attributes.clusterCount > 1)) {
                            //we need to zoom in for clustered POIs
                            this._esriMap._extentUtil({numLevels: 2, mapAnchor: params.mapPoint, screenAnchor: params.screenPoint});
                            return;

                        }

                        var clickTolerance = this.clickTolerance;
                        var queryGeometry = clickTolerance ? this._calcExtentWithPixelTolerance(geo,
                            this.clickTolerance) : geo;
                        var query = this._buildGeometryQuery(queryGeometry);

                        this.eventService.postEvent("agiv/genericidentify/loading/START");

                        ct_when(this._mapModelStoreHelper.getStoreInfos(), function (infos) {

                            var storeQueries = this._createStoreQueries(infos, query);
                            var content = {
                                storeQueries: storeQueries,
                                geometry: geo,
                                graphic: graphic
                            };

                            var context = d_lang.mixin({
                                position: {
                                    l: params.pageX,
                                    t: params.pageY
                                },
                                store: attributes && attributes.store,
                                // not used currently , but added if needed
                                source: "featureInfo"
                            }, params.context || {});

//                        if (graphic && graphic.attributes && graphic.attributes.type && graphic.attributes.type === "POI" && this._poiFocus) {
//                            content.poiFocus = this._poiFocus;
//                        }
                            this._showFeatureInfo(content, context);

                        }, function (error) {
                            //TODO
                            this.eventService.postEvent("agiv/genericidentify/loading/END");
                        }, this);

                    } catch (e) {
                        console.error("FeatureInfoController.executeFeatureInfo: Unexpected Exception: " + e,
                            e);
                        throw e;
                    }
                },

                _showFeatureInfo: function (
                    content,
                    context
                    ) {
                    var contentViewer = this._contentViewer;
                    if (!this.alwaysEnableFeatureInfo) {
                        contentViewer._defaultRules = [];
                    }
                    content.id = "featureInfo";
                    if (this._isHistoricMapClicked) {
                        context.splitviewmap = true;
                        contentViewer.infoViewer._map = this._historicMap;
                        contentViewer.infoViewer._esriMap = this._historicMap.esriMap;
                        contentViewer.infoViewer._mapState = this._secondMapState;
                        contentViewer.infoViewer._mapModel = this._historicMap.mapModel;
                    } else {
                        contentViewer.infoViewer._map = this._map;
                        contentViewer.infoViewer._esriMap = this._esriMap;
                        contentViewer.infoViewer._mapState = this._mapState;
                        contentViewer.infoViewer._mapModel = this._map.mapModel;
                    }

                    this._createFeatureInfos(content, context, true);

                },

                _closeExistingFeatureInfo: function () {
                    this._contentViewer.closeContentInfo(this._contentViewer.findContentInfoById("featureInfo"));
                },

                _createStoreQueries: function (
                    storeInfos,
                    query
                    ) {
                    return d_array.map(storeInfos, function (storeInfo) {
                        var queryItem = ct_lang.copyAllProps({}, storeInfo);
                        queryItem.executeQuery = function (queryOpts) {
                            return ct_when(queryItem.idProperty, function (idProperty) {
                                queryItem.idProperty = idProperty;
                                queryOpts = d_lang.mixin({}, queryOpts || {});
                                queryOpts.fields = d_lang.mixin(queryOpts.fields || {}, {
                                    geometry: false
                                });
                                queryOpts.maxmodel = true;
                                return this.store.query(query, queryOpts);
                            }, this);
                        };
                        return queryItem;
                    }, this);
                },

                _buildGeometryQuery: function (geo) {
                    return {
                        geometry: {
                            $intersects: geo
                        }
                    };
                },

                _calcExtentWithPixelTolerance: function (
                    geoPoint,
                    clickTolerance
                    ) {
                    var viewport = this._mapState.getViewPort();
                    return viewport.toGeo(geometry.createExtent({
                        center: viewport.screen.getCenter(),
                        width: clickTolerance,
                        height: clickTolerance
                    })).centerAt(geoPoint);
                },

                showFeatureInfos: function (
                    evt,
                    context,
                    preventRecenter
                    ) {

                    var content = evt;
                    if (evt && evt.getProperty) {
                        content = evt && evt.getProperty("content");
                        context = evt && evt.getProperty("context");
                    }
                    if (content) {
                        context.source = "featureInfo";
                        content.id = "featureInfo";
                        this._createFeatureInfos(content, context, preventRecenter);
                    }

                },

                identifyNode: function (evt) {
                    var node = evt && evt.getProperty("node");
                    if (node) {
                        if (this["identify" + node.service.serviceType]) {
                            this["identify" + node.service.serviceType](node);
                        }
                    }
                },

                identifyWMS: function (
                    node
                    ) {

                    var layer = node.children[0];

                    var nearestFeature = layer.nearestFeature;
                    var geometry = nearestFeature && nearestFeature.geometry;
                    geometry = geometry.getCentroid ?
                        geometry.getCentroid() :
                        geometry.getCenter ?
                            geometry.getCenter() :
                            geometry.getPoint ?
                                geometry.getPoint(0, Math.round(geometry.paths[0].length / 2)) :
                                geometry;

                    ct_when(this._mapModelStoreHelper.getStoreInfo(node), function (infos) {

                        var clickTolerance = this.clickTolerance;
                        var queryGeometry = clickTolerance ? this._calcExtentWithPixelTolerance(geometry,
                            this.clickTolerance) : geometry;
                        var query = this._buildGeometryQuery(queryGeometry);

                        var storeQueries = this._createStoreQueries(infos, query);

                        var infoWidgetTitle = node.title;
                        if (nearestFeature.title) {
                            infoWidgetTitle = nearestFeature.title + " (" + node.title + ")";
                        }
                        var content = {
                            geometry: geometry,
                            title: infoWidgetTitle
                        };

                        var context = d_lang.mixin(this.context, {
                            query: storeQueries[0],
                            backEnabled: false,
                            infotype: "WMS_FEATURE_INFO"
                        });
                        this._contentViewer.showContentInfo(content, context);
                        this._mapState.centerAt(content.geometry);

                    }, function (error) {
                        //TODO
                    }, this);

                },

                identifyPOI: function (node) {

                    if (node) {
                        node = node.children[0];
                        var store = node.store;

                        ct_when(store.query({
                            id: {
                                $eqw: node.nearestFeature.id
                            }
                        }, {
                        }), function (res) {
                            if (res && res.length > 0) {
                                var content = {
                                        geometry: node.nearestFeature.geometry,
                                        contentDeferred: res[0],
                                        title: res[0].poitypetitle,
                                        municipalityLink: this._municipalityLink
                                    },
                                    context = {
                                        infotype: "POI_FEATURE_INFO"
                                    };
                                this._contentViewer.showContentInfo(content, context);
                                this._mapState.centerAt(content.geometry);
                            }
                        }, function (error) {
//                            d.reject(error);
                        }, this);

                    }

                },

                identifyGIPOD: function (node) {

                    node.context.infotype = "GIPOD";
                    this._placeWidget(node.content, node.context);
                    if (node.content.scale) {
                        this._mapState.centerAndZoomToScale(node.content.geometry, node.content.scale);
                    } else {
                        this._mapState.centerAt(node.content.geometry);
                    }

                },

                _buildPOIEventValue: function (
                    attr,
                    eventValue
                    ) {

                    var addr = attr.address;
                    return eventValue + ", " + addr.street + " " + addr.streetnumber +
                        ((addr.boxnumber && addr.boxnumber.length > 0) ? (" ") + addr.boxnumber : "") +
                        ", " + addr.postalcode + " " + addr.municipality + " [" + attr.poitype + "]";

                },

                _createFeatureInfos: function (
                    content,
                    context,
                    preventRecenter
                    ) {

                    context = context || {};
                    var graphic = content.graphic;
                    var eventValue, eventType;
                    var eventCategory = AnalyticsConstants.CATEGORIES.IDENTIFY_ON_MAP;

                    content.municipalityLink = this._municipalityLink;

                    if (graphic) {
                        //we have a graphic, so POI or drawing or search result or parcel...
                        var attr = graphic.attributes;
                        context = d_lang.mixin(context, graphic.context || attr.context || {});
                        context.infotype = attr.type;
                        content = d_lang.mixin(content, {
                            graphic: graphic
                        });

                        if (attr.type) {

                            switch (attr.type) {

                                case "POI":

                                    eventValue = attr.primaryLabel;
                                    if (attr.address) {
                                        eventValue = this._buildPOIEventValue(attr, eventValue);
                                    }
                                    eventType = AnalyticsConstants.EVENT_TYPES.IDENTIFY_POI;
                                    this._createPOIInfo(content, context);
                                    preventRecenter = false;

                                    break;

                                case "SEARCH_RESULT_POI":

                                    eventValue = attr.primaryLabel;
                                    if (attr.address) {
                                        eventValue = this._buildPOIEventValue(attr, eventValue);
                                    }
                                    context.managedLayerId = graphic.getLayer().__managed;
                                    eventType = AnalyticsConstants.EVENT_TYPES.IDENTIFY_POI;
                                    this._createPOIInfo(content, context);
                                    preventRecenter = false;

                                    break;

                                case "GIPOD":

                                    eventValue = "";
                                    d_array.forEach(attr.items, function (item) {
                                        eventValue += item.cities.join(", ");
                                    }, this);

                                    eventType = AnalyticsConstants.EVENT_TYPES["IDENTIFY_" + attr.gipodType.toUpperCase()];
                                    eventCategory = AnalyticsConstants.CATEGORIES.IDENTIFY;
                                    context.detailView = "GIPOD_FEATURE_INFO";

                                    var oldStoreProps = context.store.datasource || context.store;
                                    var plugins = oldStoreProps._plugins;
                                    var filterOptions = "", scaleThreshold = "";
                                    d_array.forEach(plugins, function (plugin) {
                                        if (plugin["filterOptions"]) {
                                            filterOptions = plugin["filterOptions"];
                                        } else if (plugin["scaleThreshold"]) {
                                            scaleThreshold = plugin["scaleThreshold"];
                                        }
                                    });
                                    var store = new GipodStore({
                                        target: oldStoreProps.baseUrl,
                                        id: oldStoreProps.id,
                                        gipodType: oldStoreProps.gipodType,
                                        fixedQueryOptions: oldStoreProps.fixedQueryOptions,
                                        queryOptions: oldStoreProps.queryOptions,
                                        filterOptions: filterOptions,
                                        scaleThreshold: scaleThreshold
                                    });
                                    context.store = store;
                                    this._createDefaultInfo(content, context);
                                    preventRecenter = false;
                                    break;

                                case "SEARCH_RESULT_PARCEL":

                                    eventValue = attr.FormattedAddress || attr.title;
                                    eventType = AnalyticsConstants.EVENT_TYPES.IDENTIFY_PARCEL;
                                    eventCategory = AnalyticsConstants.CATEGORIES.IDENTIFY;
                                    context.managedLayerId = graphic.getLayer().__managed;
                                    this._createParcelInfo(content, context);
                                    preventRecenter = false;
                                    break;

                                case "SEARCH_RESULT_COORDINATE":

                                    context.managedLayerId = graphic.getLayer().__managed;
                                    content.geometry = graphic.geometry;
                                    this._createParcelInfo(content, context);
                                    preventRecenter = false;

                                    break;

                                case "DRAWING":

                                    if (attr.comment) {
                                        eventValue = attr.comment + ", " + attr.geometryType;
                                        eventType = AnalyticsConstants.EVENT_TYPES.IDENTIFY_GEOMETRY;
                                    }
                                    this._createDefaultInfo(content, context);
                                    preventRecenter = true;

                                    break;

                                case "ROUTING":

                                    this._createDefaultInfo(content, context);
                                    preventRecenter = false;

                                    break;

                                case "RESULT_IDENTIFY":
                                    preventRecenter = this._randomFeatureInfo(content, context, eventCategory);
                                    break;

                                default:
                                    if (attr.type === "SEARCH_RESULT_ADDRESS") {
                                        eventValue = attr.FormattedAddress || attr.title;
                                        eventType = AnalyticsConstants.EVENT_TYPES.IDENTIFY_ADDRESS;
                                        eventCategory = AnalyticsConstants.CATEGORIES.IDENTIFY;
                                        context.managedLayerId = graphic.getLayer().__managed;
                                        content.geometry = graphic.geometry;
                                    }
                                    content.geocodeDeferred = attr;
                                    this._createDefaultInfo(content, context);
                                    preventRecenter = false;

                                    break;

                            }
                        } else if (this.alwaysEnableFeatureInfo) {
                            preventRecenter = this._randomFeatureInfo(content, context, eventCategory);
                        } else {
                            return;
                        }

                    } else if (this.alwaysEnableFeatureInfo) {
                        preventRecenter = this._randomFeatureInfo(content, context, eventCategory);
                    } else {
                        return;
                    }

                    if (eventValue && eventType) {
                        this._fireTrackEvent(eventValue, eventType, eventCategory);
                    }

                    if (!preventRecenter) {
                        this._mapState.centerAt(content.geometry);
                    }

                },

                _randomFeatureInfo: function (
                    content,
                    context,
                    eventCategory
                    ) {

                    var geocodeDef = new Deferred();

                    context.infotype = "RANDOM_FEATURE_INFO";
                    context = this._checkDeviceDependendContext(content, context);

                    if (!content.geocodeDeferred) {
                        content.geocodeDeferred = geocodeDef;
                        ct_when(this._geocodeItem(content.geometry), function (resp) {

                            geocodeDef.resolve(resp);
                            this.eventService.postEvent("agiv/genericidentify/loading/END");
//BartVerbeeck Bug32960
                            //content.title = resp.FormattedAddress || resp.title;
                            content.type = "RESULT_IDENTIFY";

                            var eventValue = "random point, " + resp.FormattedAddress || resp.title,
                                eventType = AnalyticsConstants.EVENT_TYPES.IDENTIFY_RANDOM_POINT;
                            this._fireTrackEvent(eventValue, eventType, eventCategory);

                        }, function (error) {
                            geocodeDef.reject(error);
                            this.eventService.postEvent("agiv/genericidentify/loading/END");
                        }, this);
                    }
                    this._placeWidget(content, context);
                    return false;
                },

                showPreviousFeatureInfo: function () {

                    this.showFeatureInfos(this._previousContent, this._previousContext, true);

                },

                closeFeatureInfo: function () {
                    this._closeExistingFeatureInfo();
                },

                showNextFeatureInfo: function (evt) {

                    this._previousContent = evt && evt.getProperty("content");
                    this._previousContext = evt && evt.getProperty("context");
                    var
                        nextContent = evt && evt.getProperty("nextContent"),
                        nextContext = evt && evt.getProperty("nextContext");

                    nextContext.source = "featureInfo";
                    nextContent.id = "featureInfo";

                    this._placeWidget(nextContent, nextContext);

                },

                _checkDeviceDependendContext: function (
                    content,
                    context
                    ) {
                    var type = context.infotype;
                    context.infotype = context.infotype + (this._isTouch ? "_TOUCH" : "");
                    var widget = this._contentViewer.resolveContentWidget(content, context);
                    if (widget) {
                        widget.destroyRecursive();
                        return context;
                    } else {
                        context.infotype = type;
                        this._contentViewer.closeAllContentInfos();
                        return context;
                    }
                },

                _geocodeItem: function (
                    point
                    ) {
                    var d = new Deferred();
                    var tp = this.transformer.transform(point, 4326);
                    var options = {
                        count: 1
                    };
                    var query = {
                        title: {
                            $suggest: tp.y + "," + tp.x
                        }
                    };
                    ct_when(this.agivGeocoder.query(query, options), function (resp) {

                        d.resolve(resp[0]);

                    }, function (error) {
                        var errorString;
                        if (error.dojoType === "timeout") {
                            errorString = "timeout exceeded";
                        } else if (error.status === 400) {
                            errorString = this.i18n.ui.crabErrorMessage;
                        } else if (error.status === 500) {
                            errorString = this.i18n.ui.loadErrorMessage;
                        } else {
                            errorString = error.message;
                        }
                        d.reject(errorString);
                    }, this);
                    return d;
                },

                _placeWidget: function (
                    content,
                    context
                    ) {
                    this.closeFeatureInfo();
                    content.id = "featureInfo";
                    this._contentViewer.showContentInfo(content, context);

                },

                _fireTrackEvent: function (
                    value,
                    eventType,
                    eventCategory
                    ) {
                    this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                        eventType: eventType,
                        eventCategory: eventCategory,
                        eventValue: value
                    });
                },

                _createDefaultInfo: function (
                    content,
                    context
                    ) {
                    context.showTrashCan = true;
                    context = this._checkDeviceDependendContext(content, context);
                    this._placeWidget(content, context);
                    this.eventService.postEvent("agiv/genericidentify/loading/END");
                },

                _createParcelInfo: function (
                    content,
                    context
                    ) {
                    content.geocodeDeferred = new Deferred();
                    context.showTrashCan = true;
                    ct_when(this._geocodeItem(content.geometry), function (resp) {
                        this.eventService.postEvent("agiv/genericidentify/loading/END");
                        content.geocodeDeferred.resolve(resp);
                    }, function (err) {
                        content.geocodeDeferred.reject(err);
                        this.eventService.postEvent("agiv/genericidentify/loading/END");
                    }, this);
                    context = this._checkDeviceDependendContext(content, context);
                    this._placeWidget(content, context);
                },

                _createPOIInfo: function (
                    content,
                    context
                    ) {
                    var attr = content.graphic.attributes;
                    var geom = content.graphic.geometry;
                    var store = context.store;
                    var poi = content.poi;
                    var poiFocus = this._poiFocus;
                    if (!store) {
                        store = poiFocus.getStoreForType(attr.poitype);
                    }
                    if (attr.poitypetitle) {
                        content.title = attr.poitypetitle
                    }

                    if (poiFocus && geom) {

                        var contentDeferred = new Deferred();

                        context.infotype = "POI_FEATURE_INFO";

                        if (poi) {
                            //we already have a poi, show it
                            content.contentDeferred = contentDeferred;
                            content.title = poi.poitypetitle;
                            context = this._checkDeviceDependendContext(content, context);
                            this._placeWidget(content, context);
                            this._fetchPOIMaxModel(store, attr.id, geom, contentDeferred);
                            return;
                        }

                        this._lastQuery = poiFocus.queryAllStores(geom);
                        ct_when(this._lastQuery, function (resp) {
                            // empty result means a search result graphic is clicked anywhere but on the bottom side
                            content.contentDeferred = contentDeferred;
                            if (resp && resp.length <= 1 && resp[0]) {

                                content.title = resp[0].poitypetitle;
                                if (store) {

                                    this._fetchPOIMaxModel(store, attr.id, geom, contentDeferred);
                                    this.eventService.postEvent("agiv/genericidentify/loading/END");

                                } else {
                                    contentDeferred.reject("Error while retrieving POI info");
                                }

                            } else if (resp && resp.length > 1) {

                                context.infotype = "MULTI_POI_FEATURE_INFO";
                                contentDeferred.resolve(resp);
                                this.eventService.postEvent("agiv/genericidentify/loading/END");
                            }
                            context = this._checkDeviceDependendContext(content, context);
                            this._placeWidget(content, context);
                        }, function () {
                            if (store) {
                                content.contentDeferred = contentDeferred;
                                this._fetchPOIMaxModel(store, attr.id, geom, contentDeferred);
                                this.eventService.postEvent("agiv/genericidentify/loading/END");
                                context = this._checkDeviceDependendContext(content, context);
                                this._placeWidget(content, context);
                            }
                        }, this);

                    }
                },

                _fetchPOIMaxModel: function (
                    store,
                    id,
                    geom,
                    contentDeferred
                    ) {

                    ct_when(store.get(id, {
                        preventCacheUpdate: true,
                        srsOut: geom.spatialReference.wkid
                    }), function (resp) {

                        if (resp && resp.length > 0) {
                            contentDeferred.resolve(resp[0]);
                            this.eventService.postEvent("agiv/genericidentify/loading/END");
                            return;
                        }
                        contentDeferred.reject("Error while retrieving POI info");

                    }, function (err) {
                        contentDeferred.reject(err);
                        this.eventService.postEvent("agiv/genericidentify/loading/END");
                    }, this);

                }
            });
    });