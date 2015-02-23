/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 02.07.13
 * Time: 11:49
 */
define([
        ".",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/kernel",
        "./lib/detect-zoom"
    ],
    function (
        _moduleRoot,
        declare,
        d_lang,
        d_kernel,
        dz
        ) {
        return _moduleRoot.ZoomCheck = declare([],
            {
                constructor: function () {

                },

                activate: function () {
                    setTimeout(d_lang.hitch(this, "checkZoom"), 100);
                },

                checkZoom: function () {
                    if (d_kernel.isIE > 7) {
                        if (dz.zoom && dz.zoom() != 1) {
                            this.showMessage();
                        } else if (window.detectZoom && window.detectZoom.zoom != 1) {
                            this.showMessage();
                        }
                    }
                },
                showMessage: function () {
                    this.ui = this._i18n.get().notifier;
                    this._wm.createInfoDialogWindow({
                        message: this.ui.zoomMessage,
                        marginBox: {
                            w: 350,
                            h: 200
                        },
                        title: this.ui.title,
                        showOk: true,
                        showCancel: false
                    })
                }
            }
        )
    }
);