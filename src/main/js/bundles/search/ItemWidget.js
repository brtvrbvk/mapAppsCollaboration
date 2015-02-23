/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 04.07.13
 * Time: 15:47
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/dom-geometry",
        "dojo/dom-class",
        "dijit/_Widget",
        "dijit/MenuItem",
        "dijit/Tooltip"
    ],
    function (
        declare,
        d_array,
        d_domgeom,
        d_domclass,
        _Widget,
        MenuItem,
        Tooltip
        ) {
        return declare([MenuItem],
            {
                item: null,

                focusable: true,

                constructor: function () {
                },

                postCreate: function () {
                    this.inherited(arguments);
                    if (!this.focusable) {
                        d_domclass.add(this.domNode, "ctSearchCategory");
                    }
                    d_domclass.add(this.domNode, this.additionalClass);
                    if (this.item) {
                        this._tooltip = new Tooltip({
                            label: this.item.title,
                            connectId: [this.domNode]
                        });
                    }
                },

                _setSelected: function () {
                    //override to prevent nullpointer, we don´t need selection logic
                },

                destroy: function () {
                    this.inherited(arguments);
                    if (this._tooltip) {
                        this._tooltip.destroy();
                    }
                },

                isFocusable: function () {
                    return this.focusable;
                },

                _onClick: function () {
                    this.inherited(arguments);
                    if (this.item && this.item.onSelectCallback) {
                        this.item.onSelectCallback(this.item);
                    }
                },

                resize: function (dim) {
                    this.inherited(arguments);
                    if (dim && dim.w) {
                        d_domgeom.setMarginBox(this.containerNode, {
                            w: dim.w
                        });
                    }
                }
            }
        );
    }
);