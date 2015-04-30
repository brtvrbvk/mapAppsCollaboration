/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 09.01.14
 * Time: 14:01
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "ct/request",
        "ct/_when",
        "ct/array",
        "ct/Locale",
        "ct/Stateful",
        "ct/_Connect"
    ],
    function (
        declare,
        d_array,
        d_lang,
        ct_request,
        ct_when,
        ct_array,
        Locale,
        Stateful,
        Connect
        ) {
        return declare([
                Stateful,
                Connect
            ],
            {

                constructor: function () {
                    this.serviceTypes = [];
                },

                activate: function () {
                    this.i18n = this._i18n.get();
                    var that = this;
                    this.connect("tool", this._windowTool, "onActivate", "_onActivate");
                    this._initWidget();
                    this.widget.set("typeSelection", this._typeWidget);
                },

                _onActivate: function () {
                    this._fromCatalogue = false;
                },

                triggerSearch: function (
                    val,
                    fromCatalogue
                    ) {
                    this.disconnect("tool");
                    this._windowTool.set("active", true);
                    this.connect("tool", this._windowTool, "onActivate", "_onActivate");
                    this._fromCatalogue = fromCatalogue;
                    this.currentController.submit(val);

                },

                _initWidget: function () {

                    if (!this._dataformService) {
                        return;
                    }
                    this.serviceTypeForm.children = this.serviceTypes;
                    this.serviceTypeForm.cols = this.serviceTypes.length;
                    var dfwidget = this._typeWidget = this._dataformService.createDataForm(this.serviceTypeForm);
                    var types = {data: {}};
                    d_array.forEach(this.serviceTypes, function (type) {
                        types.data[type.field] = type.selected ? true : false;
                    }, this);
                    var binding = this._binding = this._dataformService.createBinding("object", types);

                    dfwidget.set("dataBinding", binding);

                    binding.watch("*", d_lang.hitch(this, this._update));
                    this._update();

                },

                _update: function () {
                    this.disconnect("controller");
                    var type;
                    for (var key in this._binding.data) {
                        if (this._binding.data[key]) {
                            type = ct_array.arraySearchFirst(this.serviceTypes, {field: key});
                        }
                    }
                    this.currentController = type.controller;
                    this.extensionWidget = type.controller.get("widget");
                    this.connect("controller", type.controller, "startLoading", this._startLoading);
                    this.connect("controller", type.controller, "stopLoading", this._stopLoading);
                    this.connect("controller", type.controller, "onError", this._onError);
                    this.widget.removeMessages();
                    this.widget.set("extensionWidget", this.extensionWidget);
                },

                _onError: function (evt) {
                    this.widget.showMessage(evt.label, evt.type);
                },
                _startLoading: function () {
                    this.widget.showMessage(this.i18n.ui.loadingService, "loading");
                },
                _stopLoading: function () {
                    this.widget.removeMessages();
                },

                addServiceType: function (st) {
                    this.serviceTypes.push(st);
                    this._initWidget();
                    if (this.widget) {
                        this.widget.set("typeSelection", this._typeWidget);
                    }
                }

            }
        );
    }
);