/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 04.07.13
 * Time: 16:22
 */
define([
        "./SearchTopics",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/_base/declare",
        "ct/Stateful"
    ],
    function (
        SearchTopics,
        d_lang,
        d_array,
        declare,
        Stateful
        ) {
        return declare([Stateful],
            {
                type: "NOT_IMPLEMENTED",

                constructor: function () {

                },

                _broadCast: function (
                    topic,
                    evt
                    ) {
                    evt = evt || {};
                    if (evt.resultset) {
                        d_lang.mixin(evt.resultset, {
                            type: this.type,
                            onSelectCallback: d_lang.hitch(this, this._onSelectItem)
                        });
                        d_array.forEach(evt.resultset.results, function (result) {
                            result.resultType = this.type;
                        }, this);
                    }
                    if (evt.result) {
                        evt.result.resultType = this.type;
                    }
                    d_lang.mixin(evt, {
                        type: this.type
                    });
                    console.debug("_Handler " + this.type + " - post event - " + topic + " ", evt);
                    this.eventService.postEvent(topic, evt);
                },

                triggerSearch: function (term) {
                    throw new Error("Implement!");
                },

                _onSelectItem: function (item) {
                    this._broadCast(SearchTopics.CLOSE_WINDOW);
                },

                _handleValueChange: function (evt) {
                    if (evt) {
                        this._lastVal = evt.searchValue ? evt.searchValue : evt._properties.entries.newValue;
                    }
                },

                getAnalyticsValue: function (val) {
                    return val + " (" + this._lastVal + ")";
                },

                toSuggestQuery: function (val) {
                    return {
                        $suggest: val.toLowerCase()
                    }
                },

                _rehandleResult: function (evt) {
                    var result = evt && evt._properties.entries.result;
                    if (result && result.resultType === this.type) {
                        this._onSelectItem(result);
                    }
                }
            }
        )
    }
);