/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 27.03.2014.
 */
define([
    "dojo/_base/declare",
    "ct/mapping/edit/SymbolTableLookupStrategy"
], function (
    declare,
    SymbolTableLookupStrategy
    ) {
    /**
     * @fileOverview This is file provides an resolver for graphics objects.
     */
    return declare([SymbolTableLookupStrategy], /** @lends resultcenter.PostfixAttributeTableLookupStrategy.prototype*/{
        selectedPostfix: "-selected",
        highlightedPostfix: "-highlighted",
        lookup: function (
            geometry,
            attributes
            ) {
            var selectedPostfix = this.selectedPostfix;
            var highlightedPostfix = this.highlightedPostfix;
            var geomType = geometry.type;
            var symbol;
            if (attributes) {
                var attrVal = attributes[this.lookupAttributeName];
                if (attrVal) {
                    if (attributes.selected) {
                        attrVal = attrVal + selectedPostfix;
                    }
                    if (attributes.focus) {
                        attrVal = attrVal + highlightedPostfix;
                    }
                    symbol = this._lookupByAttrValue(attrVal);
                }
                else {
                    if (attributes.selected) {
                        geomType = geomType + selectedPostfix;
                    }
                    if (attributes.focus) {
                        geomType = geomType + highlightedPostfix;
                    }
                    symbol = this._lookupByGeomType(geomType);
                }
            }
            return symbol || this.inherited(arguments);
        }
    });
});