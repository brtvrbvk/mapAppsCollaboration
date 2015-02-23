define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/Deferred",
        "ct/Stateful",
        "ct/request",
        "ct/_when",
        "ct/_Connect",
        "loadservice/_ServiceExtensionController",
        "loadservice/UrlAndTitleServiceExtensionWidget",
        "base/analytics/AnalyticsConstants"
    ],
    function (
        declare,
        d_array,
        Deferred,
        Stateful,
        ct_request,
        ct_when,
        _Connect,
        _ServiceExtensionController,
        UrlAndTitleServiceExtensionWidget,
        AnalyticsConstants
        ) {
        return declare([
                Stateful,
                _Connect,
                _ServiceExtensionController
            ],
            {

                activate: function() {
                    this.inherited(arguments);
                    this.i18n = this._i18n.get();
                },

                _getWidget: function () {
                    this._widget = new UrlAndTitleServiceExtensionWidget({
                        i18n: this.i18n
                    });
                    this.connect(this._widget, "onSubmitClick", this._onSubmit);
                    return this._widget;
                },

                _onSubmit: function (evt) {
                    var url = evt.url;
                    var title = evt.title;

                    this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                        eventType: AnalyticsConstants.EVENT_TYPES.ADD_SERVICE_URL,
                        eventCategory: AnalyticsConstants.CATEGORIES.ADD_SERVICE,
                        eventValue: url
                    });
                    this.load(url, title);

                },

                load: function (
                    url,
                    title
                    ) {
                    this.startLoading();
                    try {
                        ct_when(this._doErrorCheckRequest(url), function() {
                            title = title || url.substring(url.lastIndexOf("/") + 1);
                            var layerId = this._removeSlashesAndColonsFromString(url);
                            var res = {
                                service: {
                                    TITLE: "GeoJSON",
                                    URL: url,
                                    SERVICE_TYPE: "GeoJSON",
                                    LAYERS: [
                                        {
                                            ID: layerId,
                                            TITLE: title
                                        }
                                    ]
                                },
                                layerIds: [layerId]
                            };
                            this._handleLoadLayers(res);
                            this.stopLoading();
                        }, function() {
                            this._notifyError(); // defined in superclass
                        }, this);
                    } catch (error) {
                        this._notifyError(); // defined in superclass
                    }
                },

                _removeSlashesAndColonsFromString: function(s) {
                    var cleanedString = s.replace(/:/g, "");
                    return cleanedString.replace(/\//g, "");
                },

                _doErrorCheckRequest: function(url) {
                    var d = new Deferred();
                    ct_when(ct_request({
                        url: url,
                        handleAs: "json"
                    }), function (geoJson) {
                        try {
                            var features = geoJson.features;
                            var geoJsonTransformer = this.geoJsonTransformer;
                            d_array.forEach(features, function(feature) {
                                feature.geometry = geoJsonTransformer.geojsonToGeometry(feature.geometry);
                            }, this);
                            if (features.length === 0) {
                                d.reject("There are no features in the loaded dataset");
                            }
                            d.resolve();
                        } catch (e) {
                            d.reject(e);
                        }
                    }, function(error) {
                        d.reject(error);
                    }, this);
                    return d;
                }
            });
    });