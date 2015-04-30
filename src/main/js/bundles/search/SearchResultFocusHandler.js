/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 22.05.13
 * Time: 08:43
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ct/_Connect",
        "ct/Stateful",
        "ct/_when",
        "dojo/has",
        "dojo/_base/sniff"
    ],
    function (
        declare,
        d_lang,
        Connect,
        Stateful,
        ct_when,
        has
        ) {
        return declare([
                Connect,
                Stateful
            ],
            {
                _searchResultNodeIdPattern: /SEARCH_RESULT/,

                constructor: function () {
                },

                activate: function () {
                    this._connectToMouseOver();
                },

                _connectToMouseOver: function () {
                    this.connect("onGraphicMouseOver", this.mapstate, "onGraphicMouseOver",
                        this.handleOnGraphicOver);
                },
                _connectToMouseOut: function () {
                    this.connect("onGraphicMouseOut", this.mapstate, "onGraphicMouseOut",
                        this.handleOnGraphicOut);
                },

                handleOnGraphicOver: function (evt) {
                    if (evt && evt.graphic) {
                        var attr = evt.graphic.attributes;
                        if (attr && attr.type && attr.type.match(this._searchResultNodeIdPattern)) {
                            this._handleSearchResultHover(evt);
                        }
                    }
                },

                _handleSearchResultHover: function (evt) {
                    //we must disconnect the graphic over event to prevent duplicate executions
                    this.disconnect("onGraphicMouseOver");
                    var graphic = evt.graphic;
                    var content = {
                        geometry: graphic.geometry,
                        item: graphic.attributes
                    };
                    // http://codepen.io/billdwhite/pen/rgEbc
                    var l, t;
                    if (!has("ie") || has("ie") > 8) {
                        var matrix = evt.target.getScreenCTM();
                        var x = evt.target.getAttribute("x");
                        var y = evt.target.getAttribute("y");
                        l = x ? matrix.translate(x, y).e : evt.pageX;
                        t = y ? matrix.translate(x, y).f : evt.pageY;
                    } else {
                        l = evt.pageX;
                        t = evt.pageY;
                    }
                    var context = d_lang.mixin({
                        source: "SearchResultFocusHandler",
                        type: "SearchResultHoverInfoWidget",
                        position: {
                            l: l,
                            t: t
                        }
                    }, {});

                    var contentInfo = this.contentviewer.findContentInfoById("searchresulthover");
                    this.contentviewer.closeContentInfo(contentInfo);
                    content.id = "searchresulthover";
                    this._lastWindow = this.contentviewer.showContentInfo(content, context, false);

                    this._connectToMouseOut();
                },

                _closeWindow: function (w) {
                    if (w && w.close) {
                        w.close();
                    }
                    if (w && w.then) {
                        if (w.isFulfilled()) {
                            ct_when(w, function (w) {
                                w.close();
                            });
                        } else {
                            w.cancel();
                        }
                    }
                },

                handleOnGraphicOut: function (evt) {
                    this.disconnect("onGraphicMouseOut");
                    this._closeWindow(this._lastWindow);
                    this._connectToMouseOver();
                },

                closeContentInfo: function (contentInfo) {
                    if (contentInfo && contentInfo.contentWindow) {
                        this._closeWindow(contentInfo.contentWindow);
                    }
                },

                deactivate: function () {
                    this.disconnect();
                }
            }
        );
    }
);