define([
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/_base/declare",
        "ct/array",
        "ct/_when",
        "selection/SelectionAction",
        "ct/store/ComplexMemory"
    ],
    function (
        d_lang,
        d_array,
        declare,
        ct_array,
        ct_when,
        SelectionAction,
        ComplexMemory
        ) {
        /*
         * COPYRIGHT 2010-2011 con terra GmbH Germany
         */
        /**
         * @fileOverview This class handles a typical selection on the map.
         */

        return declare(
            [SelectionAction],
            /**
             * @lends agiv.bundles.pprselection.SelectionAction.prototype
             */
            {
                defaultTopicBase: "ct/ppr",

                /**
                 * @constructs
                 * @extends ct._Connect
                 */
                constructor: function () {
                },
                activate: function () {
                    this.inherited(arguments);
                    var props = this._properties;
                    this.sortAttribute = props.sortAttribute;
                    this.sortAscending = props.sortAscending;
                    this.autoDeactivateTool = props.autoDeactivateTool;
                },
                performSelection: function (geometry) {
                    this.geometry = geometry;
                    if (this._clearHandler) {
                        this._clearHandler.clear(true);
                    }
                    this.inherited(arguments);
                },
                _processSelectionResult: function (result) {
                    var parameter = this.selectionParameter;
                    var storeId = parameter.storeId;
                    var store = parameter.store;
                    var empty = !result || !result.length;
                    if (empty && !this.emptyChecked) {
                        this.emptyChecked = true;
                        var temp = this.selectionParameter.store;
                        this.selectionParameter.store = this.parcelStore;
                        this._setProcessing(false);
                        this.performSelection(this.geometry);
                        this.selectionParameter.store = temp;
                        this.emptyResult = true;
                    } else {
                        this.emptyChecked = false;
                        if (this.sortAttribute) {
                            var sortFunc,
                                sortAttribute = this.sortAttribute;
                            if (!this.sortAscending) {
                                sortFunc = function (
                                    a,
                                    b
                                    ) {
                                    if (a[sortAttribute] > b[sortAttribute]) {
                                        return -1;
                                    } else if (a[sortAttribute] < b[sortAttribute]) {
                                        return 1;
                                    }
                                    return 0;
                                }
                            } else {
                                sortFunc = function (
                                    a,
                                    b
                                    ) {
                                    if (a[sortAttribute] < b[sortAttribute]) {
                                        return -1;
                                    } else if (a[sortAttribute] > b[sortAttribute]) {
                                        return 1;
                                    }
                                    return 0;
                                }
                            }
                            result = ct_array.arraySort(result, sortFunc);
                        }
                        var l = result.length;
                        d_array.forEach(result, function (
                            it,
                            idx
                            ) {
                            if (!it.parcelID && it.perceelNr) {
                                it.parcelID = it.perceelNr;
                            }
                            it.preventDraw = true;
                            it.idx = idx + 1;
                            it.totalCount = l;
                        });

                        var idProperty = store.idProperty;
                        var idList = d_array.map(result, function (item) {
                            return item[idProperty];
                        });
                        var resultstore;
                        var initialQuery = {};
                        initialQuery.query = this._query;
                        initialQuery.options = this._queryOptions;
                        resultstore = this._createFullItemResultStore(idList, result, store, initialQuery);
                        resultstore.id = storeId;
                        resultstore.empty = this.emptyResult;
                        this.emptyResult = false;

                        var eventService = this._eventService;
                        if (eventService) {
                            var topic = "agiv/parcelselection/PARCEL";
                            var elem = d_lang.clone(result[0]);
                            if (elem) {
                                elem.title = elem.title || elem.parcelID;
                                elem.hasInfo = true;
                                eventService.postEvent(topic, {
                                    parcel: elem
                                });
                            }
                        }

                        this._geocodeItem(this.geometry, d_lang.hitch(this, function (resp) {
                            if (resp.length == 1) {
                                resultstore.address = resp[0].FormattedAddress;
                                this.onSelectionEnd({
                                    source: this,
                                    store: resultstore
                                });
                                if (this.autoDeactivateTool) {
                                    this._deactivateSelectionTool();
                                }
                                this._setProcessing(false);
                            }
                        }), d_lang.hitch(this, function (err) {
                            this.onSelectionEnd({
                                source: this,
                                store: resultstore
                            });
                            if (this.autoDeactivateTool) {
                                this._deactivateSelectionTool();
                            }
                            this._setProcessing(false);
                        }));
                    }
                },

                _geocodeItem: function (
                    point,
                    doit,
                    err
                    ) {
                    var tp = this.transformer.transform(point, 4326);
                    var options = {
                        count: 1
                    };
                    var query = {
                        title: {
                            $suggest: tp.y + "," + tp.x
                        }
                    }
                    var result = this.geocoder.query(query, options);
                    ct_when(result, doit, err);
                },

                _setProcessing: function (processing) {
                    var tool = this._tool;
                    if (tool) {
                        tool.set("processing", processing);
                    }
                    var eventService = this._eventService;
                    if (eventService) {
                        var topic = this.defaultTopicBase + "/PROCESSING_" + (processing ? "START" : "END")
                        eventService.postEvent(topic, {
                            src: this
                        });
                    }
                }
            });

    });
