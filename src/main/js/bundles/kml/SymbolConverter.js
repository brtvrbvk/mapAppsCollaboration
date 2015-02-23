define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/Color"
], function (
    declare,
    d_array,
    SimpleLineSymbol,
    SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    Color
    ) {

    return declare([], {

        toEsriSymbol: function (graphic) {
            var attributes = graphic.attributes;
            var symbol;
            if (!graphic.geometry) {
                return;
            }
            switch (graphic.geometry.type) {
                case "polyline":
                    var color = this.getColorWithOpacity(attributes["stroke"], attributes["stroke-opacity"]);
                    symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, color, attributes["stroke-width"] || 2);
                    break;
                case "polygon":
                    var fillColorHex = attributes["fill"] ? attributes["fill"] : attributes["stroke"];
                    var outlineColor = this.getColorWithOpacity(attributes["stroke"], attributes["stroke-opacity"]);
                    var fillColor = this.getColorWithOpacity(fillColorHex, attributes["fill-opacity"]);
                    var line = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, outlineColor,
                            attributes["stroke-width"] || 2);
                    symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, line, fillColor);
                    break;
                case "point":
                    var fillColorHex = attributes["fill"] ? attributes["fill"] : attributes["stroke"];
                    var outlineColor = this.getColorWithOpacity(attributes["stroke"], attributes["stroke-opacity"]);
                    var fillColor = this.getColorWithOpacity(fillColorHex, attributes["fill-opacity"]);
                    var line = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, outlineColor,
                            attributes["stroke-width"] || 2);
                    symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 5, line, fillColor);
                    break;
                default:
                    debugger;
                    break;
            }
            graphic.symbol = symbol;
            this.deleteAttributesAddedByKmlToGeojsonParser(attributes);
        },

        getColorWithOpacity: function (
            hexColor,
            opacity
            ) {
            var color = new Color("#" + this.reorderHexColor(hexColor) || [
                0,
                0,
                0
            ]);
            var rgbColor = color.toRgb();
            rgbColor.push((typeof opacity !== "undefined") ? opacity : 1);
            var esriColor = new Color(rgbColor);
            esriColor.toJson = function () {
                return Color.toJsonColor(esriColor);
            };
            return esriColor;
        },

        reorderHexColor: function (hexColor) {
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