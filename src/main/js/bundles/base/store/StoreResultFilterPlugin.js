/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 10.10.13
 * Time: 11:02
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

                    this.filterOptions = opts.filterOptions;

                },

                process: function (
                    results,
                    targetQuery,
                    requestOptions
                    ) {

                    return d_array.filter(results, function (item) {

                        var discard = false;

                        d_array.some(this.filterOptions, function (option) {

                            if (requestOptions[option] !== undefined) {

                                if (d_lang.isArray(requestOptions[option]) && requestOptions[option].length > 0) {

                                    var keep = false;

                                    d_array.forEach(requestOptions[option], function (optionValue) {

                                        //in this case it should be the correct value not a boolean
                                        if (item[option] === optionValue) {
                                            keep = true;
                                        }

                                    });

                                    discard = !keep;

                                } else if (d_lang.isObject(requestOptions[option])) {

                                    //in this case we figure its a boolean
                                    discard = !requestOptions[option][item[option]];

                                } else {

                                    //in this case it should be the correct value not a boolean
                                    if (item[option] !== requestOptions[option]) {
                                        discard = true;
                                    }

                                }

                            }

                            return discard;

                        });

                        return discard ? null : item;

                    }, this);

                }
            }
        )
    }
);