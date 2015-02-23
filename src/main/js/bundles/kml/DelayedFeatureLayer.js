/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 23.09.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/_when",
        "ct/async",
        "esri/layers/GraphicsLayer",
        "esri/graphic",
        "esri/symbols/Symbol"
    ],
    function (
        declare,
        d_array,
        ct_when,
        ct_async,
        GraphicsLayer,
        Graphic
        ) {
        return declare([GraphicsLayer],
            {
                constructor: function (
                    def
                    ) {
                    ct_when(def, function (collection) {

                        d_array.forEach(collection.features, function (feature) {

                            var g = new Graphic({
                                geometry: feature.geometry,
                                attributes: feature.attributes
                            });
                            g.symbol = feature.symbol;
                            this.add(g, false);

                        }, this);

                        this.fields = collection.fields;
                        this.objectIdField = collection.objectIdField;
                        this.extent = collection.extent;

                    }, function (error) {
                        this.onError(error);
                    }, this);
                }
            }
        );
    }
);