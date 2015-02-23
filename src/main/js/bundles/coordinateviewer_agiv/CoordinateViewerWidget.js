define([
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/string",
        "dojo/number",
        "ct/_lang",
        "dijit/_Widget",
        "dojo/dom-class",
        "coordinateviewer/CoordinateViewerWidget",
        "ct/util/css"
    ],
    function (
        d_lang,
        declare,
        d_string,
        d_number,
        ct_lang,
        _Widget,
        d_domClass,
        CoordinateViewerWidget,
        css
        ) {
        /*
         * COPYRIGHT 2011 con terra GmbH Germany
         */
        var substitute = d_string.substitute;
        var CoordinateViewerWidget = declare([CoordinateViewerWidget],
            {
                templateString: "<div><table><tr data-dojo-attach-point='coordsRow'><td><span data-dojo-attach-point='coordsLabel'></span></td><td><span class='${baseClass}Coords' data-dojo-attach-point='coordsNode'></span></td></tr><tr data-dojo-attach-point='lambertCoordsRow'><td>Lambert72: </td><td><span class='${baseClass}LambertCoords' data-dojo-attach-point='lambertCoordsNode'></span></td></tr><tr><td colspan='2'><span class='${baseClass}Scale' data-dojo-attach-point='scaleNode'></td></tr></table></div>",

                attributeMap: d_lang.delegate(_Widget.prototype.attributeMap, {
                    coordlabel: [
                        {
                            node: "coordsLabel",
                            type: "innerHTML"
                        }
                    ],
                    coordtxt: [
                        {
                            node: "coordsNode",
                            type: "innerHTML"
                        }
                    ],
                    lambertCoordtxt: [
                        {
                            node: "lambertCoordsNode",
                            type: "innerHTML"
                        }
                    ],
                    scaletxt: [
                        {
                            node: "scaleNode",
                            type: "innerHTML"
                        }
                    ]
                }),

                lat: "-",
                lon: "-",
                x: "-",
                y: "-",
                showLambertCoordinates: false,

                postCreate: function () {
                    this.inherited(arguments);
                    this.set("coords", this.lon, this.lat);
                    if (this.showLambertCoordinates) {
                        this.set("lambertCoords", this.x, this.y);
                    }
                    if (this.showCoordinates && this.showLambertCoordinates)
                        this.set("coordlabel", "Web Mercator: ");
                    this.set("scale", this.scale);
                },

                _setShowCoordinatesAttr: function (showCoordinates) {
                    this.showCoordinates = showCoordinates;
                    css.switchVisibility(this.coordsRow, this.showCoordinates);
                },

                _setShowLambertCoordinatesAttr: function (showLambertCoordinates) {
                    this.showLambertCoordinates = showLambertCoordinates;
                    css.switchVisibility(this.lambertCoordsRow,
                        this.showLambertCoordinates);
                },

                _setCoordsAttr: function (
                    lon,
                    lat
                    ) {
                    if (this.showCoordinates) {
                        // in initial case don't try to format strings
                        if (ct_lang.isNumeric(lon) && ct_lang.isNumeric(lat)) {
                            this.lon = d_number.format(lon, {
                                places: this.decimalPlaces
                            });
                            this.lat = d_number.format(lat, {
                                places: this.decimalPlaces
                            });
                        } else {
                            this.lon = lon;
                            this.lat = lat;
                        }
                        var txt = substitute(this.coordsTemplate, {
                            lon: this.lon,
                            lat: this.lat
                        });
                        this.set("coordtxt", txt);
                    }
                },

                _setLambertCoordsAttr: function (
                    x,
                    y
                    ) {
                    if (this.showLambertCoordinates) {
                        // in initial case don't try to format strings
                        if (ct_lang.isNumeric(x) && ct_lang.isNumeric(y)) {
                            this.x = d_number.format(x, {
                                places: this.lambertDecimalPlaces
                            });
                            this.y = d_number.format(y, {
                                places: this.lambertDecimalPlaces
                            });
                        } else {
                            this.x = x;
                            this.y = y;
                        }
                        this.x = this.x.replace(".", " ").replace(",", ".");
                        this.y = this.y.replace(".", " ").replace(",", ".");
                        var txt = substitute(this.lambertCoordsTemplate, {
                            x: this.x,
                            y: this.y
                        });
                        this.set("lambertCoordtxt", txt);
                    }
                }

            });
        return CoordinateViewerWidget;
    });