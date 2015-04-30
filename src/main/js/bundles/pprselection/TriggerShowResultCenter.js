define([
        "dojo/_base/declare",
        "ct/_when",
        "ct/Stateful",
        "resultcenter/BaseCommand"
    ],
    function (
        declare,
        ct_when,
        Stateful,
        BaseCommand
        ) {
        /*
         * COPYRIGHT 2010-2011 con terra GmbH Germany
         */
        /**
         * @fileOverview contains code to show the result center if new items existing.
         */
        return declare([
                Stateful,
                BaseCommand
            ],
            /**
             * @lends ct.bundles.resultcenter.TriggerShowResultCenter.prototype
             */
            {
                /**
                 * the tool to activate on update
                 */
                tool: null,

                /**
                 * component is responsible to trigger activate on a tool, if items in a new store are not empty.
                 * @constructs
                 */
                constructor: function () {
                },

                hide: function () {
                    this.tool.set("visibility", false);
                    this.tool.set("active", false);
                },

                show: function () {
                    this._dataModel.setDatasource();
                    var tool = this.tool;
                    if (this.showToolOnData) {
                        tool.set("visibility", true);
                    }
                    if (this.autoOpen) {
                        tool.set("active", true);
                    }
                },

                handleOnUpdate: function (evt) {
                    /* Properties:
                     //shows the result center tool if data is available
                     "showToolOnData" : true,
                     // opens the result center window, if data is available
                     "autoOpen" : false,
                     // hides the result tool if no data is available
                     "hideToolOnEmpty" : true,
                     // auto closes the result center if no data is available
                     "autoClose" : true
                     */
                    var tool = this.tool;
                    var store = evt.source;
                    if (!store.datasource) {
//                        tool.set("visibility", false);
//                        tool.set("active", false);
                        return;
                    }
                    var newDataAvailableMsg = this._i18n.get().ui.newDataAvailable;
                    var result = this._retrieveStoreItems(store);
                    ct_when(result.total, function (total) {
                        // todo check if result is a QueryResult, otherwise the test here is wrong!
                        if (this.showToolOnData) {
                            tool.set("visibility", true);
                        }
                        if (this.autoOpen) {
                            tool.set("active", true);
                        } else if (!tool.get("active")) {
                            // send info message to tool
                            tool.infoMsg(newDataAvailableMsg);
                        }
//                    if (total > 0){
//                        if (this.showToolOnData){
//                            tool.set("visibility",true);
//                        }
//                        if (this.autoOpen){
//                            tool.set("active",true);
//                        }else if (!tool.get("active")){
//                            // send info message to tool
//                            tool.infoMsg(newDataAvailableMsg);
//                        }
//                    }else {
//                        if (this.autoClose){
//                            tool.set("active",false);
//                        }
//                        if (this.hideToolOnEmpty){
//                            tool.set("visibility",false);
//                        }
//                    }
                    }, function (err) {

                    }, this);
                }
            });
    });