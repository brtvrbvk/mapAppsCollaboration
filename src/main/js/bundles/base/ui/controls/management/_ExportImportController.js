define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "ct/_Connect",
        "ct/_when",
        "ct/Hash",
        "ct/Stateful",
        "dojo/io/iframe",
        "dataform/controls/Uploader",
        "ct/util/css"
    ],
    function (
        d_lang,
        declare,
        _Connect,
        ct_when,
        Hash,
        Stateful,
        iframe,
        Uploader,
        css
        ) {

        d_lang.extend(Uploader, {
            refreshBinding: function () {

                var binding = this.dataBinding;
                var dependsOn = this.dependsOnField;
                var widget = this.widget;

                var uploadedLabel = this._uploadedLabel;
                this._orgIconClass = widget.get("iconClass");
                var completed;
                this.connect("binding", widget, "onProgress", function (evt) {
                    if (!completed) {
                        widget.set("iconClass", "icon-spinner");
                        widget.set("label", evt.percent === "100%" ? uploadedLabel : evt.percent);
                    }
                });
                this.connect("binding", widget, "onBegin", function (evt) {
                    completed = false;
                    this.fireEvent("uploader/START", {
                        name: evt.name || evt.file || ""
                    });
                });
                this.connect("binding", widget, "onComplete", function (evt) {
                    completed = true;
                    // reset progress info
                    this.widget.set({"iconClass": this._orgIconClass, "label": this._label});
                    this._storeValue(evt);
                });
                //new onerror callback
                this.connect("binding", widget, "onError", function (evt) {
                    completed = true;
                    this.widget.set({"iconClass": this._orgIconClass, "label": this._label});
                    this.fireEvent("uploader/ERROR", {
                        error: evt.name || evt.file || evt.error || evt
                    });
                });

                if (dependsOn) {
                    this.connectP("binding", binding, dependsOn, "_checkCondition");
                    var val = binding.get(dependsOn);
                    css.switchHidden(widget.domNode, !val);
                }
            }
        });

        return declare([
                _Connect,
                Stateful
            ],
            {
                updateTopic: "ct/update",
                importWidgetDefinition: {
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
                                }
                            ]
                        }
                    ]
                },

                constructor: function () {
                },

                exportAll: function () {
                    this._exportAll(this.exportAllTarget);
                },

                _exportAll: function (target) {
                    var logger = this.logger;
                    if (this.deferred) {
                        this.deferred.cancel();
                    }
                    this.deferred = iframe.send({
                        url: target,
                        method: "GET"
                    }).then(function (data) {
                        // Do something
                    }, function (err) {
                        logger.error({
                            message: "Export error " + evt.error
                        });
                    });
                },

                _createWindow: function (
                    target,
                    i18n,
                    widgetTemplate
                    ) {
                    var widget = this._currentWidget = this._createWidget(target, widgetTemplate);
                    var w = this.windowManager.createModalWindow({
                        title: i18n.windowTitle,
                        draggable: true,
                        dndDraggable: false,
                        content: widget,
                        closable: true
                    });

                    var handleUpload = d_lang.hitch(this, "_handleUploadState");
//                    var finishImport = d_lang.hitch(this, "_handleFinishImport");
                    widget.connect(widget, "onControlEvent", d_lang.hitch(this, function (evt) {
                        var topic = evt.topic;
                        if (topic.match(/^uploader\/.*/)) {
                            handleUpload(evt, i18n);
                            return;
                        }
                        switch (evt.topic) {
                            case "wizardpanel/CANCEL" :
                                w.close();
                                break;
                            case "wizardpanel/DONE" :
                                w.close();
                                break;
                        }
                    }));
                    w.show();
                },

                _substituteDefintion: function (
                    widgetDef,
                    params
                    ) {
                    return new Hash(widgetDef).substitute(params, true).asMap();
                },

                _createWidget: function (
                    target,
                    widgetTemplate
                    ) {
                    var dfService = this.dataformService;
                    var form = dfService.createDataForm(this._substituteDefintion(widgetTemplate, {
                        uploadURL: target
                    }));
                    var binding = dfService.createBinding("object", {
                        data: {}
                    });

                    form.set("dataBinding", binding);
                    return form;
                },

                _handleUploadState: function (
                    evt,
                    i18n
                    ) {
                    if (evt.topic === 'uploader/START') {
                        this.logger.info({
                            message: i18n.uploadStart
                        });
                        return;
                    }
                    if (evt.topic === 'uploader/ERROR') {
                        this.logger.error({
                            message: i18n.uploadError + evt.error
                        });
                        return;
                    }
                    if (evt.topic === 'uploader/FINISHED') {
                        this.eventService.postEvent(this.updateTopic);
                        this.logger.info({
                            message: i18n.uploadFinished
                        });
                        return;
                    }
                }


            });
    });