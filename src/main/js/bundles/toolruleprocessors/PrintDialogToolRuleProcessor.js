/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 19.09.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/Stateful",
        "ct/_Connect"
    ],
    function (
        declare,
        d_array,
        Stateful,
        _Connect
        ) {
        return declare([
                Stateful,
                _Connect
            ],
            {
                ruleProperties: [
                    "printDialog"
                ],
                constructor: function () {

                },

                isRuleFulfilled: function (
                    tool,
                    context,
                    toolRuleDef
                    ) {
                    var results = [];
                    var toolRule = toolRuleDef.printDialog;
                    if (toolRule === undefined) {
                        // no rule evaluation required
                        return[];
                    }

                    if (toolRule !== undefined) {
                        results.push(context.get("printDialog") === toolRule);
                    }
                    return results;
                },

                showDialog: function (evt) {
                    var context = this.ruleContextState;
                    context.set("printDialog", evt.getProperty("printDialog") || "basic");
                },

                activate: function () {
                    var context = this.ruleContextState;
                    context.get("printDialog") === undefined ? context.set("printDialog", "basic") : null;
                },

                deactivate: function () {

                }
            }
        );
    }
);