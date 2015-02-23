define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "ct/_Connect",
        "ct/_when",
        "ct/Hash",
        "dijit/form/Button"
    ],
    function (
        d_lang,
        declare,
        _Connect,
        ct_when,
        Hash,
        Button
        ) {

        return declare([_Connect],
            /**
             * @lends servicemanagement.ServiceDetailsController.prototype
             */
            {
                serviceUpdateTopic: "ct/servicemanagement/SERVICE_CONFIG_UPDATED",
                // injected
                dataformService: null,
                windowManager: null,
                serviceStore: null,

                /* A service is like:
                 {
                 "createdAt": 1346783197493,
                 "createdBy": "",
                 "description": "a long description",
                 "id": "test2",
                 "tags": [],
                 "title": "My Service"
                 }
                 */
                serviceWidgetDefinition: {
                    "dataform-version": "1.0.0",
                    "type": "wizardpanel",
                    //"animate" :false,
                    "showCancel": true,
                    "size": {
                        "w": 540,
                        "h": 270
                    },
                    "children": [
                        {
                            "type": "gridpanel",
                            "children": [
                                {
                                    "spanLabel": true,
                                    "type": "label",
                                    "valueClass": "nowidth",
                                    "value": "${panelDefaultTitle}"
                                },
                                {
                                    "type": "textbox",
                                    "field": "title",
                                    "title": "${title}",
                                    "size": {
                                        "w": 300
                                    },
                                    "required": true
                                },
                                {
                                    "type": "textarea",
                                    "field": "description",
                                    "title": "${description}",
                                    "size": {
                                        "w": 300,
                                        "h": 50
                                    }
                                },
                                {
                                    "type": "label",
                                    "title": "${id}",
                                    "field": "id"
                                },
                                {
                                    "type": "label",
                                    "field": "createdBy",
                                    "title": "${createdBy}"
                                },
                                {
                                    "type": "label",
                                    "field": "createdAt",
                                    "title": "${createdAt}",
                                    "fieldType": "datetime"
                                },
                                {
                                    "type": "label",
                                    "field": "modifiedBy",
                                    "title": "${modifiedBy}"
                                },
                                {
                                    "type": "label",
                                    "field": "modifiedAt",
                                    "title": "${modifiedAt}",
                                    "fieldType": "datetime"
                                }
                            ]
                        },
                        {
                            "type": "gridpanel",
                            "children": [
                                {
                                    "spanLabel": true,
                                    "type": "label",
                                    "valueClass": "nowidth",
                                    "value": "${panelFileTitle}"
                                },
                                {
                                    "type": "label",
                                    "field": "fileName",
                                    "title": "${fileName}"
                                },
                                {
                                    "type": "uploader",
                                    "value": "${upload}",
                                    "uploadedLabel": "${uploaded}",
                                    "url": "${uploadURL}",
                                    "spanLabel": true,
                                    "field": "fileName"
                                },
                                {
                                    "spanLabel": true,
                                    "type": "label",
                                    "valueClass": "nowidth",
                                    "value": "${editLabel}"
                                },
                                {
                                    "type": "button",
                                    "topic": "edit/ServiceConfig",
                                    "title": "${editServiceConfiguration}",
                                    "spanLabel": true
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

                // called by onShowServiceDetails event
                showServiceDetails: function (params) {
                    var i18n = this.i18n;
                    var serviceId = params.getProperty("id");
                    if (!serviceId) {
                        return;
                    }
                    var service = this.serviceStore.get(serviceId);
                    ct_when(service, function (service) {
                        this._createWindow(service, i18n);
                    }, this);
                },

                _createWindow: function (
                    service,
                    i18n
                    ) {
                    var widget = this._currentWidget = this._createWidget(service, i18n);
                    var w = this.windowManager.createModalWindow({
                        title: d_lang.replace(i18n.windowTitle, service),
                        draggable: true,
                        dndDraggable: false,
                        content: widget,
                        closable: true
                    });

                    var handleUpload = d_lang.hitch(this, "_handleUploadState");
                    var save = d_lang.hitch(this, "_handleSaveService");
                    widget.connect(widget, "onControlEvent", d_lang.hitch(this, function (evt) {
                        var topic = evt.topic;
                        if (topic.match(/^uploader\/.*/)) {
                            handleUpload(service, evt);
                            return;
                        }
                        switch (evt.topic) {
                            case "wizardpanel/CANCEL" :
                                w.close();
                                break;
                            case "wizardpanel/DONE" :
                                save(widget, w);
                                break;
                            case "edit/ServiceConfig":
                                save(widget, w);
                                this.eventService.postEvent("ct/servicemanagement/SERVICE_SHOW", {
                                    service: service
                                });
                                break;
                        }
                    }));
                    w.show();
                },

                saveServiceConfig: function (evt) {
                    var service = this._currentService;
                    var config = {
                        services: evt.getProperty("services")
                    };
                    this._save(config, {
                        id: service.id + ".json"
                    });
                },

                _save: function (
                    service,
                    opts
                    ) {
                    opts = opts || {};
                    var handleError = function (e) {
                        e = e || {
                            error: "undefined"
                        };
                        console.error("update of service failed:" + e, e);
                        this.logger.error({
                            message: d_lang.replace(this.i18n.updateError, {
                                id: service.id,
                                title: service.title,
                                error: e.error || e
                            }),
                            error: e
                        })
                    };
                    ct_when(this.serviceStore.put(service, opts), function (service) {
                        if (!service) {
                            handleError.call(this, service)
                            return;
                        }
                        this.logger.info({
                            message: d_lang.replace(this.i18n.updateSuccess, service)
                        });
                        this.eventService.postEvent(this.serviceUpdateTopic, {
                            id: service.id
                        });
                    }, handleError, this);
                },

                _handleSaveService: function (
                    formWidget,
                    window
                    ) {
                    var dataBinding = formWidget.get("dataBinding");
                    var service = dataBinding.data;
                    delete service.fileName;
                    this._currentService = service;
                    window.close();
                    this._save(service);
                },

                _handleUploadState: function (
                    service,
                    evt
                    ) {
                    if (evt.topic === 'uploader/START') {
                        this.logger.info({
                            message: this.i18n.uploadStart
                        });
                        return;
                    }
                    if (evt.topic === 'uploader/ERROR') {
                        this.logger.error({
                            message: this.i18n.uploadError + evt.error
                        });
                        return;
                    }
                    if (evt.topic === 'uploader/FINISHED') {
                        this.eventService.postEvent(this.serviceUpdateTopic, {
                            id: service.id
                        });
                        this.logger.info({
                            message: this.i18n.uploadFinished
                        });
                        return;
                    }
                },

                _createWidget: function (
                    service,
                    i18n
                    ) {
                    var dfService = this.dataformService;
                    //TODO: use binding for url configuration!
                    var form = dfService.createDataForm(this._substituteServiceDefintion(this.effectiveServiceWidgetDefinition,
                        {
                            uploadURL: this.serviceStore.target + service.id
                        }));
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