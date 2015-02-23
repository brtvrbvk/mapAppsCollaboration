/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 24.05.13
 * Time: 09:43
 */
define([
        ".",
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/Stateful",
        "ct/mapping/mapcontent/ServiceTypes"
    ],
    function (
        _moduleRoot,
        declare,
        d_array,
        Stateful,
        ServiceTypes
        ) {
        return _moduleRoot.POIEventReciever = declare([Stateful],
            {
                constructor: function () {

                },

                onPOIHover: function (evt) {
                    var contentModelNode = evt._properties.entries.item;
                    if (contentModelNode) {
                        if (contentModelNode.service.serviceType == ServiceTypes.POI) {
                            var mapModelNode = this._findMapModelNodeForCMNode(contentModelNode);
                            if (mapModelNode) {
                                var model = mapModelNode.store || mapModelNode.parent.store;
                                if (model) {
                                    var sel = model.getIdList();
                                    console.debug("selecting all");
                                    model.setSelected(sel, true);
                                    model.triggerNodeRefresh(true);
                                }
                            }
                        }
                    }
                },

                _findMapModelNodeForCMNode: function (contentModelNode) {
                    return this.mapModel.getNodeById(contentModelNode.id);
                },

                onPOILeave: function (evt) {
                    var contentModelNode = evt._properties.entries.item;
                    if (contentModelNode) {
                        if (contentModelNode.service.serviceType == ServiceTypes.POI) {
                            var mapModelNode = this._findMapModelNodeForCMNode(contentModelNode);
                            if (mapModelNode) {
                                var model = mapModelNode.store || mapModelNode.parent.store;
                                if (model) {
                                    console.debug("unselecting all");
                                    var sel = model.getIdList();
                                    model.setSelected(sel, false);
                                    model.triggerNodeRefresh(true);
                                }
                            }
                        }
                    }
                }
            }
        )
    }
);