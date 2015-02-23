/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 04.06.2014.
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "ct/_Connect",
        "base/analytics/AnalyticsConstants"
    ],
    function (
        declare,
        Stateful,
        _Connect,
        AnalyticsConstants
        ) {
        return declare([
                Stateful,
                _Connect
            ],
            {
                constructor: function () {

                },

                activate: function () {

                    var referrer = this._getReferrer();
                    if (referrer) {
                        this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                            eventType: AnalyticsConstants.EVENT_TYPES.REFERRER,
                            eventCategory: AnalyticsConstants.CATEGORIES.REFERRER,
                            eventValue: referrer
                        });
                    }

                },

                _getReferrer: function () {

                    var isInIframe = (parent !== window),
                        parentUrl = null;

                    if (isInIframe) {
                        parentUrl = document.referrer;
                    }

                    return parentUrl;

                },

                deactivate: function () {

                }
            }
        );
    }
);