define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "ct/Stateful"
    ],
    function (
        d_lang,
        declare,
        Stateful
        ) {
        /*
         * COPYRIGHT 2011 con terra GmbH Germany
         */

        var Handler = declare([Stateful], {

            id: null,

            type: "select",

            activate: function () {
                var props = this._properties;
                this.id = props.id;
            },

            deactivate: function () {
            },

            handle: function (
                geometry,
                item
                ) {
                this._handler.updateAddress(geometry, item);
            }

        });
        return Handler;
    });