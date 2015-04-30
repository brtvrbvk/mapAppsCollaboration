define([
    "dojo/_base/declare",
    "dojo/_base/array"
], function (
    declare,
    d_array
    ) {
    /**
     * COPYRIGHT 2010-2011 con terra GmbH Germany
     */
    return declare([], {

        ruleProperties: ["timeSliderLegend"],

        isRuleFulfilled: function (
            tool,
            context,
            toolRuleDef
            ) {
            var ruleValue = toolRuleDef.timeSliderLegend;
            if (ruleValue === undefined) {
                return [];
            }
            var activeLayers = this.mapModel.getEnabledServiceNodes();
            var showLegendTool = false;
            d_array.some(activeLayers, function (layer) {
                if (layer.legendURL || this.legendUI.getLegendMappingById(layer.get("id"))) {
                    showLegendTool = true;
                    return true;
                }
            }, this);
            if (showLegendTool)
                return true;
            return false;
        }
    });
});