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
            {
                synonymConfigUpdatedTopic: "ct/synonymmanagement/SYNONYM_CONFIG_UPDATED",

                dataformService: null,
                windowManager: null,
                synonymConfigStore: null,

                synonymWidgetDefinition: {
                    "dataform-version": "1.0.0",
                    "type": "wizardpanel",
                    "showCancel": true,
                    "size": {
                        "w": 540,
                        "h": 200
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
                                    "field": "synonyms",
                                    "title": "${synonyms}",
                                    "size": {
                                        "w": 300,
                                        "h": 50
                                    }
                                }
                            ]
                        }
                    ]
                },

                constructor: function () {
                },

                activate: function () {
                    var i18n = this.i18n = this._i18n.get().synonymConfigsDetailsView;
                    this.effectiveSynonymWidgetDefinition = this._substituteSynonymDefinition(this.synonymWidgetDefinition,
                        i18n);
                },

                _substituteSynonymDefinition: function (
                    synonymConfigWidgetDefinition,
                    params
                    ) {
                    return new Hash(synonymConfigWidgetDefinition).substitute(params, true).asMap();
                },

                deactivate: function () {
                    this.effectiveSynonymWidgetDefinition = null;
                    this.i18n = null;
                    this.disconnect();
                },

                showSynonymDetails: function (params) {
                    var i18n = this.i18n;
                    var synonymConfigId = params.getProperty("id");
                    if (!synonymConfigId) {
                        return;
                    }
                    var synonymConfig = this.synonymConfigStore.get(synonymConfigId);
                    ct_when(synonymConfig, function (synonymConfig) {
                        this._createWindow(synonymConfig, i18n);
                    }, this);
                },

                _createWindow: function (
                    synonymConfig,
                    i18n
                    ) {
                    var widget = this._createWidget(synonymConfig, i18n);
                    var w = this.windowManager.createModalWindow({
                        title: d_lang.replace(i18n.windowTitle, synonymConfig),
                        draggable: true,
                        dndDraggable: false,
                        content: widget,
                        closable: true
                    });

                    var save = d_lang.hitch(this, "_handleSaveService");
                    widget.connect(widget, "onControlEvent", d_lang.hitch(this, function (evt) {
                        var topic = evt.topic;
                        switch (evt.topic) {
                            case "wizardpanel/CANCEL" :
                                w.close();
                                break;
                            case "wizardpanel/DONE" :
                                save(widget, w);
                                break;
                        }
                    }));
                    w.show();
                },

                _createWidget: function (
                    synonymConfig,
                    i18n
                    ) {
                    var dfService = this.dataformService;
                    //TODO: use binding for url configuration!
                    var form = dfService.createDataForm(this._substituteSynonymDefinition(this.effectiveSynonymWidgetDefinition,
                        {
                            uploadURL: this.synonymConfigStore.target + synonymConfig.id
                        }));
                    var binding = this._binding = dfService.createBinding("object", {
                        data: synonymConfig
                    });
                    binding.watch("title", d_lang.hitch(this, function (
                        fieldName,
                        oldValue,
                        newValue
                        ) {
                        this._binding.data["oldTitle"] = oldValue;
                    }));
                    form.set("dataBinding", binding);
                    return form;
                },

                _handleSaveService: function (
                    formWidget,
                    window
                    ) {
                    var dataBinding = formWidget.get("dataBinding");
                    var synonymConfig = dataBinding.data;
                    var opts = {};
                    if (synonymConfig.oldTitle) {
                        opts["id"] = synonymConfig.oldTitle;
                        delete synonymConfig.oldTitle;
                    }
                    window.close();
                    this._save(synonymConfig, opts);
                },

                _save: function (
                    synonymConfig,
                    opts
                    ) {
                    var handleError = function (e) {
                        e = e || {
                            error: "undefined"
                        };
                        console.error("update of synonymConfig failed:" + e, e);
                        this.logger.error({
                            message: d_lang.replace(this.i18n.updateError, {
                                title: synonymConfig.title,
                                error: e.error || e
                            }),
                            error: e
                        })
                    };
                    ct_when(this.synonymConfigStore.put(synonymConfig, opts), function (synonymConfig) {
                        if (!synonymConfig) {
                            handleError.call(this, synonymConfig);
                            return;
                        }
                        this.logger.info({
                            message: d_lang.replace(this.i18n.updateSuccess, synonymConfig)
                        });
                        this.eventService.postEvent(this.synonymConfigUpdatedTopic, {
                            id: synonymConfig.id
                        });
                    }, handleError, this);
                }
            });
    });