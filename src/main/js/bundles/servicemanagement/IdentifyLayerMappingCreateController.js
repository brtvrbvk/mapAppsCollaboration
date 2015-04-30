/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 04.02.14
 * Time: 11:16
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "./IdentifyLayerMappingWidget",
        "ct/_when",
        "ct/ui/controls/dataview/DataViewModel",
        "ct/ui/controls/dataview/DataViewController",
        "ct/util/TypeFormat"
    ],
    function (
        declare,
        d_lang,
        IdentifyLayerMappingWidget,
        ct_when,
        DataViewModel,
        DataViewController,
        TypeFormat
        ) {
        return declare([DataViewController],
            {
                constructor: function () {

                },

                activate: function () {

                    if (!TypeFormat["boolean"]) {

                    }

                },

                showMapping: function (evt) {
                    var id = evt.getProperty("id");
                    if (id !== undefined) {

                        this._createWidget(this.layerMappingstore.get(id));

                    }
                },

                _createWidget: function (item) {

                    this._item = item;

                    this.disconnect("widget");

                    this.store.serviceID = item.serviceID;
                    this.store.layerID = item.id;

                    var model = this.viewmodel = new DataViewModel({itemsPerPage: 10, store: this.store});

                    var widget = this._widget = new IdentifyLayerMappingWidget({
                        model: model,
                        dataformService: this.dataformService,
                        toolset: this.toolset
                    });

                    this.connect("widget", widget, "onAdd", this._addItem);

                    var w = this._window = this.windowManager.createModalWindow({
                        title: this.layerMappingstore.title + ": " + item.id,
                        draggable: true,
                        dndDraggable: false,
                        content: widget,
                        closable: true,
                        marginBox: {w: 550, h: 600}
                    });

                    w.show();
                },

                refreshView: function () {
                    if (this._widget) {
                        this._widget.refresh();
                    }
                },

                _addItem: function (evt) {

                    ct_when(this.store.add(d_lang.mixin(evt, {
                        service: this._item.serviceID,
                        layer: this._item.id
                    })), function () {
                        this._widget.refresh();
                        this.logger.info({
                            message: "Mapping saved!"
                        });
                    }, function (err) {
                        this.logger.error({
                            message: "Mapping could not be created!"
                        });
                    }, this);

                }
            }
        )
    }
);