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
                identifyConfigUpdateTopic: "ct/identifymanagement/IDENTIFY_CONFIG_CREATED",
                // injected
                dataformService: null,
                windowManager: null,
                identifyConfigStore: null,

                identifyConfigWidgetDefinition: {
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
                                            "value": "${createIdentifyConfigInfo}"
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
                    var i18n = this.i18n = this._i18n.get().identifyConfigsDetailsView;
                    this.effectiveIdentifyConfigWidgetDefinition = this._substituteIdentifyConfigDefintion(this.identifyConfigWidgetDefinition,
                        i18n);
                },

                deactivate: function () {
                    this.effectiveIdentifyConfigWidgetDefinition = null;
                    this.i18n = null;
                    this.disconnect();
                },

                // called by new identifyConfig tool
                createIdentifyConfig: function () {
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
                    var save = d_lang.hitch(this, "_handleSaveIdentifyConfig");
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

                _handleSaveIdentifyConfig: function (
                    formWidget,
                    window
                    ) {
                    var dataBinding = formWidget.get("dataBinding");
                    var identifyConfig = dataBinding.data;
                    identifyConfig.id = identifyConfig.title;
                    window.close();
                    ct_when(this.identifyConfigStore.add(identifyConfig, {incremental: true}),
                        function (identifyConfig) {
                            this.logger.info({
                                message: d_lang.replace(this.i18n.updateSuccess, identifyConfig)
                            });
                            this.eventService.postEvent(this.identifyConfigUpdateTopic, {
                                id: identifyConfig.id
                            });
                        }, function (e) {
                            console.error("update of identifyConfig failed:" + e, e);
                            this.logger.error({
                                message: d_lang.replace(this.i18n.updateError, {
                                    id: identifyConfig.id,
                                    title: identifyConfig.title,
                                    error: e.error || e
                                }),
                                error: e
                            })
                        }, this);
                },

                _createWidget: function (
                    identifyConfig,
                    i18n
                    ) {
                    var dfIdentifyConfig = this.dataformService;
                    var form = dfIdentifyConfig.createDataForm(this.effectiveIdentifyConfigWidgetDefinition);
                    var binding = dfIdentifyConfig.createBinding("object", {
                        data: identifyConfig
                    });
                    form.set("dataBinding", binding);
                    return form;
                },

                _substituteIdentifyConfigDefintion: function (
                    identifyConfigWidetDefinition,
                    params
                    ) {
                    return new Hash(identifyConfigWidetDefinition).substitute(params, true).asMap();
                }
            });
    });