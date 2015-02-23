/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 22.05.13
 * Time: 09:14
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/string",
        "ct/_Connect",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/dom-geometry",
        "dojo/window",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "base/util/POISymbolRenderer",
        "dijit/Tooltip"
    ],
    function (
        declare,
        d_array,
        d_string,
        Connect,
        d_domclass,
        d_domconstruct,
        d_domgeom,
        d_window,
        _WidgetBase,
        _TemplatedMixin,
        POISymbolRenderer
        ) {
        var POIHoverInfoWidget = declare([
                _WidgetBase,
                _TemplatedMixin
            ],
            {
                templateString: "<div><div class=\"ctPOIHoverMainNode\" data-dojo-attach-point=\"node\"></div></div>",
                baseClass: "ctPOIHoverInfoWidget",

                rule: null,
                POI_HOVER: "agivPOIHover",

                constructor: function (args) {
                    this._listeners = new Connect({
                        defaultConnectScope: this
                    });
                    this._listeners.connect("onWindowCreated", args.contentViewer.windowManager,
                        "onWindowCreated", this,
                        this._saveContentWindow);
                },

                _saveContentWindow: function (evt) {
                    if (evt.window.get("windowName") === this.POI_HOVER) {
                        this.contentWindow = evt.window;
                        this._listeners.disconnect("onShow");
                        this._listeners.connect("onShow", this.contentWindow,
                            "onShow", this,
                            this._repositionTooltip);
                    }
                },

                _repositionTooltip: function (evt) {
                    var tooltipBox = d_domgeom.getMarginBox(evt.source.window.domNode);

                    var midPointHor = d_window.getBox().w / 2;
                    // display tooltip on the right by default
                    var x = this.pos.l + 15;
                    d_domclass.replace(evt.source.window.domNode, "ctTooltipAnchorRight", "ctTooltipAnchorLeft");
                    if (this.pos.l > midPointHor) {
                        // display tooltip on the left
                        x = this.pos.l - tooltipBox.w - 15;
                        d_domclass.replace(evt.source.window.domNode, "ctTooltipAnchorLeft", "ctTooltipAnchorRight");
                    }

                    var y = this.pos.t - (tooltipBox.h / 2);

                    d_domgeom.setMarginBox(evt.source.window.domNode, {
                        l: x,
                        t: y
                    });
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this.rule.window.marginBox = this.rule.windowSize;

                    var items = this.items;
                    var t = "", label;

                    d_array.some(items, function (
                        i,
                        idx
                        ) {

                        if (idx > 4) {
                            t += "<div>...</div>";
                            return true;
                        }

                        if (i.isCluster) {
                            // poitype must be parsed
                            // see POIServerStoreLayerRegistration (poitype is set to layerId) and POIParser (poitype for cluster)
                            if (i.poitype) {
                                i.poitype = i.poitype.replace("_", " ");
                                i.title = i.title || i.poitypetitle || i.poitype;
                            }
                            label = d_string.substitute(this.i18n.clusterHover, i);
                            t += "<div><span class='ctPOINameLabel'>" + label + "</span></div>";
                            return false;

                        } else {

                            var g = i.graphicResolver.getDefault();
                            if (!this.symbolRenderer) {
                                this.symbolRenderer = new POISymbolRenderer();
                            }
                            var iconNode = d_domconstruct.create("div");
                            this.symbolRenderer.renderSymbol(iconNode, g);

                            t += "<div><span class='ctPOIIcon'>" + iconNode.innerHTML + "</span>";

                            if (items.length === 1) {
                                t += "<span class='ctPOINameLabel'>" + i.primaryLabel + "</span>";
                                t += " - <span class='ctPOITypeLabel'>" + (i.poitypetitle || i.poitype) + "</span></div>";
                            } else {
                                t += "<span class='ctPOINameLabel'>" + i.primaryLabel + " - </span><span class='ctPOITypeLabel'>" + (i.poitypetitle || i.poitype) + "</span>";
                                t += "</div>";
                                return false;
                            }

                        }

                    }, this);

                    if (items && items.length > 1) {
                        d_domclass.add(this.domNode, "ctPOIMultiple");
                    }

                    this.node.innerHTML = t;

                },

                onHide: function () {
                },

                deactivate: function () {
                    if (this._listeners) {
                        this._listeners.disconnect();
                    }
                },

                destroy: function () {
                    this.deactivate();
                    this.inherited(arguments);
                }
            }
        );
        POIHoverInfoWidget.createWidget = function (
            params,
            contentFactory
            ) {
            var opts = contentFactory.get("POIHoverInfoWidget");
            return new POIHoverInfoWidget({
                geometry: params.content.geometry,
                items: params.content.items,
                rule: params.rule,
                i18n: opts.i18n,
                pos: params.context.position,
                contentViewer: contentFactory.get("contentViewer")
            });
        };
        return POIHoverInfoWidget;
    }
);