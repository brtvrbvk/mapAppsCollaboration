/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 24.09.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/Deferred",
        "ct/Stateful",
        "ct/_Connect",
        "ct/_when",
        "ct/request",
        "ct/Locale",
        "ct/array",
        "ct/mapping/mapcontent/ServiceTypes",
        "base/mapping/MappingResourceUtils",
        "ct/mapping/mapcontent/MappingResourceFactory",
        "base/analytics/AnalyticsConstants",
        "./WMSServiceExtensionWidget",
        "./_ServiceExtensionController",
        "./STRStore"
    ],
    function (
        declare,
        d_array,
        Deferred,
        Stateful,
        _Connect,
        ct_when,
        ct_request,
        Locale,
        ct_array,
        ServiceTypes,
        MappingResourceUtils,
        MappingResourceFactory,
        AnalyticsConstants,
        WMSServiceExtensionWidget,
        _ServiceExtensionController,
        STRStore
        ) {
        return declare([
                Stateful,
                _Connect,
                _ServiceExtensionController
            ],
            {

                exclude: "CAPABILITIES",
                target: "./resources/str",
                filterGrouplayers: true,
                servicePreference: [
                    "INSPIRE",
                    "WMS"
                ],
                constructor: function () {

                },

                activate: function () {
                    this.inherited(arguments);
                    this.i18n = this._i18n.get();
                    var that = this;
                    this._store = new STRStore({
                        data: [],
                        idProperty: "ID",
                        getMetadata: function () {
                            return {
                                fields: that._getStructure()
                            };
                        }
                    });
                },

                _getStructure: function () {
                    return [
                        {
                            title: this.i18n.ui.fields.name,
                            name: 'TITLE'
                        }
                    ];
                },

                deactivate: function () {

                },

                _getType: function (type) {
                    switch (type) {
                        case "WMS":
                            return ServiceTypes.WMS;
                        case "INSPIRE":
                            return ServiceTypes.INSPIRE_VIEW;
                        case "WMTS":
                            return ServiceTypes.WMTS;
                    }
                    return type;
                },

                _getWidget: function () {
                    this.disconnect();
                    this.widget = new WMSServiceExtensionWidget(
                        {i18n: this.i18n}
                    );
                    this.connect(this.widget, "onLoadLayers", this._onLoadLayers);
                    this.connect(this.widget, "onSubmitClick", this._onSubmit);
                    return this.widget;
                },

                _onSubmit: function (evt) {

                    var url = evt.url;
//                        typeBinding = this._binding;

                    this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                        eventType: AnalyticsConstants.EVENT_TYPES.ADD_SERVICE_URL,
                        eventCategory: AnalyticsConstants.CATEGORIES.ADD_SERVICE,
                        eventValue: url
                    });

                    this._store.setData([]);

                    this.load(url, this._store, this._fromCatalogue);

                },

                _onLoadLayers: function (evt) {
                    this._handleLoadLayers(evt);
                },

                load: function (
                    url,
                    store,
                    fromCatalogue
                    ) {

                    this.startLoading();
                    this._fromCatalogue = fromCatalogue;

                    var content = {
                        f: "json",
                        exclude: this.exclude,
                        lang: Locale.getCurrent().getLanguageISO3166Digit2()
                    };

                    if (url.indexOf("?") > -1) {
                        //we have parameters, so force an update
                        content.forceUpdate = true;
                    }

                    content.url = encodeURI(url);

                    ct_when(ct_request.requestJSON({
                        url: this.target,
                        content: content
                    }), function (resp) {

                        if (resp && resp.SERVICES && resp.SERVICES.length > 0) {

                            var service;

                            d_array.some(this.servicePreference, function (sp) {

                                if (service) {
                                    return true;
                                }

                                d_array.some(resp.SERVICES, function (s) {

                                    if (sp === s.SERVICE_TYPE) {
                                        service = s;
                                        return true;
                                    }

                                });

                            });

                            if (service) {

                                var data = d_array.filter(service.LAYERS, function (layer) {
                                    if (this.filterGrouplayers && layer.SUB_LAYER_IDS) {
                                        return null;
                                    }
                                    return layer;
                                }, this);

                                store.setData(data);
                                this._serviceData = {
                                    store: store,
                                    service: service
                                };
                                if (this._fromCatalogue) {
                                    this._servicesFromCatalogue[service.URL] = true;
                                }
                                if (!this.widget.get("tableVisible")) {
                                    this.widget.showTable();
                                }
                                this.widget.set("serviceData", this._serviceData);

                                this.stopLoading();

                            } else {
                                this.onError({
                                    label: this.i18n.ui.errors["NOT  SUPPORTED"],
                                    type: "error"
                                });
                            }

                        } else {

                            this.onError({
                                label: this.i18n.ui.errors[resp.ERROR] || this.i18n.ui.errors[404],
                                type: "error"
                            });

                        }

                    }, function (err) {

                        this.onError({
                            label: this.i18n.ui.errors.serviceNotLoaded,
                            type: "error"
                        });

                    }, this);

                }
            }
        );
    }
);