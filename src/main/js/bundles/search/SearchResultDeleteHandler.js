/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 24.07.2014.
 */
define([
        "dojo/_base/declare",
        "ct/Stateful",
        "ct/_Connect"
    ],
    function (
        declare,
        Stateful,
        _Connect
        ) {
        return declare([
                Stateful,
                _Connect
            ],
            {
                constructor: function () {

                },

                deleteSearchResult: function (evt) {

                    var id = evt && evt.tool && evt.tool.managedLayerId;
                    if (id) {
                        var node = this.operational.findChildById(id);
                        if (node) {
                            this.operational.removeChild(node);
                        } else {
                            node = this.graphics.findChildById(id);
                            this.graphics.removeChild(node);
                        }
                        this.mapModel.fireModelStructureChanged({
                            source: this,
                            action: "layerRemove",
                            layerId: id
                        });
                        this.eventService.postEvent("ct/contentmanager/REMOVE_ITEM", {
                            itemId: id
                        });
                        this.contentViewer.closeContentInfo(this.contentViewer.findContentInfoById("featureInfo"));
                    }

                },

                activate: function () {

                    this.operational = this.mapModel.getOperationalLayer();
                    this.graphics = this.mapModel.getGlassPaneLayer();

                },

                deactivate: function () {

                }
            }
        );
    }
);