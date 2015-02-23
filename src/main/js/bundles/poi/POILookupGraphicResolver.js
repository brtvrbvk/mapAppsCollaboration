define([
        "dojo/_base/declare",
        "ct/mapping/edit/LookupGraphicResolver",
        "esri/symbols/Symbol",
        "esri/graphic",
        "esri/InfoTemplate",
        "esri/symbols/jsonUtils",
        "./POISymbolLookupStrategy",
        "./POISymbolLookupStrategyFactory"
    ],
    function (
        declare,
        LookupGraphicResolver,
        Symbol,
        Graphic,
        InfoTemplate,
        e_symbolUtils,
        POISymbolLookupStrategy
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
                    this.symbolLookupStrategy = (opts && opts.symbolLookupStrategyFactory) ? opts.symbolLookupStrategyFactory.generate() : (opts.symbolLookupStrategy ? opts.symbolLookupStrategy : new POISymbolLookupStrategy());
                    this.templateLookupStrategy = (opts && opts.templateLookupStrategy) || null;
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
                    if (thingWithGeometry instanceof Graphic) {
                        thingWithGeometry.context = context;
                        thingWithGeometry.attributes.type = "POI";
                        return thingWithGeometry;
                    }
                    var geometry = this._lookupGeometry(thingWithGeometry,
                            context),
                        attributes = this._lookupAttributes(thingWithGeometry,
                            context),
                        symbol = this._lookupSymbol(thingWithGeometry,
                            geometry,
                            attributes,
                            context),
                        template = null;
                    attributes.type = "POI";
                    var graphic = new Graphic(geometry, symbol,
                        attributes,
                        template);
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
                },

                getDefault: function () {
                    return this.symbolLookupStrategy.lookup({type: "point"},
                        {},
                        {});
                }

            });
    });