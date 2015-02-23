define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/_string",
        "ct/_Connect",
        "ct/Stateful",
        "ct/request",
        "ct/_when",
        "ct/Sequence",
        "ct/ui/controls/dataview/DataViewModel"
    ],
    function (
        declare,
        d_array,
        ct_string,
        _Connect,
        Stateful,
        ct_request,
        ct_when,
        Sequence,
        DataViewModel
        ) {

        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */
        return declare([
                _Connect,
                Stateful
            ],
            /**
             * @lends map.MRRBuilderController.prototype
             */
            {
                /**
                 * @constructs
                 */
                constructor: function () {
                },

                activate: function () {
                    // dataview is mrrbuilderwidget
                    var dataView = this.dataView;
                    var model = this.viewmodel = new DataViewModel({
                        store: this.store
                    });
                    dataView.set("model", model);
                    this.connect("view", dataView, "onItemClicked", "_showItemDetails");
                },

                deactivate: function () {
                    this.disconnect();
                    this.dataView.set("model");
                    delete this.model;
                },

                showService: function (evt) {

                    this.disconnect("view");
                    var s = evt.getProperty("service");

                    ct_when(ct_request.requestJSON({
                        url: ct_string.stringReplace(this.target, {id: s.id})
                    }), function (resp) {

                        this.store.setData(resp.services);

                        var dataView = this.dataView;
                        var model = this.viewmodel = new DataViewModel({
                            store: this.store
                        });
                        dataView.set("model", model);
                        this.connect("view", dataView, "onItemClicked", "_showItemDetails");

                        this.serviceViewTool.set("active", true);
                        this.serviceViewTool.set("visibility", true);

                    }, function (error) {
                        var i18n = this._i18n.get().commonDelete;
                        console.log("MRRBuilderController error: Unable to retrieve services, ", error);
                        this.logger.error({
                            message: i18n.errorRetrievingServices
                        });
                    }, this);

                },

                _showItemDetails: function (evt) {
                    var id = evt.itemId;
                    var evtOpts = {
                        id: id
                    };
                    this.eventService.postEvent(this._properties.selectionTopic || "itemselected", evtOpts);
                },

                removeSelectedItemsWithSaveQuestion: function () {
                    var model = this.viewmodel;
                    var selectedIds = model.get("selectedIds");
                    if (selectedIds.length) {
                        var i18n = this._i18n.get().commonDelete;
                        var saveDeleteQuery = ct_string.stringReplace(i18n.saveQuery, {
                            number: selectedIds.length
                        });
                        ct_when(this.windowManager.createInfoDialogWindow({
                            message: saveDeleteQuery,
                            attachToDom: this._appCtx.builderWindowRoot
                        }), "removeSelectedItems", this);
                    }
                },
                /**
                 * triggered by RemoveSelected*Tool
                 */
                removeSelectedItems: function () {
                    var i18n = this._i18n.get().commonDelete;
                    var model = this.viewmodel;
                    var store = this.store;
                    var selectedIds = model.get("selectedIds");
                    if (selectedIds.length) {
                        var processes = d_array.map(selectedIds, function (id) {
                            return function () {
                                return store.remove(id);
                            };
                        });
                        var deletionProcess = new Sequence({
                            processes: processes
                        }).start();
                        var i = 0;
                        ct_when(deletionProcess,
                            // all finished
                            function (results) {
                                this.logger.info({
                                    message: i18n.success
                                });
                                ct_when(store.query({}, {}), function (resp) {
                                    this.eventService.postEvent("ct/servicemanagement/SAVE_SERVICE_CONFIG", {
                                        services: resp
                                    });
                                }, this);
                                this.refreshView();
                            },
                            // global error
                            function (err) {
                                this.logger.error({
                                    message: ct_string.stringReplace(i18n.error, {
                                        items: selectedIds
                                    }),
                                    error: err
                                });
                            },
                            // progress
                            function (result) {
                                if (result && result.error) {
                                    this.logger.error({
                                        message: ct_string.stringReplace(i18n.error, {
                                            items: [selectedIds[i]]
                                        }),
                                        error: result.error
                                    });
                                }
                                ++i;
                            },
                            this);
                    }
                },

                refreshView: function () {
                    var dataView = this.dataView;
                    if (dataView) {
                        dataView.storeContentChanged();
                    }
                }
            });
    });