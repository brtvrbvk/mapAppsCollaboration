define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/Color"
], function (
    declare,
    d_array,
    SimpleLineSymbol,
    SimpleFillSymbol,
    SimpleMarkerSymbol,
    Color
    ) {

    return declare([], {

        addEsriSymbolToFeature: function (feature) {
            var attributes = feature.attributes;
            var symbol;
            if (!feature.geometry){
                return;
            }
            switch (feature.geometry.type) {
                case "polyline":
                    var color = this.getColorWithOpacity(attributes["stroke"], attributes["stroke-opacity"]);
                    symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, color, attributes["stroke-width"] || 2);
                    break;
                case "polygon":
                    var fillColorHex = attributes["fill"] ? attributes["fill"] : attributes["stroke"];
                    var outlineColor = this.getColorWithOpacity(attributes["stroke"], attributes["stroke-opacity"]);
                    var fillColor = this.getColorWithOpacity(fillColorHex, attributes["fill-opacity"]);
                    var line = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, outlineColor, attributes["stroke-width"] || 2);
                    symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, line, fillColor);
                    break;
                case "point":
                    // Not supported yet
//                    symbol = this._getSimpleMarkerSymbol();
                    break;
            }
            this.deleteAttributesAddedByKmlToGeojsonParser(attributes);
            feature.symbol = symbol.toJson();
        },

        _getSimpleMarkerSymbol: function() {
            var symbol = new SimpleMarkerSymbol({
                "color": [255,255,255,64],
                "size": 5,
                "angle": -30,
                "xoffset": 0,
                "yoffset": 0,
                "type": "esriSMS",
                "style": "esriSMSCircle",
                "outline": {
                    "color": [0,0,0,255],
                    "width": 2,
                    "type": "esriSLS",
                    "style": "esriSLSSolid"
                }
            });
            return symbol;
        },

        getColorWithOpacity: function(hexColor, opacity){
            var color = new Color("#" + this.reorderHexColor(hexColor) || [0,0,0]);
            var rgbColor = color.toRgb();
            rgbColor.push((typeof opacity !== "undefined") ? opacity : 1);
            var esriColor = new Color(rgbColor);
            esriColor.toJson = function(){
               return Color.toJsonColor(esriColor);
            };
            return esriColor;
        },

        reorderHexColor: function(hexColor) {
            return hexColor ? hexColor.split("").reverse().join("") : undefined;
        },
        deleteAttributesAddedByKmlToGeojsonParser: function (attributes) {
            var attributesAddedByKmlToGeojsonParser = [
                "stroke",
                "stroke-opacity",
                "stroke-width",
                "fill-opacity"
            ];
            d_array.forEach(attributesAddedByKmlToGeojsonParser, function (attr) {
                delete attributes[attr];
            });
        }

    });
});