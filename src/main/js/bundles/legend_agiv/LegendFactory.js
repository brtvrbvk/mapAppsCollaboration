define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "./LegendUI"
    ],
    function (
        d_lang,
        declare,
        LegendUI,
        _moduleRoot
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */
        /**
         * Factory for creating the legend ui
         */
        return declare([],
            /**
             * @lends ct.bundles.legend.LegendFactory.prototype
             */
            {
                createInstance: function () {
                    var legendOpts = d_lang.mixin({}, this._properties.legendOpts || {}, {
                        esriMap: this._esriMap,
                        mapModel: this._mapModel,
                        i18n: this._i18n.get(),
                        mappings: this._properties.mappings,
                        replacements: this._properties.replacements,
                        legendMapping: this._properties.legendMapping,
                        printTargetTemplate: this._properties.printTargetTemplate,
                        graphicsItems: this._properties.graphicsItems,
                        showMyPlaces: this._properties.showMyPlaces
                    });
                    // create a new legend
                    return new LegendUI(legendOpts);
                },
                destroyInstance: function (ui) {
                    ui.destroyRecursive();
                }
            });
    });