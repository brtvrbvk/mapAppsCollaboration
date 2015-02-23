/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 04.02.14
 * Time: 11:35
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "ct/ui/controls/dataview/DataView",
        "dojo/text!./templates/IdentifyLayerMappingWidget.html",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane"
    ],
    function (
        declare,
        d_lang,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        DataView,
        templateString
        ) {
        return declare([
                _Widget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {

                templateString: templateString,

                dataform: {
                    "dataform-version": "1.0.0",
                    "type": "gridpanel",
                    //"animate" :false,
                    "showLabels": false,
                    "cols": 4,
                    "size": {
                        "w": 400,
                        "h": 50
                    },
                    "children": [
                        {
                            "type": "comboBox",
                            "field": "identifyConfig",
                            "store": "identifyConfigStore",
                            "required": true,
                            "width": 125
                        },
                        {
                            "type": "label",
                            "value": "Is defaultMapping?"
                        },
                        {
                            "type": "checkbox",
                            "field": "defaultMapping"
                        },
                        {
                            "type": "button",
                            "topic": "submit/OK",
                            "title": "Add"
                        }
                    ]
                },

                constructor: function () {

                },

                refresh: function () {

                    var dataView = this._dataview;
                    if (dataView) {
                        dataView.storeContentChanged();
                    }

                },

                postCreate: function () {
                    this.inherited(arguments);

                    var dataview = this._dataview = new DataView({
//                        i18n:this.i18n.ui.dataView,
                        "_i18nPath": "dataViewCommon",
                        showPager: true,
                        showFilter: false,
                        showViewButtons: false,
                        DGRID: {
                            selectionMode: "multiple",
                            checkboxSelection: true,
                            columns: [
                                {
                                    "matches": {
                                        "name": "defaultMapping"
                                    },
                                    "title": "Default mapping?",
                                    "width": 100
                                },
                                {
                                    "matches": {
                                        "name": "identifyConfigID"
                                    },
                                    "title": "Identify mapping ID"
//                                    "width": 150
                                }
                            ]
                        }
                    }, this.dataviewNode);

                    dataview.setToolbar(this.toolset);

                    dataview.set("model", this.model);

                    this._dfwidget = this._createDataFormWidget();

                    this._dfwidget.placeAt(this.selectionNode);

                },

                _createDataFormWidget: function () {
                    var form = this.dataformService.createDataForm(this.dataform);
                    var binding = this.dataformService.createBinding("object", {
                        defaultMapping: false
                    });
                    form.set("dataBinding", binding);
                    form.connect(form, "onControlEvent", d_lang.hitch(this, function (evt) {
                        var topic = evt.topic;
                        switch (evt.topic) {
                            case "submit/OK" :
                                this.onAdd({
                                    defaultMapping: binding.data.defaultMapping,
                                    identifyConfigID: binding.data.identifyConfig
                                });
                                break;
                        }
                    }));
                    return form;
                },

                destroy: function () {
                    this._dataview.unsetToolbar();
                    this.inherited(arguments);
                },

                _destroyDataFormWidget: function (w) {
                    w.destroy();
                },

                onAdd: function (evt) {
                },

                resize: function (args) {
                    this.inherited(arguments);
                    this.baseNode.resize(args);
                }
            }
        )
    }
);