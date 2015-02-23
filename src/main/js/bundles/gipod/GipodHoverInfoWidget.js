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
        "dojo/date/locale",
        "dojo/string",
        "dojo/dom-class",
        "dojo/dom-geometry",
        "dojo/window",
        "ct/_Connect",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/Tooltip"
    ],
    function (
        declare,
        d_array,
        d_date,
        d_string,
        d_domclass,
        d_domgeom,
        d_window,
        Connect,
        _WidgetBase,
        _TemplatedMixin
        ) {
        var GipodHoverInfoWidget = declare([
                _WidgetBase,
                _TemplatedMixin
            ],
            {
                templateString: "<div><div class=\"ctGipodHoverMainNode\" data-dojo-attach-point=\"node\"></div></div>",
                baseClass: "ctGipodHoverInfoWidget",

                rule: null,

                GIPOD_HOVER: "agivGipodHover",

                constructor: function (args) {
                    this._listeners = new Connect({
                        defaultConnectScope: this
                    });
                    this._listeners.connect("onWindowCreated", args.contentViewer.windowManager,
                        "onWindowCreated", this,
                        this._saveContentWindow);
                },

                _saveContentWindow: function (evt) {
                    if (evt.window.get("windowName") === this.GIPOD_HOVER) {
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
                    var x = this.pos.l + 35;
                    d_domclass.replace(evt.source.window.domNode, "ctTooltipAnchorRight", "ctTooltipAnchorLeft");
                    if (this.pos.l > midPointHor) {
                        // display tooltip on the left
                        x = this.pos.l - tooltipBox.w - 5;
                        d_domclass.replace(evt.source.window.domNode, "ctTooltipAnchorLeft", "ctTooltipAnchorRight");
                    }

                    d_domgeom.setMarginBox(evt.source.window.domNode, {
                        l: x,
                        t: this.pos.t - 5
                    });
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this.rule.window.marginBox = this.rule.windowSize;

                    var items = this.items;
                    var t = "", label;

                    var isCluster = items.length > 1;
                    d_array.some(items,
                        function (
                            i,
                            idx
                            ) {
                            if (idx > 4) {
                                t += "<div>...</div>";
                                return true;
                            }
                            if (isCluster) {
                                label = d_string.substitute(this.i18n[i.gipodType],
                                    {
                                        "count": items.length
                                    });
                                t += "<div><span class='ctGipodNameLabel'>" + label + "</span></div>";
                                return true;
                            } else {
                                t += "<div><span class='ctGipodNameLabel'>" + i.cities[0] + "</span></div>";
                                t += "<div><span class='ctGipodNameLabel'>" + i.description + "</span></div>";
                                if (i.recurrencePattern) {
                                    t += "<div><span class='ctGipodNameLabel'>" + i.recurrencePattern + "</span></div>";
                                } else {
                                    t += "<div><span class='ctGipodNameLabel'>" + i.activePeriod + "</span></div>";
                                }
                            }
                        }, this);

                    if (items && items.length > 1) {
                        d_domclass.add(this.domNode,
                            "ctGipodMultiple");
                    }

                    this.node.innerHTML = t;

                },

                onHide: function () {
                },

                deactivate: function () {
                    this._listeners.disconnect();
                }
            }
        );
        GipodHoverInfoWidget.createWidget = function (
            params,
            contentFactory
            ) {
            var opts = contentFactory.get("GipodHoverInfoWidget");
            return new GipodHoverInfoWidget({
                geometry: params.content.geometry,
                items: params.content.items,
                rule: params.rule,
                i18n: opts.i18n,
                pos: params.context.position,
                contentViewer: contentFactory.get("contentviewer")
            });
        };
        return GipodHoverInfoWidget;
    }
);