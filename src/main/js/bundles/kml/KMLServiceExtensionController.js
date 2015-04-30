/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 24.09.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/Deferred",
        "ct/Stateful",
        "ct/_Connect",
        "ct/_when",
        "ct/request",
        "loadservice/_ServiceExtensionController",
        "ct/mapping/mapcontent/ServiceTypes",
        "base/mapping/MappingResourceUtils",
        "ct/mapping/mapcontent/MappingResourceFactory",
        "base/analytics/AnalyticsConstants",
        "base/util/CommonID",
        "./KMLServiceExtensionWidget"
    ],
    function (declare, Deferred, Stateful, _Connect, ct_when, ct_request, _ServiceExtensionController, ServiceTypes, MappingResourceUtils, MappingResourceFactory, AnalyticsConstants, CommonID, KMLServiceExtensionWidget) {
        return declare([
                Stateful,
                _Connect,
                _ServiceExtensionController
            ],
            {
                constructor: function () {

                },

                activate: function () {
                    this.inherited(arguments);
                    this.i18n = this._i18n.get();
                },

                deactivate: function () {

                },

                _getWidget: function () {
                    this.disconnect();
                    this.widget = new KMLServiceExtensionWidget(
                        {i18n: this.i18n}
                    );
                    this.connect(this.widget, "onSubmitClick", this._onSubmit);
                    return this.widget;
                },

                _onSubmit: function (evt) {

                    var url = evt.url,
                        title = evt.title;
//                        typeBinding = this._binding;

                    this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                        eventType: AnalyticsConstants.EVENT_TYPES.ADD_SERVICE_URL,
                        eventCategory: AnalyticsConstants.CATEGORIES.ADD_SERVICE,
                        eventValue: url
                    });
                    this.load(url, this._store, this._fromCatalogue, title);

                },

                _getType: function (type) {
                    return ServiceTypes.DirectKML;
                },

                load: function (url, store, fromCatalogue, title) {
                    this.startLoading();
                    try {
                        title = title || url.substring(url.lastIndexOf("/") + 1);

                        ct_when(ct_request({
                            url: url,
                            handleAs: "xml"
                        }), function (kml) {
                            try {

                                ct_when(this.kmlParser.isValid(kml, url), function () {

                                    var layerid = CommonID.get("kml");
                                    var res = {
                                        service: {
                                            TITLE: "KML",
                                            URL: url,
                                            SERVICE_TYPE: "KML",
                                            LAYERS: [
                                                {
                                                    ID: layerid,
                                                    TITLE: title
                                                }
                                            ]
                                        },
                                        layerIds: [layerid],
                                        directLoad: true
                                    };
                                    if (fromCatalogue) {
                                        this._servicesFromCatalogue[res.service.URL] = true;
                                    }
                                    this._handleLoadLayers(res);
                                    this.stopLoading();

                                }, function (error) {
                                    this.stopLoading();
                                    this.onError(error);
                                }, this);

                            } catch (e) {
                                this.stopLoading();
                                this.onError({
                                    label: this.i18n.ui.errors[400],
                                    type: "error"
                                });
                                return;
                            }

                        }, function (e) {
                            this.stopLoading();
                            this.onError({
                                label: this.i18n.ui.errors[404],
                                type: "error"
                            });
                        }, this);

                    } catch (ex) {
                        this.stopLoading();
                        this.onError({
                            label: this.i18n.ui.errors[404],
                            type: "error"
                        });
                    }
                }
            }
        );
    }
);