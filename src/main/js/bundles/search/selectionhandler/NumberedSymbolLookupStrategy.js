/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 21.07.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ct/mapping/edit/SymbolTableLookupStrategy"
    ],
    function (
        declare,
        d_lang,
        SymbolTableLookupStrategy
        ) {
        return declare([SymbolTableLookupStrategy],
            {

                lookup: function (
                    geometry,
                    attributes,
                    context
                    ) {
                    var attrVal = attributes[this.lookupAttributeName],
                        geomType = geometry.type,
                        s = null,
                        typefix = attrVal > 20 ? "" : "-" + attrVal,
                        postfix = window.devicePixelRatio > 1 ? "-highres" : "";

                    if (geomType) {
                        s = this._lookupByAttrValue(geomType + typefix + postfix);
                        if (!s) {
                            s = this._lookupByGeomType(geomType);
                        }
                    } else if (attrVal) {
                        s = this._lookupByAttrValue(attrVal);
                    }

                    return s || this.inherited(arguments);
                }
            });
    });