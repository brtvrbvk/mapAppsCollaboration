/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 23.09.13
 * Time: 10:26
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/json",
        "ct/mapping/mapcontent/MappingResourceFactory",
        "ct/mapping/mapcontent/MappingResourceTypes",
        "ct/mapping/mapcontent/ServiceTypes",
        "ct/mapping/map/ServiceNode",
        "ct/mapping/map/RasterLayerNode",
        "ct/mapping/map/CategoryNode",
        "ct/mapping/map/FeatureLayerNode",
        "ct/_Connect",
        "ct/Stateful",
        "base/mapping/MappingResourceUtils",
        "base/util/CommonID"
    ],
    function (declare, d_array, d_json, MappingResourceFactory, MappingResourceTypes, ServiceTypes, ServiceNode, RasterLayerNode, CategoryNode, FeatureLayerNode, Connect, Stateful, MappingResourceUtils, commonID) {
        return declare([],
            {

                _insertionnodename: "__operationallayer__",

                constructor: function () {

                },

                activate: function () {

                    this._mrFactory = new MappingResourceFactory();

                    this.insertionNode = this.mapModel.getNodeById(this._insertionnodename);

                },

                encodeURLParameter: function () {
                    return {addServices: ""};
                },

                decodeURLParameter: function (parameterObject) {

                    if (parameterObject.addServices) {
                        this._addServices(parameterObject.addServices);
                    }
                    if (parameterObject.addDatasets) {
                        this._addDatasets(parameterObject.addDatasets);
                    }

                },

                _getType: function (type) {
                    //TODO
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

                _openContentManager: function () {
                    if (!this.combicontentmanagerTool.get("active")) {
                        this.combicontentmanagerTool.set("active",
                            true);
                    }
                },

                /*
                 * [{"url":"http://nlbtest.agiv.be/inspire/wms/beschermde_gebieden","title":"Dynamic Bosres","type":"INSPIRE","layers":[{"id":"Bosres","title":"My bosres"}]},{"url":"http://nlbtest.agiv.be/inspire/wms/administratieve_eenheden","type":"INSPIRE","title":"admin","layers":[{"id":"Watering","title":"My watering"}]}]
                 */
                _addDatasets: function (datasetJson) {

                    var datasets = d_json.fromJson(datasetJson);
                    var dataAdded = false;

                    d_array.forEach(datasets, function (d) {

                        try {

                            var url = d.url;
                            var type = d.type;
                            var layers = d.layers;
                            type = this._getType(type);

                            var service = MappingResourceUtils.getServiceResource(this.mrr,
                                this._mrFactory,
                                url,
                                type,
                                "");
                            d_array.forEach(layers, function (l) {
//BartVerbeeck Bug29973 20150503
                                //delete l.title;

                                var newLayerId = url + "_" + l.id + "_" + new Date().getTime();

                                var serviceNode = commonID.findIdInModel(this.mapModel,
                                    newLayerId);

                                if (!serviceNode) {
                                    //we only create a layer if it´s not already there
                                    var serviceMapModelNode = MappingResourceUtils.addServiceMapModelNode(service,
                                        "",
                                        this.insertionNode,
                                        newLayerId);
                                    serviceMapModelNode.added = true;
                                    MappingResourceUtils.addLayer(this.mrr,
                                        this._mrFactory,
                                        service,
                                        l,
                                        type,
                                        serviceMapModelNode);
                                    dataAdded = true;

                                }

                            }, this);

                        } catch (ex) {
                            console.error("Unable to add dataset",
                                ex);
                        }

                    }, this);

                    if (dataAdded) {
                        this.mapModel.fireModelStructureChanged({
                            source: this
                        });
                        this._openContentManager();
                    }

                },

                _addServices: function (datasetJson) {
                    //TODO integrate loadservice, wait for discussion & figure out what to do if multiple services are added
                    var datasets = d_json.fromJson(datasetJson);
                    //remember: triggerSearch needs a string to work properly
                    this.loadServiceController.triggerSearch(datasets[0], true);
                    //this.loadServiceController.showDialog();
                }
            }
        );
    }
);