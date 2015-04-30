define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "ct/_Connect",
        "ct/_when",
        "ct/Hash"
    ],
    function (
        d_lang,
        declare,
        _Connect,
        ct_when,
        Hash
        ) {

        return declare([_Connect],
            {
                serviceUpdateTopic: "ct/servicemanagement/SERVICE_CONFIG_CREATED",
                // injected
                dataformService: null,
                windowManager: null,
                serviceStore: null,

                serviceWidgetDefinition: {
                    "dataform-version": "1.0.0",
                    "type": "wizardpanel",
                    "showCancel": true,
                    "size": {
                        "w": 540,
                        "h": 200
                    },
                    "children": [
                        {
                            "type": "borderpanel",
                            "children": [
                                {
                                    "region": "top",
                                    "size": {
                                        "h": 50
                                    },
                                    "type": "panel",
                                    "children": [
                                        {
                                            "type": "label",
                                            "value": "${createServiceInfo}"
                                        }
                                    ]
                                },
                                {
                                    "type": "gridpanel",
                                    "region": "center",
                                    "children": [
                                        {
                                            "type": "textbox",
                                            "field": "title",
                                            "title": "${title}",
                                            "required": true,
                                            "regex": "[a-zA-Z0-9_]+"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },

                /**
                 * @constructs
                 */
                constructor: function () {
                },

                activate: function () {
                    var i18n = this.i18n = this._i18n.get().servicesDetailsView;
                    this.effectiveServiceWidgetDefinition = this._substituteServiceDefintion(this.serviceWidgetDefinition,
                        i18n);
                },

                deactivate: function () {
                    this.effectiveServiceWidgetDefinition = null;
                    this.i18n = null;
                    this.disconnect();
                },

                // called by new service tool
                createService: function () {
                    this._createWindow({}, this.i18n);
                },

                _createWindow: function (
                    template,
                    i18n
                    ) {
                    var widget = this._createWidget(template, i18n);
                    var w = this.windowManager.createModalWindow({
                        title: i18n.createWindowTitle,
                        draggable: true,
                        dndDraggable: false,
                        content: widget,
                        closable: true
                    });
                    var save = d_lang.hitch(this, "_handleSaveService");
                    widget.connect(widget, "onControlEvent", function (evt) {
                        switch (evt.topic) {
                            case "wizardpanel/CANCEL" :
                                w.close();
                                break;
                            case "wizardpanel/DONE" :
                                save(widget, w);
                                break;
                        }
                    });
                    w.show();
                },

                _handleSaveService: function (
                    formWidget,
                    window
                    ) {
                    var dataBinding = formWidget.get("dataBinding");
                    var service = dataBinding.data;
                    service.id = service.title;
                    window.close();
                    ct_when(this.serviceStore.add(service, {incremental: true}), function (service) {
                        this.logger.info({
                            message: d_lang.replace(this.i18n.updateSuccess, service)
                        });
                        this.eventService.postEvent(this.serviceUpdateTopic, {
                            id: service.id
                        });
                    }, function (e) {
                        console.error("update of service failed:" + e, e);
                        this.logger.error({
                            message: d_lang.replace(this.i18n.updateError, {
                                id: service.id,
                                title: service.title,
                                error: e.error || e
                            }),
                            error: e
                        })
                    }, this);
                },

                _createWidget: function (
                    service,
                    i18n
                    ) {
                    var dfService = this.dataformService;
                    var form = dfService.createDataForm(this.effectiveServiceWidgetDefinition);
                    var binding = dfService.createBinding("object", {
                        data: service
                    });
                    form.set("dataBinding", binding);
                    return form;
                },

                _substituteServiceDefintion: function (
                    serviceWidetDefinition,
                    params
                    ) {
                    return new Hash(serviceWidetDefinition).substitute(params, true).asMap();
                }
            });
    });