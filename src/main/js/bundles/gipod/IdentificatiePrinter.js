define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "ct/Stateful",
        "./DetailWidgetPrinter"
    ],
    function (
        declare,
        d_lang,
        d_array,
        Stateful,
        DetailWidgetPrinter
        ) {
        return declare([DetailWidgetPrinter],
            {
                KEY: "identificatie",
                NAME: "Identificatie",
                EMPTY_TYPE: [],
                DATAFORM_ELEMENT: [
                    {
                        "type": "checkbox",
                        "disabled": true,
                        "field": "print.identificatie",
                        "label": "Identificatie"
                    }
                ],

                _updatePrintInfo: function (evt) {

                    var hasIdentificatie = evt.getProperty("hasIdentificatie");
                    this.DATAFORM_ELEMENT[0].disabled = !hasIdentificatie;
                    this._eventService.postEvent("agiv/hik/UPDATE_DIALOG");

                },

                createDetailTableJson: function () {
                    var w = this._widget;
                    var items = w.store && w.store.data;
                    if (items[0]) {
                        return this._getFilteredAttributes(items[0], w.metadata);
                    }
                    return [];
                }

            });
    });