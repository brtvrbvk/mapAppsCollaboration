define([
        "dojo/_base/declare",
        "./ServiceTypeRegistrator"
    ],
    function (
        declare,
        ServiceTypeRegistrator
        ) {
        return declare([],
            {
                activate: function() {
                    ServiceTypeRegistrator.registerServiceType("GeoJSON", this.geoJsonServiceType);
                }
            });
    });