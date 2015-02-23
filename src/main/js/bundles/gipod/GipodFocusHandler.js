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
        "dojo/_base/array",
        "dojo/DeferredList",
        "ct/_Connect",
        "ct/_equal",
        "ct/Stateful",
        "ct/_when",
        "dojo/has",
        "dojo/_base/sniff"
    ],
    function (
        declare,
        d_lang,
        d_array,
        DeferredList,
        Connect,
        ct_equal,
        Stateful,
        ct_when,
        has
        ) {
        return declare([
                Connect,
                Stateful
            ],
            {
                constructor: function () {
                },

                activate: function () {
                    this._connectToMouseOver();
                },

                _connectToMouseOver: function () {
                    this.connect("onGraphicMouseOver", this.mapstate,
                        "onGraphicMouseOver",
                        this.handleOnGraphicOver);
                },
                _connectToMouseOut: function () {
                    this.connect("onGraphicMouseOut", this.mapstate,
                        "onGraphicMouseOut",
                        this.handleOnGraphicOut);
                    this.connect("onGraphicMouseOut", this.mapstate,
                        "onMouseOut",
                        this.handleOnGraphicOut);
                },

                handleOnGraphicOver: function (evt) {
                    if (evt && evt.graphic) {
                        var geometry = evt.graphic.geometry;
                        var isPoi = evt.graphic.attributes && evt.graphic.attributes.items;
                        if (isPoi && geometry) {
                            this._handlePOIhover(evt);
                        }
                    }
                },

                _handlePOIhover: function (evt) {
                    var hasSVGSupport = !has("ie") || has("ie") > 8;
                    if (hasSVGSupport) {
                        if (evt.toElement instanceof SVGTextElement) {
                            return;
                        }
                        // http://codepen.io/billdwhite/pen/rgEbc
                        var l, t;
                        var matrix = evt.target.getScreenCTM();
                        var x = evt.target.getAttribute("x");
                        var y = evt.target.getAttribute("y");
                        l = x ? matrix.translate(x, y).e : evt.pageX;
                        t = y ? matrix.translate(x, y).f : evt.pageY;
                    } else {
                        l = evt.pageX;
                        t = evt.pageY;
                    }
                    //we must disconnect the graphic over event to prevent duplicate executions
                    this.disconnect("onGraphicMouseOver");
                    var graphic = evt.graphic;
                    var content = {
                        geometry: graphic.geometry,
                        items: graphic.attributes.items
                    };
                    var context = d_lang.mixin({
                        source: "GipodFocusHandler",
                        type: "GipodHoverInfoWidget",
                        position: {
                            l: l,
                            t: t
                        }
                    }, {});

                    var contentInfo = this.contentviewer.findContentInfoById("gipodhover");
                    this.contentviewer.closeContentInfo(contentInfo);
                    content.id = "gipodhover";
                    ct_when(this.contentviewer.showContentInfo(content,
                            context,
                            false),
                        function (w) {
                            this._lastWindow = w;
                            this._connectToMouseOut();
                        }, function (err) {
                        }, this);

                },

                _closeWindow: function (w) {
                    if (w) {
                        w.close();
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
        )
    }
);