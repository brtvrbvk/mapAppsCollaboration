/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 04.07.13
 * Time: 16:22
 */
define([
        "..",
        "base/search/_Handler",
        "base/search/SearchTopics",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/keys",
        "dojo/Deferred",
        "base/store/ContentModelStore",
        "base/analytics/AnalyticsConstants",
        "ct/_when",
        "ct/async"
    ],
    function (
        mr,
        _Handler,
        SearchTopics,
        declare,
        d_lang,
        d_array,
        d_keys,
        Deferred,
        ContentModelStore,
        AnalyticsConstants,
        ct_when,
        ct_async
        ) {
        return mr.ContentModelHandler = declare([_Handler],
            {

                type: "CONTENTMODEL",

                constructor: function () {

                },

                activate: function () {
                    if (this.model) {
                        this.i18n = this._i18n.get();
                        this.typeLabel = this.i18n.ui.searchTypes[this.type] || this.type;
                        this.storeParameters.model = this.model;
                        this._store = new ContentModelStore(this.storeParameters);
                    }
                },

                setModel: function (model) {
                    this.model = model;
                    this.activate();
                },

                _onSelectItem: function (item) {
                    this.inherited(arguments);
                    var res = d_lang.mixin(item, {silent: true});
                    this._broadCast(SearchTopics.SELECTED_RESULT, {result: res});

                    var layer = this.model.getNodeById(item.id);
                    var serviceType = layer && layer.service && layer.service.serviceType;

                    var eventType = AnalyticsConstants.EVENT_TYPES.SEARCH_LAYER;
                    if (serviceType === "POI") {
                        eventType = AnalyticsConstants.EVENT_TYPES.SEARCH_POI_TYPE;
                    }
                    this._broadCast(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                        eventType: eventType,
                        eventCategory: AnalyticsConstants.CATEGORIES.SEARCH,
                        eventValue: this.getAnalyticsValue(res.value)
                    });
                },

                _handleValueChange: function (evt) {
                    var d = new Deferred();
                    this.inherited(arguments);

                    if (this._store) {
                        this._goToFirstResult = evt.getProperty && evt.getProperty("_evt").keyCode === d_keys.ENTER;
                        this._broadCast(SearchTopics.HANDLER_START);

                        var val = evt.searchValue ? evt.searchValue : evt._properties.entries.newValue;
                        var query = this.toSuggestQuery(val);

                        ct_when(this._store.query(query, this.storeQueryOptions),
                            function (res) {
                                ct_async(d_lang.hitch(this, function () {
//                                    res = this._modifyItems(res);
                                    if (!this._goToFirstResult) {

                                        this._broadCast(SearchTopics.NEW_RESULT,
                                            {
                                                resultset: {
                                                    results: res,
                                                    query: val,
                                                    typeLabel: this.typeLabel,
                                                    priority: 1
                                                }
                                            });

                                    }
//                                    else {
//                                        this._onSelectItem(res[0]);
//                                    }
                                    this._broadCast(SearchTopics.HANDLER_COMPLETE);
                                    d.resolve(res);
                                }), 100);
                            }, function (err) {
                                console.error(err);
                                this._broadCast(SearchTopics.HANDLER_COMPLETE);
                                d.resolve([]);
                            }, this);
                    } else {
                        this._broadCast(SearchTopics.HANDLER_COMPLETE);
                        d.resolve([]);
                    }
                    return d;
                },

                _modifyItems: function (res) {
                    d_array.forEach(res, function (item) {
                        item.canSelectFirst = true;
                    }, this);
                    return res;
                },

                triggerSearch: function (searchVal) {
                    var d = new Deferred();
                    ct_when(this._handleValueChange({
                        searchValue: searchVal
                    }), function (result) {
                        if (result.length > 0) {
                            ct_when(this._onSelectItem(result[0]), function () {
                                d.resolve(result);
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