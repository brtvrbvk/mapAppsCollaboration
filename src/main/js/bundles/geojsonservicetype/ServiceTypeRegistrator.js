/**
 * Helper module to make it simpler to register a new service type in map.apps.
 */
define([
        "dojo/_base/declare",
        "ct/mapping/mapcontent/ServiceTypes",
        "ct/mapping/map/EsriLayerFactory"
    ],
    function (
        declare,
        ServiceTypes,
        EsriLayerFactory
        ) {
        return {
            registerServiceType: function (serviceTypeName, serviceFactory) {
                ServiceTypes[serviceTypeName] = serviceTypeName;
                EsriLayerFactory.globalServiceFactories[serviceTypeName] = serviceFactory;
            },

            unregisterServiceType: function (serviceTypeName) {
                delete EsriLayerFactory.globalServiceFactories[serviceTypeName];
                delete ServiceTypes[serviceTypeName];
            }
        };
    });