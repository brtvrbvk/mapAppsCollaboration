/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/declare",
        "ct/mapping/edit/SymbolTableLookupStrategy"
    ],
    function (
        declare,
        SymbolTableLookupStrategy
        ) {
        var MultipleSymbolLookupStrategy = declare([SymbolTableLookupStrategy], {

            _count: 0,
            constructor: function () {

            },

            lookup: function (
                geometry,
                attributes
                ) {
                var geomType = geometry.type;

                var result = this._lookupByGeomType(geomType);
                if (result) {
                    return result;
                }
                return this._lookupDefault();
            },

            _lookupByGeomType: function (geomType) {
                var geom = this.lookupTable[geomType];
                if (!geom) {
                    return null;
                }
                this._count++;
                return this._toItem(geom[this._count % geom.length]);
            }

        });
        return MultipleSymbolLookupStrategy;
    });
