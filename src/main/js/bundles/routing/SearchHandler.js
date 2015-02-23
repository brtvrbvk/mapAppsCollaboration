/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 04.07.13
 * Time: 16:22
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/Deferred",
        "base/store/GeolocatorStore",
        "base/store/NavTeqSearchStore",
        "ct/Stateful",
        "ct/request",
        "ct/_when",
        "ct/array"
    ],
    function (
        declare,
        d_lang,
        Deferred,
        GeolocatorStore,
        NavTeqSearchStore,
        Stateful,
        ct_request,
        ct_when,
        ct_array
        ) {
        var SearchHandler = declare([Stateful],
            {
                useNavteqFallback: true,

                constructor: function () {

                },

                activate: function () {
                    this.i18n = this._i18n.get();
                    this.geolocatorSuggestStoreParameters.geolocatorUrlProvider = this.geolocatorUrlProvider;
                    this.geolocatorStoreParameters.geolocatorUrlProvider = this.geolocatorUrlProvider;
                    this._geolocatorSuggestStore = new GeolocatorStore(this.geolocatorSuggestStoreParameters);
                    this._geolocatorStore = new GeolocatorStore(this.geolocatorStoreParameters);
                    this._navteqStore = new NavTeqSearchStore(this.navteqStoreParameters);
                },

                queryQualifiedResult: function (item) {
                    this.inherited(arguments);
                    //ok, now we query our complete result or display it directly if we have a geometry
                    if (item.geometry) {
                        return;
                    }
                    var d = new Deferred();
                    ct_when(this._geolocatorStore.query(this.toSuggestQuery(item.value),
                        {count: 1}), function (res) {
                        d.resolve(this._parseGeolocatorSelectionResult(res));
                    }, function (err) {
                        console.error(err);
                    }, this);
                    return d;
                },

                _parseGeolocatorSelectionResult: function (res) {
                    if (res && res[0]) {
                        var item = res[0];
                        if (ct_array.arrayFirstIndexOf(item.LocationType,
                            this.extentTypes) > -1) {
                            item.zoomToExtent = true;
                        }
                        if (item.LocationType === "perceel") {
                            //if we have a parcel we need to get the geometry
                            //TODO
                        } else {
                            return item;
                        }
                    } else {
                        return null;
                    }
                },

                toSuggestQuery: function (val) {
                    return {
                        $suggest: val.toLowerCase()
                    }
                },

                query: function (
                    query,
                    opts
                    ) {
                    var resultDef = new Deferred({
                        cancel: false
                    });
                    var gelocHasFinished = new Deferred();
                    var geolocOptions = d_lang.mixin(opts,
                        this.geolocatorSuggestQueryOptions);
                    ct_when(this._geolocatorSuggestStore.query(query, geolocOptions),
                        function (res) {
                            res = res || [];
                            if (res && res.length > 0) {
                                res.total = res.length;
                            }
                            gelocHasFinished.resolve(res);
                        }, function (err) {
                            gelocHasFinished.resolve([]);
                        }, this);

                    if (this.useNavteqFallback) {
                        var navteqOptions = d_lang.mixin(opts, this.navteqQueryOptions);
                        ct_when(this._navteqStore.query(query, navteqOptions),
                            function (res) {
                                ct_when(gelocHasFinished, function (geolocRes) {
                                    if (!geolocRes || geolocRes.length === 0) {
                                        if (res) {
                                            res.total = res.length;
                                        } else {
                                            res = {
                                                total: 0
                                            }
                                        }
                                        resultDef.resolve(res);
                                    } else {
                                        geolocRes.total = geolocRes.length;
                                        resultDef.resolve(geolocRes);
                                    }
                                }, this);
                            }, function (err) {
                                console.error(err);
                            }, this);
                    } else {
                        ct_when(gelocHasFinished, function (geolocRes) {
                            geolocRes.total = geolocRes.length;
                            resultDef.resolve(geolocRes);
                        }, this);
                    }
                    return resultDef;
                }
            }
        );
        return SearchHandler;
    }
);