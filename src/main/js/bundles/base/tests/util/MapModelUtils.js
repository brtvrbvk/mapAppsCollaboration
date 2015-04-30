/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 10.03.14.
 */
define([
        "ct/mapping/map/MapModel",
        "ct/mapping/map/ServiceNode",
        "ct/mapping/map/RasterLayerNode",
        "ct/mapping/map/CategoryNode",
        "ct/mapping/mapcontent/MappingResourceRegistryInitializer",
        "ct/mapping/map/EsriLayerFactory",
        "ct/mapping/map/EsriService",
        "ct/mapping/mapcontent/ServiceTypes"
    ],
    function (
        MapModel,
        ServiceNode,
        RasterLayerNode,
        CategoryNode,
        MappingResourceRegistryInitializer,
        EsriLayerFactory,
        EsriService,
        ServiceTypes
        ) {

        ServiceTypes.POI = "POI";
        EsriLayerFactory.globalServiceFactories[ServiceTypes.POI] = {
            create: function (
                node,
                url
                ) {
                return new EsriService({
                    mapModelNode: node,
                    isGraphicLayer: true,
                    createEsriLayer: function () {
                        return {};
                    }
                });
            }
        };

        ServiceTypes.GIPOD = "GIPOD";
        EsriLayerFactory.globalServiceFactories[ServiceTypes.GIPOD] = {
            create: function (
                node,
                url
                ) {
                return new EsriService({
                    mapModelNode: node,
                    isGraphicLayer: true,
                    createEsriLayer: function () {
                        return {};
                    }
                });
            }
        };

        return {

            getPopulatedMRR: function () {
                return new MappingResourceRegistryInitializer().initFromData({
                    "services": [
                        {
                            "id": "webCacheDOP01",
                            "type": "AGS_TILED",
                            "url": "http://www.gis10.nrw.de/arcgis/rest/services/webcache/DOP/MapServer",
                            "layers": [
                                {
                                    "id": "0"
                                }
                            ]
                        },
                        {
                            "id": "agiv_ferraris",
                            "type": "WMTS",
                            "url": "http://grb.agiv.be/geodiensten/raadpleegdiensten/geocache/wmts",
                            "options": {
                                "serviceMode": "KVP",
                                "layerInfo": {
                                    "format": "png",
                                    "identifier": "ferraris",
                                    "tileMatrixSet": "GoogleMapsVL"
                                }
                            }
                        },
                        {
                            "id": "agiv_popp",
                            "type": "WMTS",
                            "url": "http://grb.agiv.be/geodiensten/raadpleegdiensten/geocache/wmts",
                            "options": {
                                "serviceMode": "KVP",
                                "layerInfo": {
                                    "format": "png",
                                    "identifier": "popp",
                                    "tileMatrixSet": "GoogleMapsVL"
                                }
                            }
                        },
                        {
                            "id": "testpoi",
                            "type": "POI",
                            "url": "http://ws.beta.agiv.be/poi/core",
                            "layers": [
                                {
                                    "id": "gewoon_kleuteronderwijs"
                                }
                            ]
                        },
                        {
                            "id": "webCacheDTK01",
                            "type": "AGS_TILED",
                            "url": "http://www.gis10.nrw.de/arcgis/rest/services/webcache/DTK_sw/MapServer",
                            "layers": [
                                {
                                    "id": "0"
                                }
                            ]
                        },
                        {
                            "id": "ortho",
                            "title": "ortho",
                            "serviceType": "WMTS",
                            "type": "WMTS",
                            "url": "http://tile.api.agiv.be/geodiensten/raadpleegdiensten/geocache/wmts",
                            "options": {
                                "serviceMode": "KVP",
                                "layerInfo": {
                                    "format": "png",
                                    "identifier": "orthoklm",
                                    "tileMatrixSet": "GoogleMapsVL"
                                }
                            }
                        },
                        {
                            "id": "administratieveeenheden inspire",
                            "title": "Administratieve Eenheden INSPIRE",
                            "layers": [
                                {
                                    "id": "Refgew"
                                },
                                {
                                    "id": "Refarr"
                                },
                                {
                                    "id": "Refprv"
                                },
                                {
                                    "id": "Refgem"
                                },
                                {
                                    "id": "Polder"
                                },
                                {
                                    "id": "Watering"
                                }
                            ],
                            "serviceType": "WMS",
                            "type": "WMS",
                            "url": "http://geo.agiv.be/inspire/wms/administratieve_eenheden"
                        },
                        {
                            "id": "uvo_wasser01",
                            "type": "AGS_DYNAMIC",
                            "url": "http://www.gis10.nrw.de/arcgis/rest/services/uvo_wasser/MapServer",
                            "layers": [
                                {
                                    "id": "0",
                                    "title": "Trinkwasserschutzgebiete"
                                },
                                {
                                    "id": "3",
                                    "title": "Heilquellenschutzgebiete"
                                },
                                {
                                    "id": "6",
                                    "title": "Wasserqualit\u00E4t Fl\u00FCsse"
                                }
                            ]
                        }
                    ]
                });
            },

            getPopulatedMapModel: function () {

                var mappingResourceRegistry = this.getPopulatedMRR();

                var service1 = new ServiceNode({
                    id: "service1",
                    service: mappingResourceRegistry.getMappingResourceByUniqueId("webCacheDOP01"),
                    children: [
                        new RasterLayerNode({
                            id: "service1/0",
                            layer: mappingResourceRegistry.getMappingResourceByUniqueId("webCacheDOP01/0")
                        })
                    ]
                });
                var service2 = new ServiceNode({
                    id: "service2",
                    service: mappingResourceRegistry.getMappingResourceByUniqueId("webCacheDTK01"),
                    children: [
                        new RasterLayerNode({
                            id: "service2/0",
                            layer: mappingResourceRegistry.getMappingResourceByUniqueId("webCacheDTK01/0")
                        })
                    ]
                });

                var cat1 = this.cat1 = new CategoryNode({
                    id: "cat1"
                });
                var service3 = new ServiceNode({
                    id: "service3",
                    service: mappingResourceRegistry.getMappingResourceByUniqueId("uvo_wasser01"),
                    children: [
                        new RasterLayerNode({
                            id: "service3/0",
                            layer: mappingResourceRegistry.getMappingResourceByUniqueId("uvo_wasser01/0")
                        }),
                        new RasterLayerNode({
                            id: "service3/1",
                            layer: mappingResourceRegistry.getMappingResourceByUniqueId("uvo_wasser01/3")
                        }),
                        new RasterLayerNode({
                            id: "service3/2",
                            layer: mappingResourceRegistry.getMappingResourceByUniqueId("uvo_wasser01/6")
                        })
                    ]
                });

                var service4 = new ServiceNode({
                    id: "ortho",
                    service: mappingResourceRegistry.getMappingResourceByUniqueId("ortho"),
                    children: []
                });

                var cat2 = this.cat2 = new CategoryNode({
                    id: "cat2"
                });

                var mapModel = new MapModel();
                cat1.addChild(service1);
                cat1.addChild(service2);
                cat2.addChild(service3);
                cat2.addChild(service4)
                mapModel.getOperationalLayer().addChild(cat2);
                mapModel.getBaseLayer().addChild(cat1);

                return mapModel;

            },

            addRandomLayer: function (
                node,
                mapmodel
                ) {

                var mappingResourceRegistry = this.getPopulatedMRR();
                var time = new Date().getTime();
                var service = new ServiceNode({
                    id: "service" + time,
                    service: mappingResourceRegistry.getMappingResourceByUniqueId("webCacheDTK01"),
                    children: [
                        new RasterLayerNode({
                            id: "service" + time + "/0",
                            layer: mappingResourceRegistry.getMappingResourceByUniqueId("webCacheDTK01/0")
                        })
                    ]
                });

                node.addChild(service);

                mapmodel.fireModelStructureChanged();

            }

        }
    }
);