/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 24.05.13
 * Time: 14:37
 */
define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/_lang",
        "ct/_equal",
        "ct/_when",
        "ct/store/Filter",
        "ct/store/Lookup",
        "ct/store/ComplexMemory",
        "dojo/store/util/QueryResults",
        "ct/Exception",
        "ct/DeferredWatcher"
    ],
    function (
        d_lang,
        declare,
        d_array,
        ct_lang,
        ct_equal,
        ct_when,
        Filter,
        Lookup,
        ComplexMemory,
        QueryResults,
        Exception,
        DeferredWatcher
        ) {
        var internalItemDeletionState = {
            selected: false,
            focus: false
        }

        return declare([],
            /**
             * @lends ct.bundles.resultcenter.DataModel.prototype
             */
            {
                /**
                 * dojo.store.api.Store (must have support for ComplexQueries)
                 */
                datasource: null,

                /**
                 * This is the complex query set by a user via the (result center) ui.
                 * The datamodel implements self the store interface and uses this filter as default.
                 */
                datasourceFilterQuery: {},

                /**
                 * A datasource with access only to data limited by the datasource filter.
                 * This is the datasource which is internally accessed via the store methods provided by the datamodel.
                 */
                filteredDatasource: null,

                /**
                 * Internal additional state flags for datasource items.
                 */
                _internalItemState: null,

                /**
                 * used to watch the query state.
                 */
                deferredWatcher: null,

                id: null,

                constructor: function (args) {
                    this.deferredWatcher = new DeferredWatcher({
                        onStart: d_lang.hitch(this,
                            "onUpdateStart"),
                        onEnd: d_lang.hitch(this,
                            "onUpdateEnd")
                    });
                    this._internalItemState = new ComplexMemory({
                        idProperty: "id"
                    });
                    this.id = args.id;
                },

                setMapModelNode: function (node) {
                    this.mmNode = node;
                },

                deactivate: function () {
                    this.setDatasource();
                },

                // the dojo.store.api.Store interface:
                get: function (
                    id,
                    options
                    ) {
                    var fd = this.filteredDatasource;
                    var result = fd && fd.get(id, options);
                    this.deferredWatcher.watch(result);
                    return result;
                },
                // the dojo.store.api.Store interface:
                getIdentity: function (object) {
                    var fd = this.filteredDatasource;
                    return fd && fd.getIdentity(object);
                },
                // the dojo.store.api.Store interface:
                query: function (
                    query,
                    options
                    ) {
                    var fd = this.filteredDatasource;
                    var result = fd && fd.query(query, options);
                    if (!options.silent) {
                        this.deferredWatcher.watch(result);
                    }
                    return result ? result : QueryResults([]);
                },
// the dojo.store.api.Store interface:
                getMetadata: function (object) {
                    var fd = this.filteredDatasource;
                    return (fd && fd.getMetadata()) || {
                        fields: [
                            {
                                name: "id"
                            }
                        ]
                    };
                },

                remove: function (id) {
                    var fd = this.filteredDatasource;
                    this._updateInternalState(id, internalItemDeletionState);
                    if (fd) {
                        fd.remove(id)
                        this.onDataChanged({
                            source: this,
                            item: [id],
                            itemContext: this.getItemContext(),
                            deleted: true
                        });
                    }
                },

                getIdList: function () {
                    return ct_lang.chkProp(this.datasource, "idList", []);
                },

                removeByIds: function (ids) {
                    var fd = this.filteredDatasource;
                    d_array.forEach(ids, function (id) {
                        fd.remove(id)
                        this._updateInternalState(id, internalItemDeletionState);
                    }, this);
                    this.onDataChanged({
                        source: this,
                        item: ids,
                        itemContext: this.getItemContext(),
                        deleted: true
                    });
                },

                queryById: function (
                    ids,
                    options
                    ) {
                    if (!d_lang.isArray(ids)) {
                        return this.get(ids, options);
                    }
                    var q = {};
                    q[this.idProperty] = {
                        $in: ids
                    };
                    return this.query(q, options);
                },
                /**
                 * Updates the external datasource.
                 * @param datasource the datasource
                 */
                setDatasource: function (
                /**dojo.store.api.Store*/
                    datasource
                    ) {
                    this.setSelected();
                    this.clearFocus();
                    var idProperty = this.idProperty = (datasource && datasource.idProperty) || "id";
                    var internalItemState = this._internalItemState = new ComplexMemory({
                        idProperty: idProperty
                    });
                    this.datasource = datasource;
                    delete this.filteredDatasource;
                    delete this.queryEngine;
                    delete this.datasourceFilterQuery;
                    if (datasource) {
                        var df = this.datasourceFilterQuery;
                        var fd = this.filteredDatasource = Lookup(Filter(datasource, df), internalItemState);
                        this.queryEngine = fd.queryEngine;
                    }
                    this.onDatasourceChanged({
                        source: this,
                        datasource: datasource,
                        filteredDatasource: this.filteredDatasource
                    });
                    this.onDatasourceFilterChanged({
                        source: this,
                        query: this.datasourceFilterQuery,
                        filterChange: true
                    });
                },

                getDatasource: function () {
                    return this.datasource;
                },

                setDatasourceFilter: function (query) {
                    var oldQuery = this.datasourceFilterQuery;
                    var newQuery = this.datasourceFilterQuery = query;
                    var fd = this.filteredDatasource;
                    if (fd) {
                        fd.setFilter(query);
                    }
                    if (ct_equal.equals(oldQuery, newQuery, true)) {
                        return;
                    }
                    this.onDatasourceFilterChanged({
                        source: this,
                        query: query,
                        filterChange: true
                    });
                },

                getSelected: function () {
                    var internalItemState = this._internalItemState;
                    return ct_when(internalItemState.query({
                        selected: true
                    }), function (items) {
                        return d_array.map(items, function (item) {
                            return internalItemState.getIdentity(item);
                        });
                    });
                },

                setSelected: function (
                    ids,
                    selected,
                    extendSelection
                    ) {
                    if (!(d_lang.isArray(ids) || ids === undefined || selected == undefined)) {
                        ids = [ids];
                    }
                    if (!extendSelection) {
                        this._clearSelectedItems();
                    }

                    selected = ct_lang.chk(selected, true);
                    d_array.forEach(ids || [], function (id) {
                        this._updateInternalState(id, {
                            selected: selected
                        });
                    }, this);
                    this.onSelectionChanged({
                        source: this,
                        selection: true,
                        itemIds: ids,
                        itemContext: this.getItemContext()
                    });
                },

                unselect: function () {
                    this.setSelected();
                },

                select: function (
                    query,
                    extendSelection
                    ) {
                    if (!extendSelection) {
                        this._clearSelectedItems();
                    }
                    var filteredDatasource = this.filteredDatasource;
                    ct_when(filteredDatasource.query(query), function (items) {
                        this.setSelected(d_array.map(items, function (item) {
                            return filteredDatasource.getIdentity(item);
                        }), undefined, extendSelection);
                    }, this);
                },

                _clearSelectedItems: function () {
                    d_array.forEach(this.getSelected(), function (id) {
                        this._updateInternalState(id, {
                            selected: false
                        });
                    }, this);
                },

                getFocused: function () {
                    var internalItemState = this._internalItemState;
                    return ct_when(internalItemState.query({
                        focus: true
                    }), function (items) {
                        var item = items[0];
                        return item ? internalItemState.getIdentity(item) : undefined
                    });
                },

                clearFocus: function () {
                    ct_when(this.getFocused(), function (id) {
                        if (id !== undefined) {
                            this._updateInternalState(id, {
                                focus: false
                            });
                            if (this.idProperty) {
                                this.onFocusChanged({
                                    source: this,
                                    item: id,
                                    itemContext: this.getItemContext(),
                                    focused: false
                                });
                            }
                        }
                    }, this);
                },

                setFocused: function (id) {
                    this.clearFocus();
                    if (id === undefined) {
                        return;
                    }
                    this._updateInternalState(id, {
                        focus: true
                    });
                    this.onFocusChanged({
                        source: this,
                        item: id,
                        itemContext: this.getItemContext(),
                        focused: true
                    });
                },

                /**
                 * This method gets the current item context.
                 * Currently this is used in the ContentViewerCommand and FeatureVisualizer to transport the datasource ids of the content.
                 */
                getItemContext: function () {
                    var fd = this.filteredDatasource;
                    return {
                        storeId: fd && fd.id,
                        idProperty: this.idProperty
                    };
                },

                /**
                 * Helper method for external code to inform the datamodel and all listeners about changes in the source store.
                 */
                fireDataChanged: function (evt) {
                    evt = evt || {};
                    this.onDataChanged(d_lang.mixin({
                        source: this
                    }, evt));
                },

                /**
                 * @event is thrown if a new datasource is set.
                 * @param event the event
                 */
                onDatasourceChanged: function (
                /**Event*/
                    event
                    ) {
                    this.onDataChanged(event);
                },
                /**
                 * @event Is thrown if a new datasource filter is set.
                 * @param event the event
                 */
                onDatasourceFilterChanged: function (
                /**Event*/
                    event
                    ) {
                    this.onDataChanged(event);
                },

                /**
                 * @event Thrown when one or more data rows have been selected.
                 */
                onSelectionChanged: function (
                /**Event*/
                    event
                    ) {
                    this.onDataChanged(event);

                },

                /**
                 * @event Thrown when the focus item changes.
                 */
                onFocusChanged: function (event) {
                    this.onDataChanged(event);
                },

                /**
                 * @event called if internal state changes occur (selected, focused, removed, filterchange)
                 */
                onDataChanged: function (event) {
                },

                /**
                 * when ever a new query is started
                 */
                onUpdateStart: function () {
                },
                /**
                 * when ever a query finishes
                 */
                onUpdateEnd: function () {
                },

                triggerNodeRefresh: function (itemIds) {
                    if (this.mmNode) {
                        var layerObject = this.mmNode.get("layerObject");
                        //either we get a list of nodes to refresh or we just referesh the complete model
                        return layerObject.refresh({
                            changedItems: itemIds || this.getIdList()
                        });
                    }
                },

                _updateInternalState: function (
                    id,
                    newState
                    ) {
                    if (id === undefined) {
                        return;
                    }
                    if (!id) {
                        throw Exception.illegalArgumentError("DataModel: An id with value <" + id + "> is not supported!");
                    }
                    var that = this;
                    var internalItemState = this._internalItemState;
                    var item = internalItemState.get(id);
                    ct_when(item, function (item) {
                        if (item) {
                            d_lang.mixin(item, newState);
//                            if (that._canBeDeleted(item)) {
//                                internalItemState.remove(id);
//                            } else {
                            internalItemState.put(item, {overwrite: true});
//                            }
                        } else {
                            item = d_lang.mixin({}, newState);
                            item[internalItemState.idProperty] = id;
                            internalItemState.add(item);
                        }
                    });
                },

                _canBeDeleted: function (item) {
                    var match = true;
                    ct_lang.forEachOwnProp(internalItemDeletionState, function (
                        value,
                        name
                        ) {
                        match &= (!item[name] == !value)
                    });
                    return match;
                }
            });
    });