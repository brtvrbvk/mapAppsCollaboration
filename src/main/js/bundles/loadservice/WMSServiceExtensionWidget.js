/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 24.09.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/query",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "ct/ui/controls/dataview/DataView",
        "ct/ui/controls/dataview/DataViewModel",
        "ct/_Connect",
        "ct/util/css",
        "./_ServiceExtensionWidget",
        "dojo/text!./templates/WMSServiceExtensionWidget.html"
    ],
    function (
        declare,
        d_array,
        d_query,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        DataView,
        DataViewModel,
        Connect,
        ct_css,
        _ServiceExtensionWidget,
        templateString
        ) {
        return declare([
                _WidgetBase,
                _TemplatedMixin,
                _WidgetsInTemplateMixin,
                _ServiceExtensionWidget
            ],
            {

                templateString: templateString,
                showImmediately: true,

                constructor: function () {

                },

                postCreate: function () {
                    this.inherited(arguments);

//                    this._listeners = new Connect({
//                        defaultConnectScope: this
//                    });

                    this._dataView = new DataView({
                        i18n: this.i18n.ui.dataView,
                        showPager: true,
                        itemsPerPage: 10,
                        showFilter: false,
                        showViewButtons: false,
                        DGRID: {
                            selectionMode: "multiple",
                            checkboxSelection: true,
                            columns: [
                                {
                                    // any field matching no rule above is used as is
                                    "matches": {
                                        "name": {
                                            "$exists": true
                                        }
                                    }
                                }
                            ]
                        }
                    }, this.dataviewNode);

                    this.hideTable();

                },

                _getGridHeight: function () {
                    var rows = d_query("div[role='row']", this.dataviewNode),
                        height = 0;

                    d_array.forEach(rows, function (row) {

                        height += row.clientHeight;

                    }, this);
                    return height;
                },

                showTable: function () {
                    this.tableVisible = true;
                    ct_css.switchVisibility(this._dataView.domNode, true);
                    ct_css.switchVisibility(this.bottomPanel.domNode, true);
                    this.resizeBy(420);
                },
                hideTable: function () {
                    this.tableVisible = false;
                    ct_css.switchVisibility(this._dataView.domNode, false);
                    ct_css.switchVisibility(this.bottomPanel.domNode, false);
                    this.resizeBy();
                },

                getHeight: function () {

                    return 30;// + 350;//this._getGridHeight();

                },

                _onLoadClick: function () {

                    this.onLoadLayers({
                        service: this._serviceData.service,
                        layerIds: this._dataModel.get("selectedIds")
                    });
                },

                _setServiceDataAttr: function (sd) {
                    this._serviceData = sd;
                    var model = this._dataModel = new DataViewModel({store: sd.store});
                    this._dataView.set("itemsPerPage", 10);
                    this._dataView.set("model", model);

                },

                resize: function (args) {
                    this.inherited(arguments);
                    this.baseNode.resize(args);
                },

                startup: function () {
                    this.inherited(arguments);
                }
            }
        );
    }
);