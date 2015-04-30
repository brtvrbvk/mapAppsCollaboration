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
        "dojo/string",
        "dojo/dom-construct",
        "dojo/aspect",
        "ct/array",
        "ct/util/css",
        "ct/_when",
        "ct/_Connect",
        "esri/geometry/Extent",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "./_GriddedWidgetMixin",
        "./SimpleMapWidget",
        "base/mapping/graphics/StoreLookupGraphicResolver",
        "../GipodSymbolLookupStrategy",
        "dojo/text!./templates/IdentificatieWidget.html",
        "dijit/layout/ContentPane",
        "dijit/layout/BorderContainer"
    ],
    function (
        declare,
        d_array,
        d_lang,
        d_string,
        d_domconstruct,
        d_aspect,
        ct_array,
        ct_css,
        ct_when,
        Connect,
        Extent,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        _GriddedWidgetMixin,
        SimpleMapWidget,
        StoreLookupGraphicResolver,
        GipodSymbolLookupStrategy,
        templateStringContent
        ) {

        var IdentificatieWidget = declare([
                _Widget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin,
                _GriddedWidgetMixin
            ],
            {
                baseClass: "ctGipodResultIdentificatie",
                templateString: templateStringContent,
                title: "ident",
                _gridContext: {
                    infotype: "GIPOD_IDENTIFICATIE_GRID"
                },

                attributeMap: d_lang.delegate(_Widget.prototype.attributeMap,
                    {
                    }
                ),

                postCreate: function () {
                    this.inherited(arguments);
                    this._resolver = new StoreLookupGraphicResolver({
                        symbolLookupStrategy: new GipodSymbolLookupStrategy({
                            lookupAttributeName: "gipodType",
                            lookupTable: this.lookupTable
                        })
                    });

                    var content = this.content;
                    var graphics = this._fetchGraphics(content);
                    var unifiedExtent = this._calculateUnifiedExtent(graphics);
                    var map = this._map = new SimpleMapWidget({
                        graphics: graphics,
                        initialExtent: unifiedExtent,
                        mrr: this.mrr,
                        mapState: this.mapState,
                        esriLayerFactory: this.esriLayerFactory,
                        serviceDefinition: this.serviceDefinition,
                        i18n: this.i18n
                    });
                    this.mapContentPane.set("content", map);

                    this.title = this.i18n.title;

                    this.labelNode.innerHTML = this.content.description;
                    this.eventService.postEvent("agiv/identificatie/UPDATE_PRINT_INFO", {hasIdentificatie: true});
                },

                _fetchGraphics: function (item) {
                    this._graphics = d_array.map(item.geometries,
                        function (g) {
                            if (g) {
                                var elem = d_lang.mixin({}, item);
                                elem.geometry = g;
                                return this._resolver._createGraphic(elem, this.context);
                            } else {
                                return null;
                            }
                        }, this);
                    return this._graphics;
                },

                getGraphicsExtent: function () {

                    return this._calculateUnifiedExtent(this._graphics);

                },

                _calculateUnifiedExtent: function (graphics) {
                    var unifiedExtent;
                    d_array.forEach(graphics, function (graphic) {
                        var extent;
                        var geometry = graphic.geometry;
                        if (geometry.getExtent) {
                            extent = geometry.getExtent();
                        } else if (graphic.type === "point") {
                            extent = new Extent(geometry.x, geometry.y, geometry.x, geometry.y,
                                geometry.spatialReference);
                        } else {
                            extent = null;
                        }

                        if (extent) {
                            if (!unifiedExtent) {
                                unifiedExtent = extent;
                            } else {
                                unifiedExtent = unifiedExtent.union(extent);
                            }
                        }
                    });
                    return unifiedExtent;
                },

                destroyRecursive: function () {
                    if (this._registration) {
                        this._registration.unregister();
                        this._registration = null;
                    }
                    if (this._map) {
                        this._map.destroyRecursive();
                        this._map = null;
                    }
                    this.inherited(arguments);
                },

                destroy: function () {
                    if (this._registration) {
                        this._registration.unregister();
                        this._registration = null;
                    }
                    if (this._map) {
                        this._map.destroy();
                        this._map = null;
                    }
                    this.inherited(arguments);
                },

                resize: function (dim) {
                    if (this.mainnode) {
                        this.mainnode.resize(dim);
                    }
                },

                getDetailMap: function () {
                    return this._map;
                },

                getGraphics: function () {
                    return this._graphics;
                }
            });
        IdentificatieWidget.createWidget = function (
            params,
            contentFactory
            ) {
            var opts = contentFactory.get("IdentificatieWidget");
            var bundleCtx = contentFactory._componentContext.getBundleContext();
            var identificatieWidget = new IdentificatieWidget({
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
                eventService: contentFactory.get("eventService")
            });
            d_aspect.after(identificatieWidget, "startup", function () {
                identificatieWidget._registration = bundleCtx.registerService(["gipod.IdentificatieMap"],
                    identificatieWidget._map);
            });
            bundleCtx.registerService(["gipod.IdentificatieWidget"], identificatieWidget);

            return identificatieWidget;
        };
        return IdentificatieWidget;
    });