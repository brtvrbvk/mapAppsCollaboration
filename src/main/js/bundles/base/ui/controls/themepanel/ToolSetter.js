define([
        "dojo/_base/declare",
        "ct/_Connect"
    ],
    function (
        declare,
        _Connect
        ) {
        /*
         * COPYRIGHT 2010-2011 con terra GmbH Germany
         */
        var ToolSetter = declare([_Connect],
            {

                constructor: function (args) {
                },

                activate: function () {
                    this.inherited(arguments);
                    if (this._properties.openPanelOnStartup) {
                        this.combicontentmanagerTool.set("active", true);
                    }
                },

                destroy: function () {
                    this.inherited(arguments);
                }

            });
        return ToolSetter;
    });
