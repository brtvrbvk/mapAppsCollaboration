/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 17.10.13
 * Time: 09:45
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "./IdentificatieWidget",
        "dijit/layout/ContentPane",
        "dijit/layout/BorderContainer"
    ],
    function (
        declare,
        d_array,
        d_lang,
        IdentificatieWidget
        ) {
        /**
         * @fileOverview This file provides a feature info widget.
         */
        var DiversionsWidget = declare([IdentificatieWidget],
            {
                baseClass: "ctGipodResultDiversions",
                _gridContext: {
                    infotype: "GIPOD_DIVERSIONS_GRID"
                },

                constructor: function () {
                },

                postCreate: function () {

                    this.inherited(arguments);

                    this.title = this.i18n.title + (this.content.diversionsLength > 1 ? (" " + this.content.diversionsIndex) : "");
                    this.eventService.postEvent("agiv/diversions/UPDATE_PRINT_INFO", {hasDiversions: true});
                    this._serviceregistration = this.bundleCtx.registerService(["gipod.DiversionsWidget"], this);
                },

                destroy: function () {
                    this._serviceregistration.unregister();
                    this.eventService.postEvent("agiv/diversions/UPDATE_PRINT_INFO", {hasDiversions: false});
                    this.inherited(arguments);
                },

                _fetchGraphics: function (item) {
                    var tmp = this.inherited(arguments);
                    this._graphics = tmp.concat(d_array.map(item.diversionGeometries,
                        function (g) {
                            if (g) {
                                var elem = {
                                    gipodType: "diversion",
                                    geometry: g
                                };
                                return this._resolver._createGraphic(elem, this.context);
                            } else {
                                return null;
                            }
                        },
                        this));
                    return this._graphics;
                },

                getDetailMap: function () {
                    this.printmap = this.bundleCtx.getService(this.bundleCtx.getServiceReferences("gipod.IdentificatieMap")[0]);
                    return{
                        getMapComponents: d_lang.hitch(this, function () {
                            var t = this.printmap.getMapComponents();
                            t.mapModel = this._map.getMapComponents().mapModel;
                            return t;
                        })
                    };
                }

            });
        DiversionsWidget.createWidget = function (
            params,
            contentFactory
            ) {
            var opts = contentFactory.get("DiversionsWidget");
            var widget = new DiversionsWidget({
                content: params.content,
                context: params.context,
                i18n: opts.i18n,
                metadata: opts.metadata,
                serviceDefinition: contentFactory.get("serviceDefinition"),
                contentviewer: contentFactory.get("contentviewer"),
                mrr: contentFactory.get("mrr"),
                mapState: contentFactory.get("mapState"),
                esriLayerFactory: contentFactory.get("esriLayerFactory"),
                lookupTable: contentFactory.get("identifyLookupTable").get("lookupTable"),
                eventService: contentFactory.get("eventService"),
                bundleCtx: contentFactory._componentContext.getBundleContext()
            });
            return widget;
        };
        return DiversionsWidget;
    });