/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 24.09.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/mapping/mapcontent/ServiceTypes",
        "ct/array",
        "base/mapping/MappingResourceUtils",
        "base/mapping/MapModelUtils",
        "ct/mapping/mapcontent/MappingResourceFactory",
        "base/analytics/AnalyticsConstants"
    ],
    function (declare, d_array, ServiceTypes, ct_array, MappingResourceUtils, MapModelUtils, MappingResourceFactory, AnalyticsConstants) {
        return declare([],
            {

                _servicesFromCatalogue: {},

                constructor: function () {

                },

                activate: function () {

                    this.insertionNode = this.mapModel.getOperationalLayer();
                    this._mrFactory = new MappingResourceFactory();

                },

                _getType: function (type) {
                    return type;
                },

                startLoading: function () {
                },
                stopLoading: function () {
                },
                onError: function () {
                },

                submit: function (url, fromCatalogue) {
                    this._fromCatalogue = fromCatalogue;
                    this._onSubmit({url: url});
                },

                _handleLoadLayers: function (evt) {

                    var serviceDescription = evt.service;
                    var url = serviceDescription.URL;
                    var type = this._getType(serviceDescription.SERVICE_TYPE);
                    var title = serviceDescription.TITLE;
                    var layers = evt.layerIds;
                    var service = MappingResourceUtils.getServiceResource(this.mrr, this._mrFactory, url,
                        type, title);
                    var addedData = false;

                    if (this._fromCatalogue) {
                        this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                            eventType: AnalyticsConstants.EVENT_TYPES.ADD_SERVICE_CAT,
                            eventCategory: AnalyticsConstants.CATEGORIES.ADD_SERVICE,
                            eventValue: url
                        });
                    } else {
                        this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                            eventType: AnalyticsConstants.EVENT_TYPES.ADD_SERVICE,
                            eventCategory: AnalyticsConstants.CATEGORIES.ADD_SERVICE,
                            eventValue: url
                        });
                    }

                    d_array.forEach(layers, function (l) {

                        var layer = ct_array.arraySearchFirst(serviceDescription.LAYERS, {ID: l});

                        if (layer) {

                            var genID = url + layer.ID;

                            var serviceMapModelNode = this.mapModel.getNodeById(genID);
                            if (!serviceMapModelNode) {

                                serviceMapModelNode = MappingResourceUtils.addServiceMapModelNode(service,
                                        layer.TITLE || layer.ID || title,
                                    this.insertionNode,
                                    genID, MapModelUtils.getNextRenderPriority(this.mapModel));
                                serviceMapModelNode.added = true;
                                serviceMapModelNode.fromCatalogue = this._servicesFromCatalogue[url];
                                MappingResourceUtils.addLayer(this.mrr, this._mrFactory, service,
                                    {id: layer.ID, title: layer.TITLE}, type,
                                    serviceMapModelNode);
                                addedData = true;

                            }

                        }

                    }, this);

                    if (addedData) {

                        this.mapModel.fireModelStructureChanged({
                            source: this,
                            dynamicAdd: true
                        });

                    }

                }
            }
        );
    }
);