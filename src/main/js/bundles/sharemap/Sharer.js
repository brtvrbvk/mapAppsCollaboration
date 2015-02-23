/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 03.03.14.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/Deferred",
        "dojo/string",
        "ct/Stateful",
        "ct/_when",
        "base/analytics/AnalyticsConstants"
    ],
    function (
        declare,
        Deferred,
        d_string,
        Stateful,
        ct_when,
        AnalyticsConstants
        ) {
        return declare([Stateful],
            {

                textTemplate: "",

                constructor: function () {

                },

                activate: function () {

                    this.shareUrl = this.shareUrlProvider.get("shareUrl");
                    this.i18n = this._i18n.get();

                },

                share: function () {

                    var d = new Deferred();

                    ct_when(this.dbStorer.storeState(), function (res) {

                        var shareurl;

                        if (this.encodeCompleteURL) {

                            shareurl = window.location.href.split("?")[0];
                            shareurl += "?id=" + res.id;
                            shareurl = encodeURIComponent(shareurl);
                            shareurl = this.shareUrl + shareurl;

                        } else {

                            shareurl = encodeURIComponent(this.shareUrl + res.id);

                        }

                        var url = d_string.substitute(this.service, {
                            url: shareurl,
                            text: d_string.substitute(this.textTemplate, {
                                link: shareurl
                            })
                        });

                        d.resolve(url);

                        if (this.useLocal) {

                            window.location.href = url;

                        } else {

                            window.open(url, "_blank");

                        }

                        if (this._eventService) {
                            this._eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                                eventType: this.eventType,
                                eventCategory: AnalyticsConstants.CATEGORIES.SHARING,
                                eventValue: ""
                            });
                        }

                    }, function (err) {
                        d.reject(err);
                        this.logger.error({
                            message: this.i18n.ui.dbError
                        });
                    }, this);

                    return d;

                }
            }
        )
    }
);