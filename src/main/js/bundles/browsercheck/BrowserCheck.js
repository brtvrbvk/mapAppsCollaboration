define([
        "dojo/_base/lang",
        "dojo/_base/kernel",
        "dojo/_base/declare",
        "dojo/string",
        "ct/_when",
        "."
    ],
    function (
        d_lang,
        d_kernel,
        declare,
        d_string,
        when,
        _moduleRoot
        ) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */

        _moduleRoot.BrowserCheck = declare(
            [],
            {
                constructor: function () {
                },

                activate: function () {
                    setTimeout(d_lang.hitch(this, "checkUserAgent"), 2500);
                },

                checkUserAgent: function () {
                    if (d_kernel.isIE <= 7) {
                        this.showMessage("Internet Explorer <= 7");
                    } else if (d_kernel.isSafari < 5.1) {
                        this.showMessage("Safari <= 5.1");
                    }
                },

                showMessage: function (unSupportedVersion) {
                    this.ui = this._i18n.get().notifier;
                    var template = this.ui.warning,
                        message = d_string.substitute(template, {
                            userAgent: unSupportedVersion
                        });

                    when(this._wm.createInfoDialogWindow({
                            message: message,
                            marginBox: {
                                w: 300,
                                h: 165
                            },
                            title: this.ui.title,
                            showOk: true,
                            showCancel: false
                        }),
                        function () {

                        }, function () {

                        });

                }

            });

        return _moduleRoot;
    });