define([
        "dojo/_base/declare",
        "dijit/_WidgetBase",
        "ct/_Connect",
        "ct/ui/controls/MessagePane"
    ],
    function (
        declare,
        _WidgetBase,
        Connect,
        MessagePane
        ) {
        return declare([],
            {
                constructor: function() {
                    this._listeners = new Connect();
                },

                showNotificationWindow: function (message, title) {
                    var messagePane = this._messagePane;
                    if (!messagePane) {
                        messagePane = this._messagePane = new MessagePane({});
                        this._w = this.windowManager.createInfoDialogWindow({
                            content: messagePane,
                            marginBox: {
                                w: 350,
                                h: 180
                            },
                            title: title,
                            showOk: true,
                            showCancel: false
                        });
                        this._listeners.connect(this._w, "onClose", this, function() {
                            this._errorPane = null;
                        });
                    }
                    messagePane.addMessage({
                        type: "warning",
                        value: message
                    });
                },

                deactivate: function() {
                    this._messagePane = null;
                    this._w.close();
                    this._listeners.disconnect();
                }
            });
    });