define([
        "dojo/_base/declare",
        "ct/mapping/edit/LookupGraphicResolver",
        "ct/mapping/edit/InfoTemplateTableLookupStrategy",
        "esri/symbols/Symbol",
        "esri/graphic",
        "esri/symbols/jsonUtils"
    ],
    function (
        declare,
        LookupGraphicResolver,
        InfoTemplateTableLookupStrategy,
        Symbol,
        Graphic,
        e_symbolUtils
        ) {

        /*
         * COPYRIGHT 2010-2011 con terra GmbH Germany
         */
        /**
         * @fileOverview This is file provides an resolver for graphics objects.
         */
        return declare([LookupGraphicResolver],
            {

                constructor: function (opts) {
                    this.symbolLookupStrategy = opts && opts.symbolLookupStrategy;
                    this.templateLookupStrategy = (opts && opts.templateLookupStrategy) || new InfoTemplateTableLookupStrategy();
                },

                /**
                 * Factory method for converting a thingWithGeometry into an esri.Graphic instance.
                 * @protected
                 */
                _createGraphic: function (
                    thingWithGeometry,
                    context
                    ) {
                    context = context || thingWithGeometry.context;
                    var type;
                    if (context) {
                        type = context.serviceType ? context.serviceType : context.store && context.store.mmNode && context.store.mmNode.service.serviceType;
                    }
                    if (thingWithGeometry instanceof Graphic) {
                        thingWithGeometry.context = context;
                        thingWithGeometry.attributes.type = type;
                        return thingWithGeometry;
                    }
                    var geometry = this._lookupGeometry(thingWithGeometry, context);
                    var attributes = this._lookupAttributes(thingWithGeometry, context);
                    var symbol = this._lookupSymbol(thingWithGeometry, geometry, attributes, context);
                    var template = this._lookupTemplate(thingWithGeometry, geometry, attributes);
                    attributes.type = type;
                    var graphic = new Graphic(geometry, symbol, attributes, template);
                    graphic.context = context;
                    return graphic;
                },

                /**
                 * @protected
                 */
                _lookupSymbol: function (
                    thingWithGeometry,
                    geometry,
                    attributes,
                    context
                    ) {
                    var sym = thingWithGeometry.symbol || this.symbolLookupStrategy.lookup(geometry,
                        attributes,
                        context);
                    return !sym || (sym instanceof Symbol) ? sym : e_symbolUtils.fromJson(sym);
                }

            });
    });