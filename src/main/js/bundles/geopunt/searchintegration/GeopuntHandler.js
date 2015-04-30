define([
        "dojo/_base/declare",
        "dojo/string",
        "base/search/_Handler",
        "base/search/SearchTopics",
        "ct/request",
        "ct/_when",
        "base/analytics/AnalyticsConstants"
    ],
    function (
        declare,
        d_string,
        _Handler,
        SearchTopics,
        ct_request,
        ct_when,
        AnalyticsConstants
        ) {
        return declare([_Handler],
            {

                type: "GEOPUNT_SEARCH",
                _enabled: true,

                constructor: function () {

                },

                activate: function () {
                    this.i18n = this._i18n.get();
                    if (!this.redirectTarget || this.redirectTarget.length === 0) {
                        this._enabled = false;
                    }
                },

                _onSelectItem: function (item) {
                    this._broadCast(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                        eventType: AnalyticsConstants.EVENT_TYPES.SELECT_GEOPUNT,
                        eventCategory: AnalyticsConstants.CATEGORIES.SEARCH,
                        eventValue: item.value
                    });
                    window.open(d_string.substitute(this.redirectTarget, {
                        query: item.value
                    }));
                    this._broadCast(SearchTopics.CLOSE_WINDOW);
                },

                _handleValueChange: function (evt) {

                    var val = evt && evt.getProperty("newValue");

                    if (this._enabled && val && val.length >= this.minQueryLength) {
                        var res = d_string.substitute(this.i18n.geopuntLink, {
                            query: val
                        });
                        this._broadCast(SearchTopics.NEW_RESULT, {
                            resultset: {
                                results: [
                                    {
                                        title: res,
                                        value: val,
                                        iconClass: "icon-magnifier",
                                        additionalClass: "ctShowMenuItemIcon"
                                    }
                                ],
                                query: val,
                                typeLabel: "&nbsp;",
                                priority: 100
                            }
                        });
                    }

                }
            }
        );
    }
);