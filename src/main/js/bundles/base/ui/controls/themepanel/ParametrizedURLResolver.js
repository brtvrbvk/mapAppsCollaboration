define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/json",
        "dojo/_base/array",
        "ct/array",
        "base/util/CommonID",
        "ct/Stateful"
    ],
    function (
        declare,
        d_lang,
        d_json,
        d_array,
        ct_array,
        commonID,
        Stateful
        ) {
        /*
         * COPYRIGHT 2010-2011 con terra GmbH Germany
         */
        return declare([Stateful],
            {

                decodeableProperty: "son",

                constructor: function () {
                },

                read: function (obj) {
                    return this.decodeURLParameter(obj);
                },

                decodeURLParameter: function (url) {

                    var selectedOpLayers = url && url[this.decodeableProperty] && d_json.fromJson(url[this.decodeableProperty]);

                    var layers = commonID.findIdsInModel(this._contentModel, selectedOpLayers);

                    //first add all layers to mapmodel
                    d_array.forEach(layers, function (lay) {

                        this._contentModelController.enableLayerInContentModel({id: lay.get("id")});

                    }, this);

                    //then apply attributes in mapmodel
                    d_array.forEach(selectedOpLayers, function (lay) {

                        var layer = commonID.findIdInModel(this._mapModel, lay.id);
                        if (layer) {
                            layer.set("opacity", lay.opacity);
                            layer.set("renderPriority", lay.renderPriority);
                            layer.set("enabled", lay.enabled);
                        }

                    }, this);

                    this._mapModel.fireModelStructureChanged();
                }

            });
    });