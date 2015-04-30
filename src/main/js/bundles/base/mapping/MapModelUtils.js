/**
 * COPYRIGHT 2015 con terra GmbH Germany
 *
 * Created by fba on 01.04.2015.
 */
define([
        "dojo/_base/array",
        "dojo/_base/lang"
    ],
    function (d_array, d_lang) {
        return {
            getNextRenderPriority: function (mapmodel) {
                var maxPriority = 1;
                var opLayers = mapmodel.getOperationalLayer().children;
                d_array.forEach(opLayers, d_lang.hitch(this, function (layer) {
                    if (layer.get("renderPriority") && layer.get("renderPriority") > maxPriority) {
                        maxPriority = layer.get("renderPriority");
                    }
                }));
                return maxPriority + 1;
            }
        };
    }
);