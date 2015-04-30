/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 19.07.13
 * Time: 13:56
 */
define([
        "dojo/_base/array",
        "dojo/_base/lang",
        "ct/mapping/mapcontent/MappingResourceFactory",
        "ct/mapping/mapcontent/MappingResourceTypes",
        "ct/mapping/mapcontent/ServiceTypes",
        "ct/mapping/map/ServiceNode",
        "ct/mapping/map/RasterLayerNode",
        "ct/mapping/map/CategoryNode",
        "ct/mapping/map/FeatureLayerNode",
        "ct/_Connect"
    ],
    function (d_array, d_lang, MappingResourceFactory, MappingResourceTypes, ServiceTypes, ServiceNode, RasterLayerNode, CategoryNode, FeatureLayerNode, Connect) {
        return {

            getServiceResource: function (mrr, mrFactory, urlOrID, type, title, options) {
                if (urlOrID && urlOrID.indexOf("http") === 0) {
                    var uid = urlOrID.replace(/\//g, "_") + "_" + type;
                } else if (urlOrID) {
                    uid = urlOrID;
                } else {
                    return;
                }

                var foundServices = mrr.filter(function (mr) {
                    return mr.getLocalId() === uid;
                });
                if (foundServices && foundServices.length === 1) {
                    //we have a resource
                    return foundServices[0];
                } else {
                    //we need a new one
                    var service = mrFactory.createMappingResource(MappingResourceTypes.SERVICE, {
                        localId: uid,
                        serviceUrl: urlOrID,
                        serviceType: type,
                        title: title || urlOrID,
                        options: options
                    });
                    mrr.addMappingResource(service);
                    return service;
                }
            },

            getLayerResource: function (mrr, mrFactory, serviceResouce, layer, nodeType) {
                var foundLayers = mrr.filter(function (mr) {
                    return mr.getLocalId() === layer;
                });
                if (foundLayers && foundLayers.length === 1) {
                    //we have a resource
                    return foundLayers[0];
                }
                var l = mrFactory.createMappingResource(nodeType, {
                    localId: layer,
                    title: layer,
                    parentId: serviceResouce.getUniqueId()
                });
                mrr.addMappingResource(l);
                return l;
            },

            addLayerMapModelNode: function (layerResource, layerType, serviceMapModelNode, layertitle) {
                return this.addLayerMapModelNodeAt(null, layerResource, layerType, serviceMapModelNode, layertitle);
            },

            addLayerMapModelNodeAt: function (index, layerResource, layerType, serviceMapModelNode, layertitle) {
                var layernode = serviceMapModelNode.findChildById(layerResource.getLocalId());
                if (!layernode) {
                    var tmp;
                    if (layertitle) {
                        tmp = {
                            id: layerResource.getLocalId(),
                            title: layertitle,
                            layer: layerResource,
                            enabled: true
                        }
                    } else {
                        tmp = {
                            id: layerResource.getLocalId(),
                            layer: layerResource,
                            enabled: true
                        }
                    }
                    layernode = new layerType(tmp);
                    if (index === null) {
                        index = serviceMapModelNode.get("children").length;
                    }
                    serviceMapModelNode.addChildAt(layernode, index);
                } else {
                    layernode.set("enabled", true);
                }
                return layernode;
            },

            addServiceMapModelNode: function (serviceResource, title, insertionNode, id, priority, options) {
                return this.addServiceMapModelNodeAt(null, serviceResource, title, insertionNode, id, priority,
                    options);
            },

            addServiceMapModelNodeAt: function (index, serviceResource, title, insertionNode, id, priority, options) {
                var servicenode = insertionNode.findChildById(id || serviceResource.getLocalId());
                if (!servicenode) {
                    servicenode = new ServiceNode({
                        id: id || serviceResource.getLocalId(),
                        enabled: true,
                        service: serviceResource,
                        title: title || id || serviceResource.getLocalId(),
                        children: [],
                        options: options,
                        renderPriority: priority || 0
                    });
                    if (index === null) {
                        index = insertionNode.get("children").length;
                    }
                    insertionNode.addChildAt(servicenode, index);
                } else {
                    servicenode.set("enabled", true);
                }
                return servicenode;
            },

            addLayer: function (mrr, mrFactory, serviceResource, layer, type, serviceMapModelNode, mixinProperties) {
                return this.addLayerAt(null, mrr, mrFactory, serviceResource, layer, type, serviceMapModelNode,
                    mixinProperties)
            },

            addLayerAt: function (index, mrr, mrFactory, serviceResource, layer, type, serviceMapModelNode, mixinProperties) {
                var layername = (layer && layer.id) || layer || serviceMapModelNode.title || serviceMapModelNode.id;
                var layertitle = layer && layer.title;
                var nodeType = MappingResourceTypes.RASTER_LAYER,
                    layerType = RasterLayerNode;
                if (type == ServiceTypes.AGS_FEATURE) {
                    nodeType = MappingResourceTypes.FEATURE_LAYER;
                    layerType = FeatureLayerNode;
                }

                var layerResource = this.getLayerResource(mrr, mrFactory, serviceResource, layername, nodeType);
                d_lang.mixin(layerResource, mixinProperties);

                return this.addLayerMapModelNodeAt(index, layerResource, layerType, serviceMapModelNode, layertitle);

            },

            getHighestRenderPriorityOfChildren: function (node) {
                if (node.hasChildren()) {
                    var p = 0;
                    d_array.forEach(node.get("children"), function (n) {
                        p = n.get("renderPriority") > p ? n.get("renderPriority") : p;
                    });
                    return p;
                }
                return 0;
            }
        };
    }
);