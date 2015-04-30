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
             * @lends identifyConfigmanagement.ServiceDetailsController.prototype
             */
            {
                identifyConfigUpdateTopic: "ct/identifymanagement/IDENTIFY_CONFIG_UPDATED",
                // injected
                dataformService: null,
                windowManager: null,
                identifyConfigStore: null,

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
                identifyConfigWidgetDefinition: {
                    "dataform-version": "1.0.0",
                    "type": "wizardpanel",
                    //"animate" :false,
                    "showCancel": true,
                    "size": {
                        "w": 540,
                        "h": 350
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
                                    "type": "checkbox",
                                    "field": "generalMapping",
                                    "title": "${generalMapping}"
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
                                },
                                {
                                    "spanLabel": true,
                                    "type": "label",
                                    "valueClass": "nowidth",
                                    "value": "${editLabel}"
                                },
                                {
                                    "type": "button",
                                    "topic": "edit/IdentifyConfig",
                                    "title": "${editIdentifyConfiguration}",
                                    "spanLabel": true
                                }
                            ]
                        }
//                        ,
//                        {
//                            "type": "gridpanel",
//                            "children": [
//                                {
//                                    "spanLabel": true,
//                                    "type": "label",
//                                    "valueClass": "nowidth",
//                                    "value": "${editLabel}"
//                                },
//                                {
//                                    "type": "button",
//                                    "topic": "edit/IdentifyConfig",
//                                    "title": "${editIdentifyConfiguration}",
//                                    "spanLabel": true
//                                }
//                            ]
//                        }
                    ]
                },

                /**
                 * @constructs
                 */
                constructor: function () {
                },

                activate: function () {
                    var i18n = this.i18n = this._i18n.get().identifyConfigsDetailsView;
                    this.effectiveServiceWidgetDefinition = this._substituteServiceDefintion(this.identifyConfigWidgetDefinition,
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
                    var identifyConfigId = params.getProperty("id");
                    if (!identifyConfigId) {
                        return;
                    }
                    var identifyConfig = this.identifyConfigStore.get(identifyConfigId);
                    ct_when(identifyConfig, function (identifyConfig) {
                        this._createWindow(identifyConfig, i18n);
                    }, this);
                },

                _createWindow: function (
                    identifyConfig,
                    i18n
                    ) {
                    var widget = this._currentWidget = this._createWidget(identifyConfig, i18n);
                    var w = this.windowManager.createModalWindow({
                        title: d_lang.replace(i18n.windowTitle, identifyConfig),
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
                            handleUpload(identifyConfig, evt);
                            return;
                        }
                        switch (evt.topic) {
                            case "wizardpanel/CANCEL" :
                                w.close();
                                break;
                            case "wizardpanel/DONE" :
                                save(widget, w);
                                break;
                            case "edit/IdentifyConfig":
                                save(widget, w);
                                this.eventService.postEvent("ct/identifymanagement/IDENTIFY_CONFIG_SHOW", {
                                    identifyConfig: identifyConfig
                                });
                                break;
                        }
                    }));
                    w.show();
                },

                saveIdentifyConfig: function (evt) {
                    var identifyConfig = this._currentConfig;
                    var config = {
                        identify: evt.getProperty("identify")
                    };
                    this._save(config, {
//                        incremental:true,
                        id: identifyConfig.id + ".json"
                    });
                },

                _save: function (
                    identifyConfig,
                    opts
                    ) {
                    opts = opts || {};
                    var handleError = function (e) {
                        e = e || {
                            error: "undefined"
                        };
                        console.error("update of identifyConfig failed:" + e, e);
                        this.logger.error({
                            message: d_lang.replace(this.i18n.updateError, {
                                id: identifyConfig.id,
                                title: identifyConfig.title,
                                error: e.error || e
                            }),
                            error: e
                        })
                    };
                    ct_when(this.identifyConfigStore.put(identifyConfig, opts), function (identifyConfig) {
                        if (!identifyConfig) {
                            handleError.call(this, identifyConfig)
                            return;
                        }
                        this.logger.info({
                            message: d_lang.replace(this.i18n.updateSuccess, identifyConfig)
                        });
                        this.eventService.postEvent(this.identifyConfigUpdateTopic, {
                            id: identifyConfig.id
                        });
                    }, handleError, this);
                },

                _handleSaveService: function (
                    formWidget,
                    window
                    ) {
                    var dataBinding = formWidget.get("dataBinding");
                    var identifyConfig = dataBinding.data;
                    delete identifyConfig.fileName;
                    this._currentConfig = identifyConfig;
                    window.close();
                    this._save(identifyConfig);
                },

                _handleUploadState: function (
                    identifyConfig,
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
                        this.eventService.postEvent(this.identifyConfigUpdateTopic, {
                            id: identifyConfig.id
                        });
                        this.logger.info({
                            message: this.i18n.uploadFinished
                        });
                        return;
                    }
                },

                _createWidget: function (
                    identifyConfig,
                    i18n
                    ) {
                    var dfService = this.dataformService;
                    //TODO: use binding for url configuration!
                    var form = dfService.createDataForm(this._substituteServiceDefintion(this.effectiveServiceWidgetDefinition,
                        {
                            uploadURL: this.identifyConfigStore.target + identifyConfig.id
                        }));
                    var binding = dfService.createBinding("object", {
                        data: identifyConfig
                    });

                    form.set("dataBinding", binding);
                    return form;
                },

                _substituteServiceDefintion: function (
                    identifyConfigWidetDefinition,
                    params
                    ) {
                    return new Hash(identifyConfigWidetDefinition).substitute(params, true).asMap();
                }
            });
    });