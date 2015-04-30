define([
    "dojo/_base/declare",
    "base/store/_ConfigStore"
], function (
    declare,
    _ConfigStore
    ) {
    return declare([_ConfigStore], {
        idProperty: "title",
        constructor: function () {
            this._metadata = {
                title: "Synonym configs",
                displayField: "title",
                fields: [
                    {
                        "name": "title",
                        "type": "string"
                    },
                    {
                        "name": "synonyms",
                        "type": "string"
                    }
                ]
            };
        }
    });
});