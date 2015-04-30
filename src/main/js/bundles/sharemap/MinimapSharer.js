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
        "./ShareMinimapWidget",
        "base/analytics/AnalyticsConstants"
    ],
    function (
        declare,
        d_string,
        Stateful,
        Connect,
        ct_when,
        ShareMinimapWidget,
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

                    this.i18n = this._i18n.get();

                },

                help: function () {

                    window.open(this.infoURL, "_blank");

                },

                share: function () {

                    this.disconnect();

                    ct_when(this.dbStorer.storeState({
                        excludeApp: true,
                        addLayerMetadata: true
                    }), function (res) {

                        var shareurl;

                        if (this.encodeCompleteURL) {

                            shareurl = window.location.href.split("?")[0];
                            shareurl += "?id=" + res.id;
                            shareurl = encodeURIComponent(shareurl);
                            shareurl = this.shareUrl + shareurl;

                        } else {

                            shareurl = this.shareUrl + res.id;

                        }

                        shareurl = "<iframe src=\"" + shareurl + "\" width=\"${width}\" height=\"${height}\" ></iframe>";

                        var suw = this._suw = new ShareMinimapWidget({
                            i18n: this.i18n
                        });

                        var w = this._wm.createWindow({
                            content: suw,
                            tools: [this.minimapInfoTool],
                            marginBox: {
                                w: 500,
                                h: 215
                            },
                            title: this.i18n.ui.minimapTitle,
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
                                eventType: AnalyticsConstants.EVENT_TYPES.SHARING_MINIMAPS,
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
        )
    }
);