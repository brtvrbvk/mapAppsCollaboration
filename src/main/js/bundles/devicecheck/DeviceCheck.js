define([
        "dojo/_base/declare",
        "dojo/_base/lang"
    ],
    function (
        declare,
        d_lang
        ) {
        return  declare([],
            {
                constructor: function () {
                },

                activate: function () {
                    setTimeout(d_lang.hitch(this, "showMessage"), 100);
                },

                showMessage: function () {
                    this.ui = this._i18n.get().notifier;
                    this._wm.createInfoDialogWindow({
                        message: this.ui.deviceMessage,
                        marginBox: {
                            w: 350,
                            h: 230
                        },
                        title: this.ui.title,
                        showOk: true,
                        showCancel: false
                    });
                }
            }
        )
    }
);