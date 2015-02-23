/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by tfu on 04.08.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "ct/util/css",
        "dojo/text!./templates/NearbyPlacesWidget.html",
        "dojo/dom-class",
        "dojo/data/ObjectStore",
        "dojo/store/Memory",
        "dijit/form/Select",
        "ct/_when",
        "base/util/css"
    ],
    function (
        declare,
        d_lang,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        ct_css,
        templateString,
        d_domclass,
        ObjectStore,
        MemoryStore,
        dijitSelect,
        ct_when,
        css
        ) {
        return declare([
                _WidgetBase,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {
                templateString: templateString,
                baseClass: "ctNearbyPlaces",

                postCreate: function () {
                    this.inherited(arguments);
                    var store = new MemoryStore({
                        data: this.radiusOpts
                    });

                    var os = new ObjectStore({ objectStore: store });

                    this.selector = new dijitSelect({
                        store: os,
                        sortByLabel: false
                    }, this.selectRadiusNode);
                    this.selector.set("item", this.radiusOpts[0]);
                },

                _handleResultSelection: function (evt) {
                    var pos = evt.getProperty("result");
                    if (pos.geocodeDeferred) {
                        ct_when(pos.geocodeDeferred, function (res) {
                            this.positionNode.innerHTML = res.title || res.FormattedAddress;
                        }, function (error) {
                            //TODO
                        }, this);
                    } else if (pos.title || pos.FormattedAddress) {
                        this.positionNode.innerHTML = pos.title || pos.FormattedAddress;
                    }
                    css.removePrefixedClasses(this.resultContainer, "result");
                    ct_css.switchVisibility(this.selectionNode, true);
                    ct_css.switchVisibility(this.description, false);
                    d_domclass.add(this.resultContainer, "result" + (pos.resultNumber || ""));
                },

                _handleResultClear: function (evt) {
                    this.positionNode.innerHTML = "";
                    css.removePrefixedClasses(this.resultContainer, "result");
                    ct_css.switchVisibility(this.selectionNode, false);
                    ct_css.switchVisibility(this.description, true);
                },

                startup: function () {
                    this.inherited(arguments);
                }
            }
        );
    }
);