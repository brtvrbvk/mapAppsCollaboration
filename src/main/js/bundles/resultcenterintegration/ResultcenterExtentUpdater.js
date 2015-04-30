/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 24.10.13
 * Time: 14:04
 */
define([
        ".",
        "dojo/_base/declare",
        "ct/Stateful"
    ],
    function (
        _moduleRoot,
        declare,
        Stateful
        ) {
        return _moduleRoot.ResultcenterExtentUpdater = declare([Stateful],
            {

                _update: true,

                constructor: function () {

                },

                _handleNewStore: function (evt) {

                    var store = this._currentStore = evt.getProperty("store");
                    this.eventService.postEvent("ct/selection/SELECTION_END",
                        {
                            store: store
                        });
                    this._update = true;

                },

                _onExtentChange: function () {

                    if (this._currentStore && this._update) {

                        this.eventService.postEvent("ct/selection/SELECTION_END",
                            {
                                store: this._currentStore
                            });

                    }

                },

                _onResultcenterClose: function (evt) {

                    var w = evt.getProperty("source");
                    if (w && w.windowName === "resultcenter") {
                        this._update = false;
                    }

                }

//                _onDatasourceChanged : function() {
////                    this.dataModel.setSelected(this._sel,true);
//                }
            }
        )
    }
);