/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 29.07.2014.
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "ct/_Connect",
        "../drilldowntree/DrillDownTree"
    ],
    function (
        declare,
        Stateful,
        _Connect,
        DrillDownTree
        ) {
        return declare([
                Stateful,
                _Connect
            ],
            {
                constructor: function () {

                },

                createInstance: function () {

                    var rootNodeId = this.model.operationalLayerNodeId;
                    return new DrillDownTree({
                        model: this.model,
                        rootId: rootNodeId,
                        i18n: this.i18n.ui.tree
                    });

                },

                activate: function () {
                    this.i18n = this._i18n.get();
                },

                deactivate: function () {

                }
            }
        );
    }
);