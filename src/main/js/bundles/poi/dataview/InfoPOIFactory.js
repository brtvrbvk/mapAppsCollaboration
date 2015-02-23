define([
        "dojo/_base/declare",
        "ct/_Connect",
        "./InfoPOIWidget",
        ".."
    ],
    function (
        declare,
        _Connect,
        InfoPOIWidget,
        _moduleRoot
        ) {
        /*
         * COPYRIGHT 2010-2011 con terra GmbH Germany
         */
        return _moduleRoot.InfoPOIFactory = declare([_Connect],
            {
                constructor: function () {
                },

                activate: function () {
                    this._infoPOIWidget = new InfoPOIWidget({
                        eventService: this._eventService
                    });
                },

                createInstance: function () {
                    return this._infoPOIWidget;
                },

                destroyInstance: function (w) {
                    this.disconnect();
                    w.destroyRecursive();
                    this._infoPOIWidget = null;
                },

                deactivate: function () {
                    this.disconnect();
                }
            });
    });