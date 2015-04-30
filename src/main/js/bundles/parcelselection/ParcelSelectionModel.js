/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 27.03.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "ct/Stateful",
        "ct/_when",
        "ct/_lang",
        "ct/array",
        "base/ui/SelectionModel"
    ],
    function (
        declare,
        d_lang,
        d_array,
        Stateful,
        ct_when,
        ct_lang,
        ct_array,
        SelectionModel
        ) {
        return declare([SelectionModel],
            {
                constructor: function () {
                },

                put: function (elem) {

                    this._data.put(elem, {
                        overwrite: true
                    });

                },

                _getSelected: function (selected) {

                    var internalItemState = this._internalItemState;
                    return ct_when(internalItemState.query({
                        selected: selected
                    }), function (items) {
                        items = d_array.map(items, function (item) {
                            return internalItemState.getIdentity(item);
                        });
                        var q = {};
                        q[this.idProperty] = {
                            $in: items
                        };
                        return ct_when(this._data.query(q), function (parcels) {
                            return d_array.map(parcels, function (parcel) {
                                parcel.attributes.geomLookupType = selected ? parcel.type + "-selected" : parcel.type;
                                return parcel;
                            });
                        }, this);
                    }, this);

                },

                add: function (parcel) {

                    //check for consistence before adding
                    return ct_when(this._data.query(), function (items) {

                        d_array.forEach(items, function (item) {

                            var node = this._mapModel.getNodeById(item.ID);
                            if (!node) {
                                this._data.remove(item.ID);
                            }

                        }, this);

                        if (parcel) {
                            this._data.add(parcel)
                            this._updateInternalState(parcel.ID, {selected: false});
                        }

                    }, this);

                },

                remove: function (parcelId) {
                    this._data.remove(parcelId);
                    this._updateInternalState(parcelId, {selected: false});
                },

                getRawData: function () {
                    return this._data.data;
                },

                getRawState: function () {
                    return this._internalItemState.data;
                },

                setRawData: function (d) {
                    this._data.setData(d);
                },

                setRawState: function (s) {
                    this._internalItemState.setData(s);
                }
            }
        )
    }
);