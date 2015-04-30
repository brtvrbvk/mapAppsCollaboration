define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ct/array",
        "ct/mapping/edit/SymbolTableLookupStrategy"
    ],
    function (
        declare,
        d_lang,
        ct_array,
        SymbolTableLookupStrategy
        ) {
        /*
         * COPYRIGHT 2010-2011 con terra GmbH Germany
         */
        /**
         * @fileOverview This is file provides an resolver for graphics objects.
         */
        return declare([SymbolTableLookupStrategy],
            {

//                lookupTable: {
//                    "polyline": {
//                        "color": [0, 0, 0, 255],
//                        "width": 1,
//                        "type": "esriSLS",
//                        "style": "esriSLSSolid"
//                    },
//                    point: {
//                        "color": [128, 128, 0, 128],
//                        "size": 12,
//                        "type": "esriSMS",
//                        "style": "esriSMSCircle",
//                        "outline": {
//                            "color": [0, 0, 0, 255],
//                            "width": 1,
//                            "type": "esriSLS",
//                            "style": "esriSLSSolid"
//                        }
//                    },
//                    "point-generalized": {
//                        "color": [255, 0, 0, 128],
//                        "size": 6,
//                        "type": "esriSMS",
//                        "style": "esriSMSCircle",
//                        "outline": {
//                            "color": [0, 0, 0, 255],
//                            "width": 1,
//                            "type": "esriSLS",
//                            "style": "esriSLSSolid"
//                        }
//                    },
//                    multipoint: undefined,
//                    extent: undefined,
//                    polygon: undefined
//                },
                configure: function (
                    opts,
                    lookupTable
                    ) {
                    this.lookupAttributeName = opts.lookupAttributeName || "poitype";
                    this.lookupSymbolName = opts.lookupSymbolName || "TODO";
                    this.generalizationThreshold = opts.generalizationThreshold || 250;
                    this.generalizationScale = opts.generalizationScale || 5000000;
                    this.mapState = opts.mapState || undefined;
                    this.lookupTable = lookupTable;
                    this.doGeneralization = opts.doGeneralization || false;
                    this.mapState = opts.mapState;
                },

                lookup: function (
                    geometry,
                    attributes,
                    context
                    ) {
                    var attrVal = attributes[this.lookupAttributeName],
                        symbol = attributes[this.lookupSymbolName],
                        geomType = geometry.type,
                        s = null,
                        count = context && context.count || null,
                        typefix = "-" + attrVal,
                        postfix = "",
                        midfix = "",
                        useSymbolAttr = true,
                        selected = attributes.selected || ct_array.arraySearchFirst(context.highlightFeatures || [],
                            {"id": attributes.id}),
                        isCluster = attributes.isCluster,
                        currentScale = Math.round(this.mapState.getLOD().scale);

                    if (this.doGeneralization) {
                        if ((count !== null && count > this.generalizationThreshold) || (currentScale > this.generalizationScale)) {
                            midfix = "-generalized";
                            useSymbolAttr = false;
                        }
                    }

                    if (selected) {
                        postfix += "-selected";
                    }

                    if (isCluster) {
                        postfix += "-cluster";
                    }

                    if (symbol && useSymbolAttr) {
                        s = this._createSymbolFromItem(symbol);
                    } else if (geomType) {
                        s = this._lookupByAttrValue(geomType + typefix + midfix + postfix);
                        if (!s) {
                            s = this._lookupByGeomType(geomType + midfix + postfix);
                        }
                        if (!s) {
                            s = this._lookupByGeomType(geomType + typefix + postfix);
                        }
                        if (!s) {
                            s = this._lookupByGeomType(geomType + postfix);
                        }
                        if (!s) {
                            s = this._lookupByGeomType(geomType);
                        }
                    } else if (attrVal) {
                        s = this._lookupByAttrValue(attrVal);
                    }

                    if (s && isCluster) {
                        var t = d_lang.clone(s);
                        t.text = attributes.count;
                        return t;
                    }

                    return s || this.inherited(arguments);
                },

                _createSymbolFromItem: function (url) {
                    return {
                        "angle": 0,
                        "xoffset": 0,
                        "yoffset": 0,
                        "type": "esriPMS",
                        "url": url,
                        "contentType": "image/png",
                        "width": 24,
                        "height": 24
                    };
                }
            });
    });