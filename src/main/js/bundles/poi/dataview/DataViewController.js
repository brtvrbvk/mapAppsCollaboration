define([
        "dojo/_base/declare",
        "ct/_Connect",
        "ct/Stateful",
        "ct/ui/controls/dataview/DataViewModel",
        ".."
    ],
    function (
        declare,
        _Connect,
        Stateful,
        DataViewModel,
        _moduleRoot
        ) {
        /*
         * COPYRIGHT 2010-2011 con terra GmbH Germany
         */
        /**
         * @fileOverview a controller of dataModel and dataView
         */
        return _moduleRoot.DataViewController = declare([
                _Connect,
                Stateful
            ],
            /**
             * @lends ct.bundles.resultcenter.DataViewController.prototype
             */
            {
                /**
                 * This is an adapter and controller of the DataView-Widget and the DataModel.
                 *
                 * @constructs
                 * @extends ct._Connect
                 */
                constructor: function () {
                },

                // the injected dataView
                dataView: null,
                // the injected dataModel
                dataModel: null,

                activate: function () {
                    var dataModel = this.dataModel;
                    this.connect(dataModel, "onSelectionChanged",
                        "_handleSelectionChangeInDataModel");
                    this.connect(dataModel, "onFocusChanged",
                        "_handleFocusChangeInDataModel");
                    this.connect(dataModel, "onDatasourceChanged",
                        "_handleDataSourceUpdate");
                    this.connect(dataModel, "onDatasourceFilterChanged",
                        "_handleDataSourceFilterUpdate");
                    this.connect(dataModel, "onDataChanged",
                        "_handleDataUpdates");

                    var dataView = this.dataView;
                    dataView.set("model", this._createViewModel());
                },

                _createViewModel: function () {
                    this.disconnect("viewmodel");
                    var dataModel = this.dataModel;
                    //                    if (!dataModel.filteredDatasource){
                    //                        return undefined;
                    //                    }

                    var model = this.dataViewModel = new DataViewModel({
                        store: dataModel,
                        selectedIds: dataModel.getSelected(),
                        focusId: dataModel.getFocused()
                    });

                    this.connectP("viewmodel", model, "selectedIds",
                        "_handleSelectionChangeInView");
                    this.connectP("viewmodel", model, "focusId",
                        "_handleFocusChangeInView");
                    this.connectP("viewmodel", model, "filterQuery",
                        "_handleFilterQueryChangeInView");
                    this.connectP("viewmodel", model, "startItemIndex",
                        "_handleStartItemChangeInView");
                    this.connectP("viewmodel", model, "itemsPerPage",
                        "_handleItemsPerPageChangeInView");
                    return model;
                },

                setDataModel: function (model) {
                    var dataView = this.dataView;
                    dataView.set("model", model);
                },

                _handleDataSourceUpdate: function (evt) {
                    this.setDataModel(this._createViewModel());
                },

                _handleDataSourceFilterUpdate: function (evt) {
                    var dataView = this.dataView;
                    var m = dataView.get("model");
                    if (m) {
                        m.set("filterQuery", evt.query);
                    }
                },

                _handleSelectionChangeInDataModel: function (evt) {
                    if (this._dataModelSelectedUpdate) {
                        return;
                    }
                    var dataView = this.dataView;
                    var model = dataView.get("model");
                    var dataModel = this.dataModel;
                    if (!model) {
                        return;
                    }
                    this._viewModelSelectedUpdate = true;
                    try {
                        model.set("selectedIds",
                            dataModel.getSelected());
                    } finally {
                        this._viewModelSelectedUpdate = false;
                    }
                },

                _handleSelectionChangeInView: function (
                    name,
                    oldSelectedIds,
                    newSelectedIds
                    ) {
                    if (this._viewModelSelectedUpdate) {
                        return;
                    }
                    var dataModel = this.dataModel;
                    this._dataModelSelectedUpdate = true;
                    try {
                        dataModel.setSelected(newSelectedIds);
                        dataModel.triggerNodeRefresh(true);
                    } finally {
                        this._dataModelSelectedUpdate = false;
                    }
                },

                _handleFocusChangeInDataModel: function (evt) {
                    if (this._dataModelFocusUpdate) {
                        return;
                    }
                    var itemId = evt.item;
                    var focused = evt.focused;
                    var model = this.dataView.get("model");
                    if (!model) {
                        return;
                    }
                    this._viewModelFocusUpdate = true;
                    try {
                        model.set("focusId",
                            focused ? itemId : undefined);
                    } finally {
                        this._viewModelFocusUpdate = false;
                    }
                },

                _handleFocusChangeInView: function (
                    name,
                    oldFocusId,
                    newFocusId
                    ) {
                    if (this._viewModelFocusUpdate) {
                        return;
                    }
                    this._dataModelFocusUpdate = true;
                    var dataModel = this.dataModel;
                    try {
                        dataModel.setFocused(newFocusId);
                    } finally {
                        this._dataModelFocusUpdate = false;
                    }
                },

                _handleDataUpdates: function (evt) {
                    if (evt.deleted) {
                        this.dataView.storeContentChanged();
                    }
                },

                _handleFilterQueryChangeInView: function (
                    name,
                    oldQuery,
                    newQuery
                    ) {
                    this.dataModel.setDatasourceFilter(newQuery);
                },

                _handleStartItemChangeInView: function (
                    name,
                    oldStart,
                    newStart
                    ) {
                    var model = this.dataView.get("model");
                    this.onPageStateChange({
                        start: newStart,
                        count: model.get("itemsPerPage")
                    });
                },

                _handleItemsPerPageChangeInView: function (
                    name,
                    oldItemsPerPage,
                    newItemsPerPage
                    ) {
                    var model = this.dataView.get("model");
                    this.onPageStateChange({
                        start: model.get("startItemIndex"),
                        count: newItemsPerPage
                    });
                },

                deactivate: function () {
                    this.disconnect();
                },

                onPageStateChange: function (evt) {
                }
            });
    });