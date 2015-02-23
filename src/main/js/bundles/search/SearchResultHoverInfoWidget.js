/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 22.05.13
 * Time: 09:14
 */
define([
        "dojo/_base/declare",
        "dojo/dom-geometry",
        "dojo/dom-class",
        "dojo/window",
        "ct/_Connect",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin"
    ],
    function (
        declare,
        d_domgeom,
        d_domclass,
        d_window,
        Connect,
        _WidgetBase,
        _TemplatedMixin
        ) {
        var SearchResultHoverInfoWidget = declare([
                _WidgetBase,
                _TemplatedMixin
            ],
            {
                templateString: "<div><div class=\"ctSearchResultHoverMainNode\" data-dojo-attach-point=\"node\"></div></div>",
                baseClass: "ctSearchResultHoverInfoWidget",

                rule: null,

                SEARCH_RESULT_HOVER: "agivSearchResultHover",

                constructor: function (args) {
                    this._listeners = new Connect({
                        defaultConnectScope: this
                    });
                    this._listeners.connect("onWindowCreated", args.contentViewer.windowManager,
                        "onWindowCreated", this,
                        this._saveContentWindow);
                },

                _saveContentWindow: function (evt) {
                    if (evt.window.get("windowName") === this.SEARCH_RESULT_HOVER) {
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
                        t: this.pos.t
                    });
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this.rule.window.marginBox = this.rule.windowSize;

                    this.node.innerHTML = this.content.title || this.item.shortTitle || this.item.title;
                },

                deactivate: function () {
                    this._listeners.disconnect();
                }
            }
        );
        SearchResultHoverInfoWidget.createWidget = function (
            params,
            contentFactory
            ) {
            var opts = contentFactory.get("SearchResultHoverInfoWidget");
            return new SearchResultHoverInfoWidget({
                geometry: params.content.geometry,
                content: params.content,
                item: params.content.item,
                rule: params.rule,
                i18n: opts.i18n,
                pos: params.context.position,
                contentViewer: contentFactory.get("contentViewer")
            });
        };
        return SearchResultHoverInfoWidget;
    }
);