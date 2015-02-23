/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/lang",
        "resultcenter/FeatureMapVisualizer"
    ],
    function (
        d_lang,
        FMV
        ) {
        d_lang.extend(FMV, {
            handleOnDataUpdate: function () {
                this.disconnect();
                var that = this;

                var dataModel = this._dataModel;
                var store = dataModel;

                var props = this._properties;
                var dataViewController = this._dataViewController;

                var modelNode = this._updateFeatureStoreLayerNode(store);

                if (props.useDataViewPaging && dataViewController) {
                    var dataViewModel = dataViewController.dataViewModel;
                    //PATCHED IF CLAUSE to prevent nullpointer
                    if (dataViewModel) {
                        var start = dataViewModel.get("startItemIndex");
                        var count = dataViewModel.get("itemsPerPage");
                        modelNode.set("enablePaging", true);
                        modelNode.set("startItemIndex", start);
                        modelNode.set("itemsPerPage", count);
                    }
                    this.connect(dataViewController, "onPageStateChange", this, function (evt) {
                        var modelNode = this._updateFeatureStoreLayerNode(store);
                        modelNode.set("enablePaging", true);
                        modelNode.set("startItemIndex", evt.start);
                        modelNode.set("itemsPerPage", evt.count);
                        this._triggerModelNodeRefresh(modelNode);
                    });
                }

                this.connect(dataModel, "onDataChanged", function (evt) {
                    that._triggerModelNodeRefresh(modelNode, evt.item, evt.deleted);
                });
            }
        });
    });
