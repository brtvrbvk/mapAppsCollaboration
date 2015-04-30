define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "ct/store/ComplexMemory"
    ],
    function (
        d_lang,
        declare,
        ComplexMemory
        ) {
        return declare([ComplexMemory], {
            idProperty: "id",
            constructor: function (opts) {
            },
            getMetadata: function () {
                return {
                    title: "Mapping Services",
                    displayField: "name",
                    fields: [
                        {
                            "name": "id",
                            "type": "string",
                            "identifier": true
                        },
                        {
                            "name": "title",
                            "type": "string"
                        },
                        {
                            "name": "url",
                            "type": "string"
                        },
                        {
                            "name": "type",
                            "type": "string"
                        },
                        {
                            "name": "options",
                            "type": "string"
                        },
                        {
                            "name": "layers",
                            "type": "array"
                        }
                    ]
                };
            }
        });
    });