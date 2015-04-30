define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/string",
        "ct/array",
        "ct/util/css",
        "ct/_when",
        "ct/_Connect",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/DiversionsTabWidget.html",
        "dijit/layout/TabContainer",
        "dijit/layout/ContentPane"
    ],
    function (
        declare,
        d_array,
        d_lang,
        d_string,
        ct_array,
        ct_css,
        ct_when,
        Connect,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        templateStringContent
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */
        /**
         * @fileOverview This file provides a feature info widget.
         */
        var DiversionsTabWidget = declare([
                _Widget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {
                baseClass: "ctGipodInfoResult",
                templateString: templateStringContent,

                constructor: function () {
                },

                postCreate: function () {

                    this.inherited(arguments);

                    this.title = this.i18n.title;

                    var item = this.content;
                    this._originalGeometries = item.geometries;

                    if (item.diversions.length === 1) {

                        this._addSingle(item.diversions[0], item);

                    } else {

                        this._addMultiple(item.diversions, item);

                    }

                },

                _addMultiple: function (
                    diversions,
                    item
                    ) {

                    d_array.forEach(diversions,
                        function (
                            diversion,
                            idx
                            ) {

                            var c = {
                                infotype: "GIPOD_DIVERSIONS_WIDGET"
                            };

                            diversion.diversionsIndex = idx + 1;
                            diversion.diversionsLength = diversions.length;
                            diversion.diversionGeometries = diversion.geometries;
                            diversion.geometries = this._originalGeometries;

                            ct_when(this.contentviewer.resolveContentWidget(diversion,
                                    c),
                                function (w) {

                                    if (w) {
                                        this.tabcontainer.addChild(w);
                                    }

                                },
                                function (err) {
                                    console.error(err);
                                },
                                this);

                        }, this);

                },

                _addSingle: function (
                    diversion,
                    item
                    ) {

                    this._isSingle = true;

                    var c = {
                        infotype: "GIPOD_DIVERSIONS_WIDGET"
                    };

                    diversion.diversionGeometries = diversion.geometries;
                    diversion.geometries = this._originalGeometries;

                    var elem = d_lang.mixin({}, item);
                    elem = d_lang.mixin(elem, diversion);

                    ct_when(this.contentviewer.resolveContentWidget(elem,
                            c),
                        function (w) {

                            if (w) {
                                this.singlenode.set("content",
                                    w);
                            }

                        }, function (err) {
                            console.error(err);
                        }, this);

                },

                startup: function () {
                    this.inherited(arguments);

                },

                resize: function (dim) {
                    if (this._isSingle) {

                        this.singlenode.resize(dim);

                    } else {

                        this.tabcontainer.resize(dim);

                    }
                }
            });
        DiversionsTabWidget.createWidget = function (
            params,
            contentFactory
            ) {
            var opts = contentFactory.get("DiversionsTabWidget");
            var widget = new DiversionsTabWidget({
                content: params.content,
                context: params.context,
                metadata: opts.metadata,
                i18n: opts.i18n,
                contentviewer: contentFactory.get("contentviewer")
            });
            var bundleCtx = contentFactory._componentContext.getBundleContext();
            bundleCtx.registerService(["gipod.DiversionsTabWidget"], widget);

            return widget;
        };
        return DiversionsTabWidget;
    });