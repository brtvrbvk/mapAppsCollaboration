define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol"
], function (
    declare,
    d_array,
    SimpleMarkerSymbol,
    SimpleLineSymbol
    ) {

    return declare([], {

        defaultSimpleMarkerSymbol: {
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
        },

        defaultSimpleLineSymbol: {
            "color": [0, 0, 0, 255],
            "width": 1,
            "type": "esriSLS",
            "style": "esriSLSSolid"
        },

        defaultSimpleFillSymbol: {
            "color": [255, 0, 0, 128],
            "type": "esriSFS",
            "style": "esriSFSSolid",
            "outline": {
                "color": [0, 0, 0, 255],
                "width": 1,
                "type": "esriSLS",
                "style": "esriSLSSolid"
            }
        },

        addEsriSymbolToFeature: function (feature) {
            var symbol;
            if (!feature.geometry){
                return;
            }
            switch (feature.geometry.type) {
                case "polyline":
                    symbol = this._getSimpleLineSymbol();
                    break;
                case "polygon":
                    symbol = this._getSimpleFillSymbol();
                    break;
                case "point":
                    symbol = this._getSimpleMarkerSymbol();
                    break;
            }
            if (symbol) {
                feature.symbol = symbol.toJson();
            }
        },

        _getSimpleMarkerSymbol: function() {
            var markerSymbolJson = this._properties.simpleMarkerSymbol || this.defaultSimpleMarkerSymbol;
            return new SimpleMarkerSymbol(markerSymbolJson);
        },

        _getSimpleLineSymbol: function() {
            var simpleLineSymbolJson = this._properties.simpleLineSymbol || this.defaultSimpleLineSymbol;
            return new SimpleLineSymbol(simpleLineSymbolJson);
        },

        _getSimpleFillSymbol: function() {
            var simpleFillSymbolJson = this._properties.simpleFillSymbol || this.defaultSimpleFillSymbol;
            return new SimpleLineSymbol(simpleFillSymbolJson);
        }
    });
});