/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 11.02.14
 * Time: 09:06
 */
define([
        "dojo/_base/declare",
        "ct/util/css",
        "dijit/MenuItem",
        "dojo/text!./templates/ImageMenuItem.html"
    ],
    function (
        declare,
        ct_css,
        MenuItem,
        templateString
        ) {
        return declare([MenuItem],
            {
                templateString: templateString,
                overlayLabel: "",

                constructor: function () {

                },

                _onFocus: function () {
                    //important! override because of the double click selection problem!
                },

                _setOverlayLabelAttr: function (val) {
                    this._set("overlayLabel", val);
                    this.overlayLabelNode.innerHTML = val;
                },

                _setSelected: function (selected) {
                    this.inherited(arguments);
                    ct_css.toggleClass(this.overlayLabelNode, "dijitHidden", !selected);
                    ct_css.toggleClass(this.overlayNode, "dijitHidden", !selected);
                }

            }
        )
    }
);