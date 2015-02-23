/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/dom-construct",
        "ct/util/css",
        "ct/request",
        "ct/_when",
        "dojo/string",
        "dojo/Deferred",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/NodeInfoWidget.html",
        "dijit/layout/ContentPane",
        "dijit/form/Button",
        "ct/ui/controls/MessagePane"
    ],
    function (
        declare,
        d_array,
        d_dom,
        css,
        ct_request,
        ct_when,
        d_string,
        Deferred,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        tString
        ) {
        var NodeInfoWidget = declare([
            _WidgetBase,
            _TemplatedMixin,
            _WidgetsInTemplateMixin
        ], {

            templateString: tString,
//            baseClass:"ctNodeInfoWidget",
            i18n: {
                ui: {
                    scale: "Van schaal ${maxScale} tot ${minScale}",
                    linkToMetadata: "link to metadata",
                    loadingMetadata: "loading metadata",
                    noMetadata: "no metadata"
                }
            },

            constructor: function () {

            },

            postCreate: function () {
                this.inherited(arguments);

                css.switchVisibility(this.mainNode.domNode, false);
                css.switchVisibility(this.messageNode, true);
                this.showMessage(this.i18n.ui.loadingMetadata, "loading");

                var d = new Deferred();
                this._metadata = {};
                ct_when(this.content.infoController.retrieveMetadataLinks(this.content),
                    function (meta) {
                        css.switchVisibility(this.messageNode, false);
                        css.switchVisibility(this.mainNode.domNode, true);
                        this._showDescription();
                        this.mainNode.resize();
                        this._metadata["result"] = meta;
                        d.resolve(meta);
                    }, function (err) {
                        this._metadata["error"] = err;
                        css.switchVisibility(this.messageNode, false);
                        css.switchVisibility(this.moreInfoNode, false);
                        css.switchVisibility(this.mainNode.domNode, true);
                        this._showDescription();
                        this.mainNode.resize();
                        d.resolve(err);
                    }, this);
            },

            _showDescription: function () {
                var item = this.content;
                this.titlenode.innerHTML = item.title;

                var desc = item.description;
                var minScale = item.minScale;
                var maxScale = item.maxScale;

                if (!desc) {

                    ct_when(this.content.infoController.retrieveDescritpion(this.content),
                        function (abs) {

                            if (abs && abs.length > 0) {
                                this.descriptionnode.innerHTML = (abs[0]) ? abs[0] : "";
                            }

                        }, function (err) {

                        }, this);

                } else {

                    this.descriptionnode.innerHTML = desc;

                }

                if ((minScale === undefined && maxScale === undefined) || (minScale === 0 && maxScale === 0)) {
                    css.switchHidden(this.scalenode, true);
                } else {
                    var t = d_string.substitute(this.i18n.ui.scale, {
                        minScale: minScale,
                        maxScale: maxScale
                    });
                    this.scalenode.innerHTML = t;
                }
            },

            _onMoreInfoClick: function () {

                if (this._metadata["result"]) {
                    var meta = this._metadata["result"];

                    if (this.content.pro && meta && meta.length > 1) {

                        css.switchVisibility(this.linkNode, true);
                        d_array.forEach(meta, function (metadata) {

                            var li = d_dom.create("li", {
                            }, this.linkNode);
                            d_dom.create("a", {
                                target: "_blank",
                                href: metadata.link,
                                innerHTML: metadata.link
                            }, li);

                        }, this)

                    } else if (meta && meta.length === 1) {

                        window.open(meta[0].link);

                    } else if (meta && meta.length === 0) {

                        css.switchVisibility(this.messageNode, true);
                        this.showMessage(this.i18n.ui.noMetadata, "error");

                    } else {
                        d_array.forEach(meta, function (metadata) {

                            if (metadata.format === "text/html") {
                                window.open(metadata.link);
                            }

                        }, this)
                    }

                } else if (this._metadata["error"]) {
                    this.showMessage(this.i18n.ui.noMetadata, "error: " + this._metadata["error"]);
                }

            },

            showMessage: function (
                msg,
                type
                ) {
                this.messagePane.clearMessages();
                this.messagePane.addMessage({
                    type: type || "info",
                    value: msg
                }, true);
            },

            resize: function (dim) {
                this.mainNode.resize(dim);
            }

        });

        NodeInfoWidget.createWidget = function (
            params,
            contentFactory
            ) {
            return new NodeInfoWidget({
                content: params.content,
                context: params.context,
                i18n: contentFactory.get("NodeInfoWidget").i18n
            });
        };
        return NodeInfoWidget;
    });
