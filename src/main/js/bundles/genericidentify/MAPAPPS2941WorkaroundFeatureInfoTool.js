define([
        "dojo/_base/declare",
        "ct/_Connect"
    ],
    function (
        declare,
        Connect
        ) {
        return declare([Connect],
            {
                activate: function() {
                    var that = this;
                    this.connect(this._themaInfoDockTool, "onActivate", function() {
                        that._genericFeatureInfoTool.set("active", true);
                    });
                },

                deactivate: function() {
                    this.disconnect();
                }
            });
    });