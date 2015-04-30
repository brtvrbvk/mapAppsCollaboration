define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/DeferredList",
        "dojo/Deferred",
        "dojo/string",
        "ct/_string",
        "ct/_Connect",
        "ct/_when",
        "ct/request",
        "ct/Hash",
        "./IdentifyMappingWidget",
        "base/store/KnownServicesStore"
    ],
    function (
        d_lang,
        declare,
        d_array,
        DeferredList,
        Deferred,
        d_string,
        ct_string,
        _Connect,
        ct_when,
        ct_request,
        Hash,
        IdentifyMappingWidget,
        KnownServicesStore
        ) {

        return declare([_Connect],
            {
                constructor: function () {
                },

                activate: function () {
                    this.i18n = this._i18n.get().identifyMappingWidget;
                    this.knownServicesStore = new KnownServicesStore({
                        idProperty: "searchId"
                    });
                },

                deactivate: function () {
                    this.i18n = null;
                    this.disconnect();
                },

                createIdentifyMapping: function (evt) {
                    var configId = evt.getProperty("identifyConfig").id;
                    ct_when(ct_request.requestJSON({
                        url: ct_string.stringReplace(this._properties.target, {id: configId})
                    }), function (resp) {
                        this._createWindow(resp, this.i18n, configId);
                    }, this);
                },

                _createWindow: function (
                    identifyMapping,
                    i18n,
                    configId
                    ) {

                    ct_when(ct_request.requestJSON({url: this._properties.servicesBaseTarget}, {usePost: false}),
                        function (serviceResp) {

                            var allServices = [],
                                serviceDeferreds = [];

                            d_array.forEach(serviceResp.items, function (service) {

                                var def = new Deferred();

                                serviceDeferreds.push(def);

                                ct_when(ct_request.requestJSON({
                                        url: ct_string.stringReplace(this._properties.servicesTarget, {id: service.id})
                                    }), function (resp) {

                                        d_array.forEach(resp.services, function (serviceConfig) {

                                            serviceConfig.searchId = service.id + " : " + serviceConfig.id;

                                        }, this);

                                        allServices = allServices.concat(resp.services);

                                        def.resolve();

                                    }, this
                                )
                                ;

                            }, this);

                            var d = new DeferredList(serviceDeferreds);
                            ct_when(d, function (results) {
                                this.knownServicesStore.setData(allServices);
                                var widget = this._widget = new IdentifyMappingWidget(identifyMapping,
                                    this.knownServicesStore,
                                    i18n);
                                var w = this.windowManager.createInfoDialogWindow({
                                    title: i18n.createWindowTitle,
                                    draggable: true,
                                    dndDraggable: false,
                                    content: widget,
                                    closable: true,
                                    maximizable: true,
                                    showOk: true,
                                    showCancel: true,
                                    marginBox: {
                                        w: 1300,
                                        h: 600
                                    }
                                });
                                ct_when(w, function (evt) {
                                    this._handleSaveIdentifyMapping(configId);
                                }, this);
                            }, function (error) {
                                console.error(error);
                            }, this);

                        }, function (error) {
                            console.error(error);
                        }, this);

                },

                _handleSaveIdentifyMapping: function (configId) {
                    var store = this.identifyConfigStore;
                    var result = this._widget.getIdentifyMappingUpdate();

                    ct_when(store.add(result, {id: configId + ".json"}), function (resp) {
                        // do nothing
                        this.logger.info({
                            message: this.i18n.updateFinished
                        });
                    }, function (e) {
                        console.error("update of identifyMapping failed:" + e, e);
                        this.logger.error({
                            message: d_lang.replace(this.i18n.updateError, {
                                id: configId,
                                error: e.error || e
                            }),
                            error: e
                        });
                    }, this);
                }

            });
    });