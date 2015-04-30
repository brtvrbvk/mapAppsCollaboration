/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 27.06.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/_base/html",
        "dojo/dom-construct",
        "dojo/dom-geometry",
        "ct/_when",
        "ct/_Connect",
        "ct/async",
        "ct/ui/desktop/util",
        "infoviewer/FourAnchorsPlacementStrategy",
        "base/util/POISymbolRenderer",
        "dijit/_WidgetBase",
        "dijit/form/Button"
    ],
    function (
        declare,
        d_lang,
        d_array,
        d_html,
        d_domConstruct,
        d_domGeom,
        ct_when,
        Connect,
        ct_async,
        ct_desktopUtil,
        FourAnchorsPlacementStrategy,
        POISymbolRenderer,
        _WidgetBase,
        Button
        ) {
        var MultiPOIFeatureInfoWidget = declare([
                _WidgetBase
            ],
            {

                constructor: function (args) {
                    this._listeners = new Connect({
                        defaultConnectScope: this
                    });
                },

                _resize: function () {

                    ct_when(this.contentDeferred, function () {
                        ct_async.hitch(this, function () {
                            var mb = d_domGeom.getMarginBox(this.domNode);
                            this.window.resize({
                                h: 35 + mb.h
                            });
                            var viewPort = this.mapState.getViewPort();
                            var windowDistanceFromPoint = {
                                x: 35,
                                y: 35
                            };

                            var fourAnchorsPS = new FourAnchorsPlacementStrategy(windowDistanceFromPoint);
                            var windowDimensions = {
                                h: d_domGeom.getMarginBox(this.window.domNode).h,
                                w: d_domGeom.getMarginBox(this.window.domNode).w
                            };
                            var placement = fourAnchorsPS.getPlacement(this.content.geometry,
                                windowDimensions,
                                viewPort, {
                                    x: 0,
                                    y: 0
                                });
                            this.window.resize({
                                l: placement.screenPoint.x,
                                t: placement.screenPoint.y,
                                w: windowDimensions.w,
                                h: windowDimensions.h
                            });
                        }, 150)();
                    }, this);

                },

                postCreate: function () {
                    this.inherited(arguments);
                    if (!this.symbolRenderer) {
                        this.symbolRenderer = new POISymbolRenderer();
                    }

                },

                _poiSelect: function () {

                    var content = {
                        graphic: {}
                    };
                    content.graphic.attributes = d_lang.mixin(this.poi, {});
                    content.graphic.geometry = this.poi.geometry;
                    content.poi = this.poi;
                    content.geometry = this.poi.geometry;
                    this.eventService.postEvent("agiv/genericidentify/SHOW", {
                        content: content,
                        context: this.context
                    });

                },

                deactivate: function () {
                    if (this._listeners) {
                        this._listeners.disconnect();
                    }
                },

                destroy: function () {
                    this.deactivate();
                    this.inherited(arguments);
                },

                startup: function () {
                    this.inherited(arguments);
                    this.window = ct_desktopUtil.findEnclosingWindow(this.domNode);
                    ct_when(this.contentDeferred, function (items) {

                        d_array.forEach(items, function (poi) {

                            var ctx = d_lang.mixin({}, this);
                            ctx = d_lang.mixin(ctx, {poi: poi});
                            var g = poi.graphicResolver.getDefault();
                            var iconNode = d_domConstruct.create("div");
                            this.symbolRenderer.renderSymbol(iconNode, g);

                            new Button({
                                label: "<span class='ctPOIIcon'>" + iconNode.innerHTML + "</span><span class='ctPOINameLabel'>" + poi.primaryLabel + "</span><span class='ctPOITypeLabel'>&nbsp;-&nbsp;" + poi.poitypetitle + "</span>",
                                onClick: d_lang.hitch(ctx, this._poiSelect),
                                'class': "ctMultiHit"
                            }).placeAt(this.domNode, "last");

                        }, this);

                        this._resize();

                    }, function (error) {
                        //TODO
                        console.error(error);
                    }, this);
                }
            }
        );
        MultiPOIFeatureInfoWidget.createWidget = function (
            params,
            contentFactory
            ) {
            var opts = contentFactory.get("MultiPOIFeatureInfoWidget");
            return new MultiPOIFeatureInfoWidget({
                content: params.content,
                context: params.context,
                contentDeferred: params.content.contentDeferred,
                i18n: opts.i18n,
                eventService: contentFactory.get("eventService"),
                contentViewer: contentFactory.get("contentViewer"),
                rule: params.rule,
                mapState: contentFactory.get("mapState")
            });
        };
        return MultiPOIFeatureInfoWidget;
    }
);