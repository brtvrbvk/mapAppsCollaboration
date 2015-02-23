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
        "base/store/NavTeqRoutingStore",
        "ct/request",
        "ct/_when",
        "ct/array",
        "./SearchHandler"
    ],
    function (
        declare,
        d_lang,
        Deferred,
        GeolocatorStore,
        NavTeqRoutingStore,
        ct_request,
        ct_when,
        ct_array,
        SearchHandler
        ) {
        var GeocodingHandler = declare([SearchHandler],
            {
                useNavteqFallback: true,

                constructor: function () {

                },

                activate: function () {
                    this.i18n = this._i18n.get();
                    this.geolocatorStoreParameters.geolocatorUrlProvider = this.geolocatorUrlProvider;
                    this._geolocatorSuggestStore = new GeolocatorStore(this.geolocatorStoreParameters);
                    this._navteqStore = new NavTeqRoutingStore(this.navteqRoutingStoreParameters);
                }
            }
        );
        return GeocodingHandler;
    }
);