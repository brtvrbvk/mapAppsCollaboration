/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-construct",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "./RoutingResultWidget"
    ],
    function (
        declare,
        d_lang,
        d_array,
        d_domconstruct,
        _Widget,
        _TemplatedMixin,
        RoutingResultWidget
        ) {
        var PrintedRoutingResultWidget = declare([
            _Widget,
            _TemplatedMixin
        ], {

            templateString: "<div><span data-dojo-attach-point='resultNode'></span></div>",

            constructor: function (args) {
                this._i18n = args.i18n.get().ui;
            },

            _setRoutingresultAttr: function (obj) {
                if (!obj) {
                    return;
                }
                if (this._resultWidgets && this._resultWidgets.length > 0) {
                    d_array.forEach(this._resultWidgets, function (rw) {
                        rw.destroyRecursive();
                    });
                }
                this._resultWidgets = [];
                if (obj.routes) {
                    d_array.forEach(obj.routes, function (r) {
                        var w = new RoutingResultWidget({
                            type: "print",
                            route: r,
                            i18n: this._i18n,
                            transportType: r.type,
                            transportMode: r.transportation[0],
                            targets: obj.targets,
                            markerUrls: obj.markerUrls
                        });
                        this._resultWidgets.push(w);
                        d_domconstruct.place(w.domNode, this.resultNode);
                    }, this);
                }
            },
            destroy: function () {
                this.inherited(arguments);
            }

        });
        return PrintedRoutingResultWidget;
    });
