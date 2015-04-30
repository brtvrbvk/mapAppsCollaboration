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
                synonymConfigCreatedTopic: "ct/synonymmanagement/SYNONYM_CONFIG_CREATED",

                dataformService: null,
                windowManager: null,
                synonymConfigStore: null,

                synonymConfigWidgetDefinition: {
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
                                            "value": "${createSynonymConfigInfo}"
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
                        }
                    ]
                },

                constructor: function () {
                },

                activate: function () {
                    var i18n = this.i18n = this._i18n.get().synonymConfigsDetailsView;
                    this.effectiveSynonymConfigWidgetDefinition = this._substituteSynonymConfigDefinition(this.synonymConfigWidgetDefinition,
                        i18n);
                },

                _substituteSynonymConfigDefinition: function (
                    synonymConfigWidgetDefinition,
                    params
                    ) {
                    return new Hash(synonymConfigWidgetDefinition).substitute(params, true).asMap();
                },

                deactivate: function () {
                    this.effectiveSynonymConfigWidgetDefinition = null;
                    this.i18n = null;
                    this.disconnect();
                },

                createSynonymConfig: function () {
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
                    var save = d_lang.hitch(this, "_handleSaveSynonymConfig");
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

                _createWidget: function (
                    synonymConfig,
                    i18n
                    ) {
                    var form = this.dataformService.createDataForm(this.effectiveSynonymConfigWidgetDefinition);
                    var binding = this.dataformService.createBinding("object", {
                        data: synonymConfig
                    });
                    form.set("dataBinding", binding);
                    return form;
                },

                _handleSaveSynonymConfig: function (
                    formWidget,
                    window
                    ) {
                    var dataBinding = formWidget.get("dataBinding");
                    var synonymConfig = dataBinding.data;
                    window.close();
                    ct_when(this.synonymConfigStore.add(synonymConfig, {incremental: true}), function (synonymConfig) {
                        this.logger.info({
                            message: d_lang.replace(this.i18n.updateSuccess, synonymConfig)
                        });
                        this.eventService.postEvent(this.synonymConfigCreatedTopic, {
                            id: synonymConfig.id
                        });
                    }, function (e) {
                        console.error("update of synonymConfig failed:" + e, e);
                        this.logger.error({
                            message: d_lang.replace(this.i18n.updateError, {
                                title: synonymConfig.title,
                                error: e.error || e
                            }),
                            error: e
                        })
                    }, this);
                }
            });
    });