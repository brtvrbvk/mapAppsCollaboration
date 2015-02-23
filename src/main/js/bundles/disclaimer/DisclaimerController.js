define([
        "dojo/_base/lang",
        "dojo/_base/kernel",
        "dojo/_base/declare",
        "dojo/_base/json",
        "dojo/cookie",
        "ct/Stateful",
        "ct/_Connect",
        "./DisclaimerWidget"
    ],
    function (
        d_lang,
        d_kernel,
        declare,
        d_json,
        d_cookie,
        Stateful,
        _Connect,
        DisclaimerWidget
        ) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */
        /**
         * @fileOverview
         * @author fba
         */

        return declare(
            [
                Stateful,
                _Connect
            ],
            /**
             * @lends .prototype
             */
            {
                _cookieName: "AGIV_Mapviewer_",

                /**
                 * @constructor
                 */
                constructor: function () {

                },

                activate: function () {
                    this._cookieName += this._appCtx.getApplicationProperties().id;
                    var show = false;
                    if (this.alwaysShowOnStartup) {
                        show = true;
                    } else {
                        // use cookie, only show once
                        try {
                            var cookie = d_json.fromJson(d_cookie(this._cookieName));
                        } catch (e) {
                        }
                        if (cookie !== "true") {
                            show = true;
                        }
                    }
                    if (show) {
                        this._createDisclaimerWindow();
                        this._onLoad();
                    }
                },

                _onLoad: function () {
                    if (this._window) {
                        if (d_kernel.isIE) {
                            setTimeout(d_lang.hitch(this, function () {
                                this._window.show();
                            }), 2000);
                        } else {
                            this._window.show();
                        }
                    }
                },

                _onCloseDisclaimer: function () {
                    d_cookie(this._cookieName, d_json.toJson("true"));
                    this._window.hide();
                },

                _createDisclaimerWindow: function () {
                    if (!this._window) {
                        var i18n = this._i18n.get();
                        if (this.i18n) {
                            d_lang.mixin(i18n.ui, this.i18n.ui);
                        }
                        var widget = this._widget = this.widget || new DisclaimerWidget({
                            i18n: i18n
                        });
                        this.connect(widget, "onCloseDisclaimer", "_onCloseDisclaimer");
                        var windowProps = this._properties.windowBox;
                        this._window = this._wm.createModalWindow({
                            title: i18n.ui.title,
                            content: widget,
                            closable: false,
                            draggable: false,
                            resizable: false,
                            marginBox: this.windowBox || {
                                w: windowProps.w,
                                h: windowProps.h
                            }
                        });
                    }
                    //this._window.show();

                },
                showDisclaimerInformation: function () {
                    if (!this._window) {
                        this._createDisclaimerWindow();
                    }
                    this._window.show();
                }
            });

    });