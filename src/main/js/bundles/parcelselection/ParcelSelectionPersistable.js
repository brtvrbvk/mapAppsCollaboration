/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 15.04.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/json",
        "dojo/_base/array",
        "base/util/GraphicsRenderer",
        "./PostfixTableAttributeLookupStrategy",
        "ct/Stateful",
        "ct/_lang",
        "esri/geometry/jsonUtils"
    ],
    function (
        declare,
        JSON,
        d_array,
        GraphicsRenderer,
        PostfixTableAttributeLookupStrategy,
        Stateful,
        ct_lang,
        e_jsonUtils
        ) {
        return declare([Stateful],
            {
                constructor: function () {

                },

                persist: function (opts) {
                    var data = this.parcelSelectionModel.getRawData();
                    data = d_array.map(data, function (d) {
                        var tmp = {};
                        ct_lang.copyAllProps(tmp, d, ["renderer"]);
                        tmp.geometry = tmp.geometry.toJson ? tmp.geometry.toJson() : tmp.geometry;
                        return tmp;
                    });
                    var states = this.parcelSelectionModel.getRawState();
                    return {
                        parcelStates: JSON.stringify(states),
                        parcelData: JSON.stringify(data)
                    }
                },

                read: function (obj) {
                    var states = obj && obj.parcelStates && JSON.parse(obj.parcelStates);
                    var data = obj && obj.parcelData && JSON.parse(obj.parcelData);
                    data = d_array.map(data, function (d) {
                        var renderer = GraphicsRenderer.createForGraphicsNode(d.ID, this._mapModel,
                                d.title || d.parcelID,
                            d.attributes.type ? d.attributes.type : "SEARCH_RESULT");
                        renderer.set({
                            symbolLookupStrategy: new PostfixTableAttributeLookupStrategy({
                                lookupAttributeName: "geomLookupType",
                                lookupTable: this._symbolTable
                            }),
                            templateLookupStrategy: null
                        });
                        d.renderer = renderer;
                        d.geometry = e_jsonUtils.fromJson(d.geometry);
                        return d;
                    }, this);
                    if (states && data) {
                        this._mapModel.fireModelStructureChanged();
                        this.parcelSelectionModel.setRawData(data);
                        this.parcelSelectionModel.setRawState(states);
                        this.parcelSelectionModel.fireUpdateEvent();
                    }
                }
            }
        )
    }
);