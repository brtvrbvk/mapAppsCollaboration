/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 04.04.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/window",
        "ct/util/css",
        "./_Adapter"
    ],
    function (
        declare,
        d_array,
        d_win,
        ct_css,
        _Adapter
        ) {
        return declare([_Adapter],
            {

                _mapModel: null,

                constructor: function () {

                },

                activate: function () {

                    this.connect("mapmodel", this._mapModel, "onModelStructureChanged", "_sync");
                    this.connect("mapmodel", this._mapModel, "onModelNodeStateChanged", "_sync");

                },

                _sync: function () {

                    this.onUpdate();

                },

                getItems: function () {

                    return this._mapModel.getBaseLayer().get("children");

                },

                deselectItem: function (item) {

                    var node = this._mapModel.getNodeById(item.id);
                    if (node) {
                        node.set("enabled", false);
                        this._mapModel.fireModelNodeStateChanged();
                    }

                },

                _checkGrb: function (item) {
                    var isGrb = false;
                    if (item) {
                        d_array.forEach(this.grbIDs, function (id) {
                            if (item.id.indexOf(id) > -1) {
                                isGrb = true;
                            }
                        }, this);
                    }
                    ct_css.toggleClass(d_win.body(), "grb_active", isGrb);
                },

                selectItem: function (item) {

                    var node = this._mapModel.getNodeById(item.id);
                    if (node) {
                        node.set("enabled", true);
                        this._checkGrb(item);
                        this._mapModel.fireModelNodeStateChanged();
                    }

                }
            }
        )
    }
);