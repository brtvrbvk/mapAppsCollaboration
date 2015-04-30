define([
    "dojo/_base/declare",
    "./_ConfigStore"
], function (
    declare,
    _ConfigStore
    ) {
    return declare([_ConfigStore], {
        constructor: function () {
            this._metadata = {
                title: "Identify mappings",
                displayField: this.idProperty,
                fields: [
                    {
                        "name": this.idProperty,
                        "type": "string",
                        "identifier": true
                    },
                    {
                        "name": "defaultMapping",
                        "type": "boolean"
                    },
                    {
                        "name": "service",
                        "type": "string"
                    },
                    {
                        "name": "layer",
                        "type": "string"
                    },
                    {
                        "name": "identifyConfigID",
                        "type": "string"
                    }
                ]
            };
        },
        _appendQueryToRequest: function (
            requestParams,
            query,
            options
            ) {
            if (this.serviceID)query.service = this.serviceID;
            if (this.layerID)query.layer = this.layerID;
            this.inherited(arguments);
        }
    });
});