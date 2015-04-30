/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 29.07.2014.
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "ct/_Connect",
        "./infotree/InfoTree"
    ],
    function (
        declare,
        Stateful,
        _Connect,
        InfoTree
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
                    return new InfoTree({
                        mapModel: this._mapModel,
                        model: this.model,
                        rootId: rootNodeId,
                        i18n: this.i18n.ui.tree,
                        'class': 'ctInfoTree',
                        eventService: this.eventService,
                        collapsed: this.collapsed
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