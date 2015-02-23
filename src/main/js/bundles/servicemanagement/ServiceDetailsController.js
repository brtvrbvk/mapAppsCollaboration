define([
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/_base/declare",
        "ct/_Connect",
        "ct/_when",
        "ct/Hash",
        "./ServiceResolver",
        "ct/store/ComplexMemory",
        "ct/mapping/mapcontent/ServiceTypes",
        "ct/_lang"
    ],
    function (
        d_lang,
        d_array,
        declare,
        _Connect,
        ct_when,
        Hash,
        ServiceResolver,
        ComplexMemory,
        ServiceTypes,
        ct_lang
        ) {

        return declare([_Connect],
            /**
             * @lends appmanagement.ServiceDetailsController.prototype
             */
            {
                // injected
                dataformService: null,
                windowManager: null,
                store: null,

                /* A service is like:
                 {
                 "id":"worldImage",
                 "type":"AGS_TILED",
                 "url":"http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
                 "title": "a long description",
                 "description": "a long description",
                 "layers:[
                 {id: "a", title:"A layer", "description": "..."}
                 ]
                 }
                 */
                templateWidgetDefinition: {
                    "dataform-version": "1.0.0",
                    "type": "wizardpanel",
                    //"animate" :false,
                    "showCancel": true,
                    "size": {
                        "w": 540,
                        "h": 580
                    },
                    "children": [
                        {
                            "type": "gridpanel",
                            "children": [
                                {
                                    "type": "textbox",
                                    "field": "url",
                                    "title": "${url}",
                                    "tooltip": "${urltooltip}",
                                    "required": true,
                                    "regex": "url",
                                    "size": {
                                        "w": 310
                                    }
                                },
                                {
                                    "type": "button",
                                    "colLabel": "&nbsp;",
                                    "topic": "fetch/SERVICE_METADATA",
                                    "title": "${fetchMetadata}",
                                    "tooltip": "${fetchMetadatatooltip}"
                                },
                                {
                                    "type": "label",
                                    "colLabel": "<br /><br /><br /><br />",
                                    "value": "${fetchMetadataDesc}"
                                },
                                {
                                    "type": "comboBox",
                                    "field": "type",
                                    "title": "${type}",
                                    "tooltip": "${typetooltip}",
                                    "store": "config_service_details_servicetypes",
                                    "required": true
                                },
                                {
                                    "type": "textbox",
                                    "field": "title",
                                    "title": "${title}",
                                    "tooltip": "${titletooltip}",
                                    "required": true,
                                    "size": {
                                        "w": 310
                                    },
                                    "regex": "[a-zA-Z0-9_\u00E4\u00F6\u00FC\u00C4\u00D6\u00DC\u00DF ]+"
                                },
                                {
                                    "type": "textarea",
                                    "field": "description",
                                    "cssClass": "ctWizardDescription",
                                    "title": "${description}",
                                    "tooltip": "${descriptiontooltip}",
                                    "size": {
                                        "w": 300,
                                        "h": 50
                                    }
                                },
                                {
                                    "type": "textarea",
                                    "field": "options",
                                    "cssClass": "ctWizardDescription",
                                    "title": "${options}",
                                    "tooltip": "${optionstooltip}",
                                    "isJson": true,
                                    "size": {
                                        "w": 300,
                                        "h": 50
                                    }
                                },
                                {
                                    "type": "textarea",
                                    "field": "layers",
                                    "cssClass": "ctWizardDescription",
                                    "title": "${layer}",
                                    "tooltip": "${layertooltip}",
                                    "isJson": true,
                                    "size": {
                                        "w": 300,
                                        "h": 150
                                    }
                                },
                                {
                                    "type": "button",
                                    "colLabel": "&nbsp;",
                                    "topic": "edit/IDENTIFY_MAPPINGS",
                                    "title": "Edit identify mappings",
                                    "tooltip": "Edit identify mappings"
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
                    var i18n = this.i18n = this._i18n.get().serviceDetails;
                    this.effectiveWidgetDefinition = this._substituteTemplateDefintion(this.templateWidgetDefinition,
                        i18n);
                },
                deactivate: function () {
                    this.effectiveWidgetDefinition = null;
                    this.i18n = null;
                    this.disconnect();
                },

                createService: function () {
                    this._createMode = true;
                    var i18n = this.i18n;
                    var id = i18n.newServiceId;
                    var service = {
                        id: id
                    };
                    ct_when(service, function (service) {
                        this._createWindow(service, i18n);
                    }, this);
                },

                showServiceDetails: function (evt) {
                    this._createMode = false;
                    var i18n = this.i18n;
                    var id = evt.getProperty("id");
                    var service = this.store.get(id);
                    ct_when(service, function (service) {
                        this._createWindow(service, i18n);
                    }, this);
                },

                _createWindow: function (
                    service,
                    i18n
                    ) {
                    var widget = this._createWidget(service);
                    var w = this.windowManager.createModalWindow({
                        title: d_lang.replace(i18n.windowTitle, service),
                        draggable: true,
                        dndDraggable: false,
                        content: widget,
                        closable: true,
                        attachToDom: this._appCtx.builderWindowRoot
                    });

                    var save = d_lang.hitch(this, "_handleSave");
                    var fetchServiceMetadata = d_lang.hitch(this, "_handleFetchServiceMetadata");
                    var editMappings = d_lang.hitch(this, this._createIdentifyMappingWidget);

                    widget.connect(widget, "onControlEvent", function (evt) {
                        switch (evt.topic) {
                            case "wizardpanel/CANCEL" :
                                w.close();
                                break;
                            case "wizardpanel/DONE" :
                                save(widget, w);
                                break;
                            case "fetch/SERVICE_METADATA":
                                fetchServiceMetadata(widget, w);
                                break;
                            case "edit/IDENTIFY_MAPPINGS":
                                editMappings(widget, w);
                                break;
                        }
                    });
                    var that = this;
                    w.connect(w, "onClose", function () {
                        if (that._fetchRequest) {
                            that._fetchRequest.cancel();
                            that._fetchRequest = null;
                        }
                    });
                    w.show();
                },

                _createIdentifyMappingWidget: function (
                    formWidget,
                    window
                    ) {

                    var dataBinding = formWidget.get("dataBinding").data;
                    var layers = dataBinding.layers;
                    if (!layers && (dataBinding.serviceType === "WMTS" || dataBinding.type === "WMTS") && dataBinding.options && dataBinding.options.layerInfo) {
                        layers = [
                            {
                                id: dataBinding.options.layerInfo.identifier
                            }
                        ];
                    }

                    this._handleSave(formWidget, window);

                    var layeritems = d_array.map(layers, function (l) {
                        return {
                            serviceID: dataBinding.id,
                            id: l.id,
                            title: l.title
                        };
                    });

                    this.identifyLayerMappingStore.title = dataBinding.title;

                    this.identifyLayerMappingStore.getMetadata = function () {
                        return {
                            title: "Mapping Services",
                            displayField: "id",
                            fields: [
                                {
                                    "name": "id",
                                    "type": "string",
                                    "identifier": true
                                },
                                {
                                    "name": "title",
                                    "type": "string"
                                },
                                {
                                    "name": "serviceID",
                                    "type": "string"
                                }
                            ]
                        };
                    };

                    //put layers in store for dataview
                    this.identifyLayerMappingStore.setData(layeritems);
                    //toggle dataview
                    this.identifyLayerMappingViewTool.set("visibility", true);
                    this.identifyLayerMappingViewTool.set("active", true);

                    this.eventService.postEvent("ct/servicemanagement/IDENTIFY_LAYER_MAPPING_UPDATED");

                },

                _handleSave: function (
                    formWidget,
                    window
                    ) {
                    var dataBinding = formWidget.get("dataBinding");
                    var service = dataBinding.data;
                    window.close();
                    var store = this.store;
                    var result;
                    if (this._createMode) {
                        var id = (service.title || service.url).replace(/[^a-zA-Z0-1]/, "").toLowerCase();
                        var baseId = id;
                        var counter = 1;
                        while (store.get(id)) {
                            id = baseId + "" + counter++;
                        }
                        service.id = id;
                        result = store.add(service);
                    } else {
                        result = store.put(service);
                    }
                    ct_when(result, function (id) {

                        ct_when(store.query({}, {}), function (resp) {
                            this.eventService.postEvent("ct/servicemanagement/SAVE_SERVICE_CONFIG", {
                                services: resp
                            });
                        }, this);

//                    this.logger.info({
//                        message: d_lang.replace(this.i18n.updateSuccess,service)
//                    });
                        this.eventService.postEvent("ct/servicemanagement/SERVICE_UPDATED", {
                            id: service.id
                        });
                    }, function (e) {
                        console.error("update of app failed:" + e, e);
                        this.logger.error({
                            message: d_lang.replace(this.i18n.updateError, {
                                id: service.id,
                                title: service.title,
                                error: e.error || e
                            }),
                            error: e
                        });
                    }, this);
                },

                _handleFetchServiceMetadata: function (
                    formWidget,
                    window
                    ) {
                    var dataBinding = formWidget.get("dataBinding");
                    var service = dataBinding.data;
                    var resolver = new ServiceResolver(service);
                    if (this._fetchRequest) {
                        this._fetchCanceled = true;
                        this._fetchRequest.cancel();
                        this._fetchCanceled = false;
                        this._fetchRequest = null;
                    }
                    this._fetchRequest = ct_when(resolver.resolve(), function (metadata) {
                        this._fetchRequest = null;
                        dataBinding.set("type", metadata.type);
                        dataBinding.set("title", metadata.title || "");
                        dataBinding.set("description", metadata.description || "");
                        dataBinding.set("layers", metadata.layers || []);
                    }, function (e) {
                        this._fetchRequest = null;
                        if (this._fetchCanceled) {
                            return;
                        }
                        this.logger.error({
                            message: d_lang.replace(this.i18n.fetchError, {
                                id: service.id,
                                url: service.url,
                                error: e.error || e
                            }),
                            error: e
                        });
                    }, this);
                },

                _createWidget: function (service) {
                    var dfService = this.dataformService;
                    var serviceTypesStore = this._createServiceTypesStore();
                    dfService.addStore(serviceTypesStore);
                    var form = dfService.createDataForm(this.effectiveWidgetDefinition);
                    var binding = dfService.createBinding("object", {
                        data: service
                    });
                    form.set("dataBinding", binding);
                    dfService.removeStore(serviceTypesStore);
                    return form;
                },
                _createServiceTypesStore: function () {
                    var types = [];
                    ct_lang.forEachOwnProp(ServiceTypes, function (
                        val,
                        key
                        ) {
                        types.push({
                            value: val,
                            name: key
                        });
                    });
                    types.push({
                        value: "POI",
                        name: "POI"
                    });
                    types.push({
                        value: "GIPOD",
                        name: "GIPOD"
                    });
                    types.push({
                        value: "DirectKML",
                        name: "DirectKML"
                    });
                    return new ComplexMemory({
                        id: "config_service_details_servicetypes",
                        idProperty: "name",
                        data: types
                    });
                },

                _substituteTemplateDefintion: function (
                    templateWidetDefinition,
                    params
                    ) {
                    return new Hash(templateWidetDefinition).substitute(params, true).asMap();
                }
            });
    });