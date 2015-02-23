define([
        "dojo/_base/declare",
        "dojo/dom-construct",
        "ct/_lang",
        "ct/array",
        "dijit/_Widget",
        "esri/dijit/Legend",
        "./Legend",
        "./GraphicsLegend"
    ],
    function (
        declare,
        d_domconstruct,
        ct_lang,
        ct_array,
        _Widget,
        EsriLegend,
        Legend,
        GraphicsLegend
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */
        /**
         * The user interface for the legend
         */
        return declare([_Widget],
            /**
             * @lends ct.bundles.legend.LegendUI.prototype
             */
            {
                /**
                 * The base class name for the legend widget
                 * @property {String}
                 */
                baseClass: "ctLegend",
                topics: {
                    ON_LEGEND_REFRESH: "ct/legend_agiv/ON_LEGEND_REFRESH"
                },
                /**
                 * @param opts legend's options
                 *        {
             *          esriMap: Object, // instance of esri map
             *          respectCurrentMapScale : true|false, // Respects current map scale. Default is false
             *          alignmentLeft :  true|false // Alignment of legend. Default is false
             *          layerInfos : [{ layer : esriLayer, title: legendTitle}]
             *        }
                 * @constructs
                 */
                constructor: function (opts) {
                    // check if esri map is available
                    ct_lang.hasProps(opts, "esriMap", true, "No esriMap available!");
                    ct_lang.hasProps(opts, "mapModel", true, "No mapModel available!");
                },

                buildRendering: function () {
                    this.inherited(arguments);
                    this._legend = this._createLegend();
                },

                startup: function () {
                    var started = this._started;
                    this.inherited(arguments);
                    if (!started) {
                        this._legend.startup();
                    }
                },

                uninitialize: function () {
                    if (this._legend) {
                        this._legend.destroyRecursive();
                        this._legend = null;
                    }
                    this.inherited(arguments);
                },

                handleTemplateRendered: function (event) {
                    if (event._properties.get("name") === this.printTargetTemplate) {
                        this._legend.refresh();
                        if (this._graphicsLegend) {
                            this._graphicsLegend.refresh();
                        }
//                    this.eventService.postEvent(this.topics.ON_LEGEND_REFRESH);
                    }
//                this._legend._deactivate();
                },

                getLegendMappingById: function (layerId) {
                    return ct_array.arraySearchFirst(this.legendMapping, {
                        id: layerId
                    });
                },

                /**
                 * creates the legend
                 */
                _createLegend: function () {
                    if (this.showMyPlaces) {
                        var graphicsLegendNode = this._graphicsLegendNode = d_domconstruct.create("div",
                            {},
                            this.domNode);
                        this._graphicsLegend = new GraphicsLegend({
                            mapModel: this.mapModel,
                            graphicsItems: this.graphicsItems,
                            i18n: this.i18n
                        }, graphicsLegendNode);
                    }
                    var legendNode = this._legendNode = d_domconstruct.create("div", {}, this.domNode);
                    return new Legend({
                        map: this.esriMap,
                        i18n: this.i18n,
                        respectCurrentMapScale: this.respectCurrentMapScale,
                        arrangement: this.alignmentLeft ? EsriLegend.ALIGN_LEFT : EsriLegend.ALIGN_RIGHT,
                        mapModel: this.mapModel,
                        showBaseLayer: this.showBaseLayer,
                        mappings: this.mappings,
                        replacements: this.replacements,
                        legendMapping: this.legendMapping
                    }, legendNode);
                },

                /**
                 * shows the legend
                 */
                show: function () {
                    this._legend.refresh();
                    this._legend._uiVisible();
                    if (this._graphicsLegend) {
                        this._graphicsLegend.show();
                    }
                },

                /**
                 * hides the legend
                 */
                hide: function () {
                    this._legend._deactivate();
                    this._legend._uiInvisible();
                    if (this._graphicsLegend) {
                        this._graphicsLegend.hide();
                    }
                },

                destroy: function () {
                    this.inherited(arguments);
                    this.destroyRecursive();
                },

                destroyRecursive: function () {
                    this.inherited(arguments);
                    this._legend.destroyRecursive();
                    if (this._graphicsLegend) {
                        this._graphicsLegend.destroyRecursive();
                    }
                }
            });
    });