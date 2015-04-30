define([
        "dojo/_base/lang",
        "geojson/Transformer",
        "geojson/geojson",
        "esri/geometry/jsonUtils",
        "./SymbolConverter",
        "dojo/_base/array"
    ],
    function (
        d_lang,
        Transformer,
        GEO__JSON,
        esri_geometry_jsonUtils,
        SymbolConverter,
        d_array
        ) {

        d_lang.extend(Transformer, {
            geojsonToGeometry: function (featureCollection) {
                var collection = GEO__JSON.toGeometry(featureCollection);
                var converter = new SymbolConverter();
                d_array.forEach(collection, function(item){
                    item.geometry = esri_geometry_jsonUtils.fromJson(item.geometry);
                    converter.toEsriSymbol(item);
                });
                return collection;
            }
        });
    });