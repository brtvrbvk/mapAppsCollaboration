/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 23.09.2014.
 */
define([
        "dojo/_base/declare",
        "ct/_when",
        "ct/mapping/layers/FeatureLayer"
    ],
    function (
        declare,
        ct_when,
        FeatureLayer
        ) {
        return declare([FeatureLayer],
            {

//                "-chains-": {
//                    constructor: "manual"
//                },
                _preventInit: true,
                constructor: function (
                    def,
                    opts
                    ) {
                    this._opts = opts;
                    ct_when(def, function (collection) {
                        this._initFeatureLayer(collection, this._opts);
                    }, function (error) {
                        this.onError(error);
                    }, this);
                }
            }
        );
    }
);