define([
        "dojo/_base/array",
        "dojo/_base/declare",
        "geojson/geojson",
        "esri/geometry/jsonUtils"
    ],
    function (
        d_array,
        declare,
        GEO_JSON,
        esri_geometry_jsonUtils
        ) {
        return declare([],
            {
                setSymbolCreator: function (symbolCreator) {
                    this.symbolCreator = symbolCreator;
                },

                geojsonToGeometry: function (featureCollection) {
                    var collection = GEO_JSON.toGeometry(featureCollection);
                    var symbolCreator = this.symbolCreator;
                    if (!symbolCreator) {
                        console.warn("SymbolAddingGeoJsonTransformer: No symbol creator defined.")
                        return esri_geometry_jsonUtils.fromJson(collection);
                    }
                    d_array.forEach(collection, function (feature) {
                        feature.geometry = esri_geometry_jsonUtils.fromJson(feature.geometry);
                        symbolCreator.addEsriSymbolToFeature(feature);
                    });
                    return collection;
                }
            });
    });