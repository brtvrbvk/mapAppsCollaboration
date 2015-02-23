define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "ct/Stateful",
        "base/mapping/graphics/StoreLookupGraphicResolver",
        "./DetailWidgetPrinter",
        "./GipodSymbolLookupStrategy",
    ],
    function (
        declare,
        d_lang,
        d_array,
        Stateful,
        StoreLookupGraphicResolver,
        DetailWidgetPrinter,
        GipodSymbolLookupStrategy
        ) {
        return declare([DetailWidgetPrinter],
            {
                KEY: "diversions",
                NAME: "Diversions",
                EMPTY_TYPE: [],
                DATAFORM_ELEMENT: [
                    {
                        "type": "checkbox",
                        "disabled": true,
                        "field": "print.diversions",
                        "label": "Omleidingen"
                    }
                ],

                activate: function () {

                    this.inherited(arguments);

                    this._resolver = new StoreLookupGraphicResolver({
                        symbolLookupStrategy: new GipodSymbolLookupStrategy({
                            lookupAttributeName: "gipodType",
                            lookupTable: this.identifyLookupTable.get("lookupTable")
                        })
                    });

                },

                readPrintData: function (
                    opts,
                    mapsettings
                    ) {
                    var that = this;
                    var json = {};
                    var diversionsJson = json[this.KEY] = [];
                    d_array.forEach(this._widgets, function (
                        widget,
                        index
                        ) {
                        diversionsJson.push(d_lang.mixin(that.createDetailMapJson(opts, widget), {
                            description: "Omleiding " + (index + 1),
                            tables: [
                                {table: that.createDetailTableJson(widget)}
                            ]
                        }));
                    });
                    return json;
                },

                _updatePrintInfo: function (evt) {

                    var hasDiversions = evt.getProperty("hasDiversions");
                    this.DATAFORM_ELEMENT[0].disabled = !hasDiversions;
                    this._eventService.postEvent("agiv/hik/UPDATE_DIALOG");
                },

                createDetailTableJson: function (widget) {
                    return this._getFilteredAttributes(widget.content, widget.metadata);
                }
            });
    });