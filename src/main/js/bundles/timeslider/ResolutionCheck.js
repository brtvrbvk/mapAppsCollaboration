define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/window"
    ],
    function (
        declare,
        d_lang,
        d_window
        ) {
        return declare([],
            {
                constructor: function () {
                },

                activate: function () {
                    var viewPort = d_window.getBox();
                    setTimeout(d_lang.hitch(this, function () {
                        if (viewPort && viewPort.w < 1024) {
                            this.showMessage();
                        }
                    }), 100);
                },

                showMessage: function () {
                    this.ui = this._i18n.get().notifier;
                    this._wm.createInfoDialogWindow({
                        message: this.ui.resolutionMessage,
                        marginBox: {
                            w: 350,
                            h: 180
                        },
                        title: this.ui.title,
                        i18n: {
                            okButton: this.ui.okButton
                        },
                        showOk: true,
                        showCancel: false
                    });
                }
            });
    });