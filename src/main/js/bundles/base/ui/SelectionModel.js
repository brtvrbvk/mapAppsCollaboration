/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 04.04.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "ct/Stateful",
        "ct/store/ComplexMemory",
        "ct/_when",
        "ct/array",
        "ct/_lang",
        "ct/Exception"
    ],
    function (
        declare,
        d_array,
        d_lang,
        Stateful,
        ComplexMemory,
        ct_when,
        ct_array,
        ct_lang,
        Exception
        ) {
        return declare([Stateful],
            {

                idProperty: "id",
                selectionProperty: "enabled",

                constructor: function () {
                    this._internalItemState = new ComplexMemory({
                        idProperty: this.idProperty
                    });
                    this._data = new ComplexMemory({
                        idProperty: this.idProperty
                    });
                },

                setSelected: function (
                    ids,
                    selected
                    ) {
                    ids = ids || [];
                    if (!d_lang.isArray(ids)) {
                        ids = [ids];
                    }
                    selected = ct_lang.chk(selected, true);
                    var currentSelectedIds = this.getSelectedIDs();
                    return ct_when(currentSelectedIds, function (currentSelectedIds) {
                        var idsToSelect = [];
                        var idsToDeSelect = [];
                        var allSelectedIds = [];
                        if (selected) {
                            d_array.forEach(ids, function (id) {
                                if (ct_array.arrayAdd(allSelectedIds,
                                    id) > -1 && d_array.indexOf(currentSelectedIds,
                                    id) < 0) {
                                    idsToSelect.push(id);
                                }
                            });
                            d_array.forEach(currentSelectedIds, function (id) {
                                if (d_array.indexOf(allSelectedIds, id) < 0) {
                                    idsToDeSelect.push(id);
                                }
                            });
                        } else {
                            // unselected
                            allSelectedIds = currentSelectedIds.slice(0);
                            d_array.forEach(ids, function (id) {
                                if (ct_array.arrayRemove(allSelectedIds, id) > -1) {
                                    idsToDeSelect.push(id);
                                }
                            });
                        }
                        d_array.forEach(idsToDeSelect, function (id) {
                            this._updateInternalState(id, {
                                selected: false
                            });
                        }, this);
                        d_array.forEach(idsToSelect, function (id) {
                            this._updateInternalState(id, {
                                selected: true
                            });
                        }, this);
                        if (idsToDeSelect.length || idsToSelect.length) {
                            this.onSelectionChanged({
                                source: this,
                                selection: true,
                                items: allSelectedIds,
                                oldItems: currentSelectedIds,
                                selectedItems: idsToSelect,
                                deselectedItems: idsToDeSelect
                            });
                        }
                        return idsToSelect;
                    }, this);
                },

                onSelectionChanged: function () {
                },

                getSelected: function () {
                    return this._getSelected(true);
                },

                getUnselected: function () {
                    return this._getSelected(false);
                },

                getItems: function () {
                    return this._data.query();
                },

                getIdentity: function (item) {
                    return item[this.idProperty];
                },

                onItemAdd: function (evt) {
                },
                onItemRemove: function (evt) {
                },
                onUpdate: function (evt) {
                },

                fireUpdateEvent: function () {
                    this.onUpdate();
                },

                query: function (
                    query,
                    options
                    ) {
                    return this._data.query(query, options);
                },

                syncItems: function (
                    items,
                    singleEvents
                    ) {

                    ct_when(this._data.query(), function (elements) {

                        d_array.forEach(elements, function (element) {
                            var comparator = {};
                            comparator[this.idProperty] = element[this.idProperty];
                            var foundElement = ct_array.arraySearchFirst(items, comparator);
                            if (!foundElement) {
                                this._removeItem(element, !singleEvents);
                            }

                        }, this);

                        d_array.forEach(items, function (item) {

                            this._addItem(item, !singleEvents);

                        }, this);

                    }, function (error) {
                        //TODO
                    }, this);

                },

                getSelectedIDs: function () {

                    var internalItemState = this._internalItemState;
                    return ct_when(internalItemState.query({
                        selected: true
                    }), function (items) {
                        return d_array.map(items, function (item) {
                            return internalItemState.getIdentity(item);
                        });
                    }, this);

                },

                isSelected: function (id) {
                    return this._internalItemState.get(id).selected;
                },

                _removeItem: function (
                    item,
                    silent
                    ) {

                    this._data.remove(item[this.idProperty]);
                    this._internalItemState.remove(item[this.idProperty]);
                    if (!silent) {
                        this.onItemRemove({item: item});
                    }

                },

                _addItem: function (
                    item,
                    silent
                    ) {

                    if (!this._data.get(item[this.idProperty])) {
                        this._data.add(item);
                        this._updateInternalState(item[this.idProperty], {
                            selected: item[this.selectionProperty] || false
                        });
                        this.setSelected(item[this.idProperty], item[this.selectionProperty] || false);
                        if (!silent) {
                            this.onItemAdd({item: item});
                        }
                    }

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
                        return this._data.query(q);
                    }, this);

                },

                _updateInternalState: function (
                    id,
                    newState
                    ) {
                    if (id === undefined) {
                        // no change
                        return false;
                    }
                    if (!id) {
                        throw Exception.illegalArgumentError("DataModel: An id with value <" + id + "> is not supported!");
                    }
                    var internalItemState = this._internalItemState;
                    var item = internalItemState.get(id);
                    return ct_when(item, function (item) {
                        if (item) {
                            if (this._itemStateEqual(item, newState)) {
                                return false;
                            }
                            d_lang.mixin(item, newState);
                            internalItemState.put(item);
                            return true;
                        } else {
                            item = d_lang.mixin({}, newState);
                            item[internalItemState.idProperty] = id;
                            internalItemState.add(item);
                            return true;
                        }
                    }, this);
                },

                _itemStateEqual: function (
                    item,
                    newState
                    ) {
                    var match = true;
                    ct_lang.forEachOwnProp(newState, function (
                        value,
                        name
                        ) {
                        match &= (!item[name] === !value);
                    });
                    return match;
                }
            }
        )
    }
);