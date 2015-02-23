/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 */
define([
        "..",
        "dojo/_base/declare",
        "ct/_Connect",
        "ct/_when",
        "./DataViewController",
        "ct/ui/controls/dataview/DataView"
    ],
    function (
        _moduleRoot,
        declare,
        _Connect,
        ct_when,
        DataViewController,
        DataView
        ) {
        return _moduleRoot.InfoPOIController = declare([_Connect],
            {

                constructor: function () {

                },

                activate: function () {
                    this.i18n = this._i18n.get();
                    this._props = this._properties;
                },

                showPOIDataView: function (args) {
                    var poiModelNode = args.getProperty("item");
                    var layerName = poiModelNode.title;
                    if (!this._oldChoice || layerName !== this._oldChoice) {
                        this._oldChoice = layerName;
                        var props = this._props.POIListItem.DataView;
                        var dataView = new DataView(props);

                        var store = poiModelNode.store;
                        this._extendStoreMetadata(store);

                        var dvctrl = this._dvctrl = new DataViewController({
                            dataModel: store,
                            dataView: dataView
                        });
                        dvctrl.activate();

                        var infoPOIWidget = this._infoPOIWidget;
                        infoPOIWidget.setContent(dataView);
                    }
                    this._tool.set("active", true);
                },

                hidePOIDataView: function () {
                    this._oldChoice = null;
                    this._tool.set("active", false);
                },

                _extendStoreMetadata: function (store) {
                    ct_when(store.getMetadata(), function (items) {
                        var fields = items.fields;
                        var extraMetadata = this._props.POIListItem.metadata;
                        fields = fields.concat(extraMetadata);
                        store.getMetadata = function () {
                            return {
                                fields: fields
                            }
                        }
                    }, this);
                },

                deactivate: function () {
                    this.disconnect("onWindowClose");
                }
            }
        )
    }
);