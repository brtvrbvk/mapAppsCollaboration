/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 27.03.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ct/_lang",
        "dojo/_base/array",
        "ct/_when",
        "ct/Stateful",
        "ct/mapping/map/GraphicsLayerNode",
        "ct/mapping/map/CategoryNode",
        "base/util/GraphicsRenderer",
        "./PostfixTableAttributeLookupStrategy"
    ],
    function (
        declare,
        d_lang,
        ct_lang,
        d_array,
        ct_when,
        Stateful,
        GraphicsLayerNode,
        CategoryNode,
        GraphicsRenderer,
        PostfixTableAttributeLookupStrategy
        ) {
        return declare([Stateful],
            {

                CONTENT_MODEL_LAYER_ADD: "contentModelLayerAdd",

                constructor: function () {
                },

                _getAttributesFromItem: function (item) {
                    var attributes = {};
                    ct_lang.copyAllProps(attributes, item, ["geometry"], false);
                    return attributes;
                },

                _renderItems: function (items) {
                    d_array.forEach(items, function (item) {
                        if (item && item.renderer) {
                            item.renderer.clear();
                            item.renderer.draw({
                                geometry: item.geometry,
                                attributes: item.attributes
                            });
                        }
                    }, this);
                },

                renderParcel: function () {

                    ct_when(this.parcelSelectionModel.getUnselected(), function (sel) {
                        this._renderItems(sel);
                    }, this);
                    ct_when(this.parcelSelectionModel.getSelected(), function (sel) {
                        this._renderItems(sel);
                    }, this);

                },

                _handleItemClick: function (evt) {

                    var item = evt && evt.getProperty("layer");
                    if (item && item.nodeType === "SEARCH_RESULT_PARCEL") {
                        this._updateInfoElements();
                        this.parcelSelectionModel.setSelected(item.get("id"), true);
                    } else {
                        this.parcelSelectionModel.setSelected();
                    }
                    this._eventService.postEvent("agiv/parcelselection/HIDE_INFO", {});

                },

                _updateInfoElements: function () {

                    ct_when(this.parcelSelectionModel.getUnselected(), function (elems) {

                        d_array.forEach(elems, function (elem) {
                            elem.hasInfo = false;
                            this.parcelSelectionModel.put(elem);
                        }, this);

                    }, function (error) {
                        //TODO
                    }, this);

                },

                _updateInfoElement: function (id) {

                    ct_when(this.parcelSelectionModel.query({"ID": {$eqw: id}}), function (elems) {

                        d_array.forEach(elems, function (elem) {
                            elem.hasInfo = true;
                            this.parcelSelectionModel.put(elem);
                        }, this);

                    }, function (error) {
                        //TODO
                    }, this);

                },

                _handleResultSelection: function (evt) {

                    var item = evt && evt.getProperty("result");
//                    if (item && item.nodeType !== "SEARCH_RESULT_PARCEL") {
                    this.parcelSelectionModel.setSelected();
                    this._eventService.postEvent("agiv/parcelselection/HIDE_INFO", {});
//                    }

                },

                _handleItemRemove: function (evt) {

                    var item = evt && evt.getProperty("layer");
                    if (item && item.nodeType === "SEARCH_RESULT_PARCEL") {
                        ct_when(this.parcelSelectionModel.query({"ID": {$eqw: item.get("id")}}),
                            function (res) {

                                if (res && res.length > 0 && res[0].hasInfo) {
                                    this._eventService.postEvent("agiv/parcelselection/HIDE_INFO",
                                        {});
                                }
                                this.parcelSelectionModel.remove(item.get("id"));

                            }, function (error) {
                                //TODO
                            }, this);

                    }

                },

                add: function (evt) {

                    var parcel = (evt && evt.getProperty("parcel")) || (evt && evt.getProperty("results"));
                    if (parcel) {

                        var geometry = parcel.geometry;
                        if (geometry) {
                            parcel.geometry = geometry = this._ct.transform(geometry,
                                this._mapState.getSpatialReference().wkid);
                        }
                        var extent = parcel && parcel.extent;
                        if (extent) {
                            parcel.extent = extent = this._ct.transform(extent,
                                this._mapState.getSpatialReference().wkid);
                        }

                        if (!geometry) {
                            console.debug("ParcelselectionHandler.handle: Unable to draw item since no geometry is found.");
                            return;
                        }

                        parcel.type = "SEARCH_RESULT_PARCEL";

                        var graphicLayerId = "searchResult_" + (parcel.parcelID || parcel.value);
                        var attributes = this._getAttributesFromItem(parcel);
                        var renderer = GraphicsRenderer.createForGraphicsNode(graphicLayerId,
                            this._mapModel,
                                parcel.title || parcel.parcelID,
                            attributes.type ? attributes.type : "SEARCH_RESULT");
                        renderer.set({
                            symbolLookupStrategy: new PostfixTableAttributeLookupStrategy({
                                lookupAttributeName: "geomLookupType",
                                lookupTable: this._symbolTable
                            }),
                            templateLookupStrategy: null
                        });

                        try {
                            var p = d_lang.clone(parcel);
                            p.ID = graphicLayerId;
                            p.renderer = renderer;
                            p.attributes = attributes;
                            ct_when(this.parcelSelectionModel.add(p), function () {
                                this._select(graphicLayerId);
                            }, function (error) {
                                this._select(graphicLayerId);
                            }, this);
                        } catch (e) {
                            //we have a duplicate
                            this._select(graphicLayerId);
                            this._updateInfoElement(graphicLayerId);
                        }

                    }

                },

                _select: function (id) {

                    this.parcelSelectionModel.setSelected(id, true);
                    this._updateInfoElements();
                    this._mapModel.fireModelStructureChanged({
                        source: this,
                        action: this.CONTENT_MODEL_LAYER_ADD,
                        graphicLayerId: id
                    });

                }
            }
        )
    }
);