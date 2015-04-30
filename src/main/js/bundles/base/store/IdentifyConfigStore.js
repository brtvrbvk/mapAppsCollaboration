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
                title: "Identify configs",
                displayField: "title",
                fields: [
                    {
                        "name": this.idProperty,
                        "type": "string",
                        "identifier": true
                    },
                    {
                        "name": "title",
                        "type": "string"
                    },
                    {
                        "name": "generalMapping",
                        "type": "boolean"
                    },
                    {
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "name": "createdBy",
                        "type": "string"
                    },
                    {
                        "name": "createdAt",
                        "type": "datetime"
                    },
                    {
                        "name": "modifiedBy",
                        "type": "string"
                    },
                    {
                        "name": "modifiedAt",
                        "type": "datetime"
                    }
                ]
            };
        }
    });
});