define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ct/mapping/edit/SymbolTableLookupStrategy"
    ],
    function (
        declare,
        d_lang,
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

                lookupTable: {
                    point: {
                        "color": [
                            128,
                            128,
                            0,
                            128
                        ],
                        "size": 12,
                        "type": "esriSMS",
                        "style": "esriSMSCircle",
                        "outline": {
                            "color": [
                                0,
                                0,
                                0,
                                255
                            ],
                            "width": 1,
                            "type": "esriSLS",
                            "style": "esriSLSSolid"
                        }
                    },
                    "point-manifestation": {
                        "color": [
                            255,
                            0,
                            0,
                            255
                        ],
                        "size": 10,
                        "type": "esriSMS",
                        "style": "esriSMSCircle",
                        "outline": {
                            "color": [
                                0,
                                0,
                                0,
                                255
                            ],
                            "width": 1,
                            "type": "esriSLS",
                            "style": "esriSLSSolid"
                        }
                    },
                    "point-manifestation-cluster": {
                        "color": [
                            255,
                            0,
                            0,
                            255
                        ],
                        "size": 12,
                        "type": "esriSMS",
                        "style": "esriSMSCircle",
                        "outline": {
                            "color": [
                                0,
                                0,
                                0,
                                255
                            ],
                            "width": 1,
                            "type": "esriSLS",
                            "style": "esriSLSSolid"
                        }
                    },
                    "point-manifestation-severe-cluster": {
                        "color": [
                            255,
                            0,
                            0,
                            255
                        ],
                        "size": 12,
                        "type": "esriSMS",
                        "style": "esriSMSCircle",
                        "outline": {
                            "color": [
                                0,
                                0,
                                0,
                                255
                            ],
                            "width": 1,
                            "type": "esriSLS",
                            "style": "esriSLSSolid"
                        }
                    },
                    "point-workassignment": {
                        "color": [
                            0,
                            0,
                            255,
                            255
                        ],
                        "size": 10,
                        "type": "esriSMS",
                        "style": "esriSMSCircle",
                        "outline": {
                            "color": [
                                0,
                                0,
                                0,
                                255
                            ],
                            "width": 1,
                            "type": "esriSLS",
                            "style": "esriSLSSolid"
                        }
                    }
                },

                constructor: function () {

                },

                configure: function (
                    opts,
                    lookupTable
                    ) {
                    this.lookupAttributeName = opts.lookupAttributeName || "poitype";
                    this.lookupSymbolName = opts.lookupSymbolName || "TODO";
                    this.lookupTable = lookupTable;
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
                        typefix = "-" + attrVal,
                        postfix = "",
                        midfix = "",
                        useSymbolAttr = true,
                        selected = attributes.selected,
                        isCluster = attributes.clusterCount > 1,
                        isEventTyped = false,
                        isSevere = attributes.importantHindrance || (attributes.hindrance && attributes.hindrance.important);

                    if (!isCluster && (attributes.items || attributes.eventType)) {
                        var eventType = attributes.eventType || attributes.items[0].eventType;
                        if (eventType) {
                            postfix += "-eventtype";
                            isEventTyped = true;
                        }
                    }

                    if (!isEventTyped && isSevere) {
                        postfix += "-severe";
                    }

                    if (!isEventTyped && selected) {
                        postfix += "-selected";
                    }

                    if (!isEventTyped && isCluster) {
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

                    if (s && isEventTyped) {
                        var t = d_lang.clone(s);
                        t.url += "&eventtype=" + eventType;
                        return t;
                    }

                    if (s && isCluster) {
                        var t = d_lang.clone(s);
                        t.text = attributes.clusterCount;
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