define([
        "dojo/_base/declare",
        "ct/mapping/edit/TableLookupStrategy",
        "."
    ],
    function (
        declare,
        TableLookupStrategy,
        _moduleRoot
        ) {
        /*
         * COPYRIGHT 2010-2011 con terra GmbH Germany
         */
        /**
         * @fileOverview This is file provides an resolver for graphics objects.
         */
        return _moduleRoot.PostfixAttributeTableLookupStrategy = declare([TableLookupStrategy],
            /**
             * @lends ct.bundles.resultcenter.PostfixAttributeTableLookupStrategy.prototype
             */
            {
                commentPostfix: "-comment",
                lookup: function (
                    geometry,
                    attributes
                    ) {
                    var commentPostfix = this.commentPostfix;
                    var geomType = geometry.type;
                    var symbol;
                    if (attributes) {
                        var val;
                        if (geomType) {
                            if (attributes.comment) {
                                val = geomType + commentPostfix;
                            }
                            symbol = this._lookupByGeomType(val);
                        }
                    }
                    return symbol || this.inherited(arguments);
                }
            });
    });