/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 10.07.13
 * Time: 13:53
 */
define([
        "base/search/_Handler",
        "base/search/SearchTopics",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/Deferred",
        "dojo/keys",
        "base/store/poi/POIServerStore",
        "base/analytics/AnalyticsConstants",
        "ct/_when",
        "../AddressFormat"
    ],
    function (
        _Handler,
        SearchTopics,
        declare,
        d_lang,
        d_array,
        Deferred,
        d_keys,
        POIServerStore,
        AnalyticsConstants,
        ct_when,
        AddressFormat
        ) {
        return declare([_Handler],
            {
                type: "POISUGGEST",

                constructor: function () {

                },

                activate: function () {
                    this.i18n = this._i18n.get();
                    this.typeLabel = this.i18n.ui.searchTypes[this.type] || this.type;
                    this.storeParameters.srs = this.mapState.getSpatialReference().wkid;
                    this._store = new POIServerStore(this.storeParameters);
                },

                _onSelectItem: function (item) {
                    this.inherited(arguments);
                    this._broadCast(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                        eventType: AnalyticsConstants.EVENT_TYPES.SEARCH_POI,
                        eventCategory: AnalyticsConstants.CATEGORIES.SEARCH,
                        eventValue: this.getAnalyticsValue(item.value)
                    });

                    var store = new POIServerStore({
                        target: this.storeParameters.target
                    });

                    item.store = store;

                    this._broadCast(SearchTopics.SELECTED_RESULT, {result: item});
                },

                _handleValueChange: function (evt) {
                    this.inherited(arguments);
                    if (this._store) {
                        this._goToFirstResult = evt.getProperty("_evt").keyCode === d_keys.ENTER;
                        this._broadCast(SearchTopics.HANDLER_START);
                        var val = evt && evt._properties.entries.newValue;
                        var query = this.toSuggestQuery(val);
                        var queryOptions = this.storeQueryOptions;
                        ct_when(this._store.query(query, queryOptions), function (res) {
                            if (res) {
                                if (queryOptions.maxmodel === false) {
                                    this._limitResultSet(res, queryOptions.count); // We have to limit the number of items from the result here, because the min model POI service does not respect the maxcount parameter.
                                }
                                d_array.forEach(res, d_lang.hitch(this, this._processResult));
                                if (!this._goToFirstResult) {
                                    this._broadCast(SearchTopics.NEW_RESULT, {
                                        resultset: {
                                            results: res,
                                            query: val,
                                            typeLabel: this.typeLabel,
                                            priority: 2
                                        }
                                    });
                                }
                            }
                            this._broadCast(SearchTopics.HANDLER_COMPLETE);
                        }, function (err) {
                            console.error(err);
                            this._broadCast(SearchTopics.HANDLER_COMPLETE);
                        }, this);
                    }
                },

                _limitResultSet: function (
                    result,
                    maxLength
                    ) {
                    if (result.length > maxLength) {
                        result.splice(maxLength);
                        result.total = result.length;
                    }
                },

                _processResult: function (item) {
                    item.value = item.primaryLabel || item.poitypetitle;
                    item.title = item.value + " - " + this._getAddressAsString(item.address) + (" (" + item.poitypetitle + ")");
                    item.shortTitle = "<div><span class='ctPOINameLabel'>" + item.primaryLabel + "</span>";
                    item.shortTitle += " - <span class='ctPOITypeLabel'>" + item.poitypetitle + "</span></div>";
                    item.type = "SEARCH_RESULT_" + item.type;
                },

                _getAddressAsString: function (address) {
                    if (d_lang.isString(address)) {
                        return address;
                    }
                    return AddressFormat.getFormattedAddress(address, ", ");
                }
            }
        );
    }
);