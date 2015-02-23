/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 04.07.13
 * Time: 16:22
 */
define([
        "../_Handler",
        "../SearchTopics",
        "dojo/_base/declare",
        "dojo/_base/Deferred",
        "dojo/_base/array",
        "dojo/keys",
        "base/store/GeolocatorStore",
        "base/store/NavTeqSearchStore",
        "base/analytics/AnalyticsConstants",
        "ct/request",
        "ct/_when",
        "ct/array",
        "esri/geometry/jsonUtils"
    ],
    function (
        _Handler,
        SearchTopics,
        declare,
        Deferred,
        d_array,
        d_keys,
        GeolocatorStore,
        NavTeqSearchStore,
        AnalyticsConstants,
        ct_request,
        ct_when,
        ct_array,
        e_geometryUtils
        ) {
        return declare([_Handler],
            {
                type: "GEOLOCATOR",
                useNavteqFallback: true,
                priority: 0,

                constructor: function () {

                },

                activate: function () {
                    this.i18n = this._i18n.get();
                    if (this.i18n && this.i18n.ui && this.i18n.ui.searchTypes) {
                        this.typeLabel = this.i18n.ui.searchTypes[this.type];
                    } else {
                        this.typeLabel = this.type;
                    }
                },

                setParcelUrlProvider: function (t) {
                    this.parcelUrlProvider = t;
                    var parcelRetrieval = this.parcelRetrieval;
                    parcelRetrieval.url = t.get("parcelUrl");
                    parcelRetrieval.parcelIDFieldName = t.get("parcelIDFieldName");
                },

                setGeolocatorUrlProvider: function (t) {
                    this.geolocatorUrlProvider = t;
                    this.geolocatorSuggestStoreParameters.url = t.get("suggestUrl");
                    this.geolocatorStoreParameters.url = t.get("locationUrl");
                    this._geolocatorSuggestStore = new GeolocatorStore(this.geolocatorSuggestStoreParameters);
                    this._geolocatorStore = new GeolocatorStore(this.geolocatorStoreParameters);
                    this._navteqStore = new NavTeqSearchStore(this.navteqStoreParameters);
                },

                _onSelectItem: function (item) {
                    var d = new Deferred();
                    this.inherited(arguments);
                    //ok, now we query our complete result or display it directly if we have a geometry
                    if (item) {
                        if (item.geometry) {
                            this._broadCast(SearchTopics.SELECTED_RESULT, {result: item});
                            d.resolve(item);
                            return;
                        }
                        this._broadCast(SearchTopics.HANDLER_START);
                        ct_when(this._geolocatorStore.query(this.toSuggestQuery(item.value), {count: 1}),
                            function (res) {
                                ct_when(this._parseGeolocatorSelectionResult(res), function (result) {
                                    d.resolve(result);
                                });
                            }, function (err) {
                                console.error(err);
                                this._broadCast(SearchTopics.HANDLER_COMPLETE);
                                d.resolve([]);
                            }, this);
                    }
                    return d;
                },

                _parseGeolocatorSelectionResult: function (res) {
                    var d = new Deferred();
                    if (res && res[0]) {
                        var item = res[0];
                        if (ct_array.arrayFirstIndexOf(this.extentTypes, item.LocationType) > -1) {
                            item.zoomToExtent = true;
                        }
                        if (item.LocationType === "perceel") {
                            //if we have a parcel we need to get the geometry
                            item.type = "SEARCH_RESULT_PARCEL";
                            ct_when(this._retrieveParcelGeometry(item), function (result) {
                                this._broadCast(SearchTopics.SELECTED_RESULT, {
                                    result: result
                                });
                                this._broadCast(SearchTopics.HANDLER_COMPLETE);
                                d.resolve(result);
                            },this);
                        } else {
                            item.type = "SEARCH_RESULT_ADDRESS";
                            this._broadCast(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                                eventType: AnalyticsConstants.EVENT_TYPES.SEARCH_ADDRESS,
                                eventCategory: AnalyticsConstants.CATEGORIES.SEARCH,
                                eventValue: this.getAnalyticsValue(item.value)
                            });
                            this._broadCast(SearchTopics.SELECTED_RESULT, {
                                result: item
                            });
                            this._broadCast(SearchTopics.HANDLER_COMPLETE);
                            d.resolve(item);
                        }
                    } else {
                        this._broadCast(SearchTopics.HANDLER_COMPLETE);
                        d.resolve([]);
                    }
                    return d;
                },

                _retrieveParcelGeometry: function (item) {
                    var d = new Deferred();
                    var opts = this.parcelRetrieval;
                    var content = {};

                    var parcelID = item[opts.itemIdentifier];
                    if (opts.searchOnDisplayField) {
                        content.text = parcelID;
                    } else {
                        content.where = opts.parcelIDFieldName + " LIKE '" + parcelID + "'";
                    }
                    content.f = "json";

                    var sr = this.mapState.getExtent().spatialReference;
                    content.outSR = sr.wkid;
                    ct_when(ct_request.request({
                        url: opts.url,
                        content: content
                    }), function (res) {
                        if (res && res.features && res.features[0]) {
                            var tmp = res.features[0].geometry;
                            tmp.spatialReference = res.spatialReference;
                            item.geometry = e_geometryUtils.fromJson(tmp);

                            this._broadCast(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                                eventType: AnalyticsConstants.EVENT_TYPES.SEARCH_PARCEL,
                                eventCategory: AnalyticsConstants.CATEGORIES.SEARCH,
                                eventValue: this.getAnalyticsValue(item.value)
                            });

                            item.preventDraw = true;

                            this._broadCast(SearchTopics.SELECTED_RESULT, {
                                result: item
                            });
                            this._broadCast("agiv/parcelselection/PARCEL", {
                                parcel: item
                            });
                            this._broadCast("agiv/parcelselection/HIDE_INFO");
                            d.resolve(res);
                        } else {
                            d.resolve([]);
                        }
                        this._broadCast(SearchTopics.HANDLER_COMPLETE);
                    }, function (err) {
                        this._broadCast(SearchTopics.HANDLER_COMPLETE);
                        d.resolve([]);
                    }, this);
                    return d;
                },

                _selectGeolocatorResult: function (
                    geolocRes,
                    val,
                    areParcels
                    ) {
                    if (geolocRes && geolocRes.length > 0) {
                        if (this._goToFirstResult) {
                            this._onSelectItem(geolocRes[0]);
                        } else {
                            var label;
                            if (areParcels) {
                                label = this.i18n.ui.searchTypes["PARCEL"];
                            } else {
                                label = this.typeLabel;
                            }
                            this._broadCast(SearchTopics.NEW_RESULT, {
                                resultset: {
                                    results: geolocRes,
                                    query: val,
                                    typeLabel: label,
                                    priority: this.priority
                                }
                            });
                        }
                    }
                },

                _isParcel: function (n) {
                    return /\d{5}[A-Z]{1}\d{4}\/\d{2}[A-Z_]{1}\d{3}/.test(n);
                },

                _modifyItems: function (res) {
                    d_array.forEach(res, function (item) {

                        if (this._isParcel(item.value)) {
                            item["type"] = "SEARCH_RESULT_PARCEL";
                            //we draw it with the parcelselection bundle
                            item.preventDraw = true;
                        } else {
                            item["type"] = "SEARCH_RESULT_ADDRESS";
                        }
                        item.canSelectFirst = true;

                    }, this);
                    return res;
                },

                _checkForParcels: function (res) {
                    var areParcels = true;
                    d_array.forEach(res, function (item) {

                        if (!this._isParcel(item.value)) {
                            areParcels = false;
                        }

                    }, this);

                    return areParcels;
                },

                _handleValueChange: function (evt) {
                    var d = new Deferred();
                    this.inherited(arguments);

                    this._goToFirstResult = evt.getProperty && evt.getProperty("_evt").keyCode === d_keys.ENTER;
                    this._broadCast(SearchTopics.HANDLER_START);

                    var val = evt.searchValue ? evt.searchValue : evt._properties.entries.newValue;
                    var query = this.toSuggestQuery(val);

                    var gelocHasFinished = new Deferred();
                    ct_when(this._geolocatorSuggestStore.query(query, this.geolocatorSuggestQueryOptions),
                        function (res) {
                            res = res || [];
                            gelocHasFinished.resolve(res);
                        }, function (err) {
                            gelocHasFinished.resolve([]);
                        }, this);

                    if (this.useNavteqFallback) {
                        ct_when(this._navteqStore.query(query, this.navteqQueryOptions), function (res) {

                            ct_when(gelocHasFinished, function (geolocRes) {

                                if ((!geolocRes || geolocRes.length === 0 ) && res && res.length > 0) {

                                    res = this._modifyItems(res);

                                    this._selectGeolocatorResult(res, val, this._checkForParcels(res));
                                    this._firstResult = res;
                                    d.resolve(res);

                                } else {

                                    this._selectGeolocatorResult(geolocRes, val);
                                    this._firstResult = geolocRes;
                                    d.resolve(geolocRes);

                                }

                                this._broadCast(SearchTopics.HANDLER_COMPLETE);

                            }, this);
                        }, function (err) {
                            console.error(err);
                            this._broadCast(SearchTopics.HANDLER_COMPLETE);
                        }, this);
                    } else {
                        ct_when(gelocHasFinished, function (geolocRes) {

                            geolocRes = this._modifyItems(geolocRes);
                            this._selectGeolocatorResult(geolocRes, val,
                                this._checkForParcels(geolocRes));
                            this._firstResult = geolocRes;
                            d.resolve(geolocRes);
                            this._broadCast(SearchTopics.HANDLER_COMPLETE);

                        }, this);
                    }
                    return d;
                },

                _handleGoToFirst: function (evt) {
                    this._onSelectItem(this._firstResult[0]);
                },

                triggerSearch: function (searchVal) {
                    var d = new Deferred();
                    ct_when(this._handleValueChange({
                        searchValue: searchVal
                    }), function (result) {
                        if (result.length > 0) {
                            ct_when(this._onSelectItem(result[0]), function (selectedItem) {
                                d.resolve(selectedItem);
                            }, this);
                        } else {
                            d.resolve([]);
                        }
                    }, this);
                    return d;
                }
            }
        );
    }
);