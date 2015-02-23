/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 05.03.14.
 */
define([
        "dojo/_base/declare",
        "dojo/string",
        "ct/Stateful",
        "ct/_Connect",
        "ct/_when",
        "./ShareURLWidget",
        "base/analytics/AnalyticsConstants"
    ],
    function (
        declare,
        d_string,
        Stateful,
        Connect,
        ct_when,
        ShareURLWidget,
        AnalyticsConstants
        ) {
        return declare([
                Stateful,
                Connect
            ],
            {
                constructor: function () {

                },

                activate: function () {

                    this.shareUrl = this.shareUrlProvider.get("shareUrl");
                    this.i18n = this._i18n.get();

                },

                share: function () {

                    this.disconnect();

                    ct_when(this.dbStorer.storeState(), function (res) {

                        var shareurl;

                        if (this.encodeCompleteURL) {

                            shareurl = window.location.href.split("?")[0];
                            shareurl += "?id=" + res.id;
                            shareurl = encodeURIComponent(shareurl);
                            shareurl = this.shareUrl + shareurl;

                        } else {

                            shareurl = this.shareUrl + res.id;

                        }

                        var suw = this._suw = new ShareURLWidget({
                            i18n: this.i18n
                        });

                        var w = this._wm.createWindow({
                            content: suw,
                            marginBox: {
                                w: 350,
                                h: 150
                            },
                            title: this.i18n.ui.urlTitle,
                            modal: true
                        });

                        this.connect(suw, "onOk", this, function () {
                            w.close();
                        });
                        this.connect(w, "onShow", this, function () {
                            suw.set("url", shareurl);
//                            suw.textbox.select();
//                            suw.textbox.focus();
                        });

                        w.show();

                        if (this._eventService) {
                            this._eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                                eventType: AnalyticsConstants.EVENT_TYPES.SHARING_URL,
                                eventCategory: AnalyticsConstants.CATEGORIES.SHARING,
                                eventValue: ""
                            });
                        }

                    }, function (err) {
                        this.logger.error({
                            message: this.i18n.ui.dbError
                        });
                    }, this);

                }
            }
        );
    }
);