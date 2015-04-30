/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 04.07.13
 * Time: 15:47
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "dojo/dom-geometry",
        "dojo/_base/array",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "ct/util/css"
    ],
    function (
        declare,
        d_lang,
        d_dom,
        d_domgeom,
        d_array,
        _WidgetBase,
        _TemplatedMixin,
        ct_css
        ) {
        return declare([
                _WidgetBase,
                _TemplatedMixin
            ],
            {
                templateString: '<div data-dojo-attach-point="containerNode"></div>',
                baseClass: "ctSearchResultAttachPointWidget",

                constructor: function () {

                },

                postCreate: function () {
                    this.inherited(arguments);
                },

                _setResultAttr: function (res) {
                    if (this._result) {
                        this._result.destroyRecursive();
                    }
                    this._result = res;

                    d_dom.empty(this.containerNode);

                    res.placeAt(this.containerNode);
                    this.resize();
                },

                hide: function () {
                    ct_css.switchVisibility(this.domNode, false);
                },
                show: function () {
                    ct_css.switchVisibility(this.domNode, true);
                },

                resize: function () {
                    this.inherited(arguments);
                    if (this._result) {
                        var mb = d_domgeom.getMarginBox(this._result.domNode);

                        if (mb.h > 0) {
                            d_domgeom.setMarginBox(this.domNode, {h: mb.h});
                        }
                    }
                }
            }
        )
    }
);