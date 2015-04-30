/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 23.10.13
 * Time: 12:24
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array"
    ],
    function (
        declare,
        d_lang,
        d_array
        ) {
        return declare([],
            {
                constructor: function (opts) {

                    this.duplicateIdentifier = opts.duplicateIdentifier;

                },

                process: function (
                    results,
                    targetQuery,
                    requestOptions
                    ) {

                    var lut = {};

                    return d_array.filter(results, function (item) {

                        if (lut[item[this.duplicateIdentifier]] === undefined) {
                            lut[item[this.duplicateIdentifier]] = item;
                            return item;
                        }
                        return null;

                    }, this);

                }
            }
        )
    }
);