/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 30.09.13
 * Time: 14:41
 */
define([
        "dojo/_base/declare",
        "./StoreGraphicsLayer"
    ],
    function (
        declare,
        StoreGraphicsLayer
        ) {
        return declare([StoreGraphicsLayer],
            {
                constructor: function () {

                },

                _parseData: function (res) {
                    var count = res.length;
                    var graphics = items.map(function (item) {
                        return this._createGraphic(item, count);
                    }, this);
                    // inner functionen needed , because original "add" reacts on index of forEach.
                    var add = function (x) {
                        this.add(x);
                    };
                    //check if field is available in metadata
                    ct_when(store.getMetadata(), function (metadata) {
                        var fields = metadata.fields;
                        d_array.forEach(fields, function (field) {
                            return true;
                        });
                        this._lastQuery = ct_when(graphics, function (g) {
                            this.clear();
                            d_array.forEach(g, add, this);
                            d.resolve(true);
                        }, this);
                    }, this);
                }
            }
        )
    }
);