/*
 * @author mss
 */

define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/number",
        "ct/util/css",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "esri/geometry/geodesicUtils",
        "esri/units",
        "dojo/_base/event",
        "esri/geometry/mathUtils",
        "dojo/text!./templates/DrawingInfoWidget.html",
        "dijit/form/TextBox",
        "dijit/form/Button"
    ],
    function (
        declare,
        d_lang,
        d_array,
        d_number,
        ct_css,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        e_geodesicUtils,
        e_units,
        d_event,
        e_mathUtils,
        templateString
        ) {
        var DrawingInfoWidget = declare([
            _Widget,
            _TemplatedMixin,
            _WidgetsInTemplateMixin
        ], {

            templateString: templateString,
            _maxChars: 100,

            topics: {
                EDIT_GRAPHIC: "agiv/drawing/EDIT_GRAPHIC",
                GET_ELEVATION_INFO: "ct/elevation/GET_ELEVATION_INFO"
            },

            constructor: function (args) {
            },

            postCreate: function () {
                this.inherited(arguments);

                if (this.graphic.attributes && this.graphic.attributes.comment) {
                    this.inputText.set("value", this.graphic.attributes.comment);
                }
                if (this.graphic.symbol && this.graphic.symbol.text) {
                    this.inputText.set("value", this.graphic.symbol.text);
                }

                if (this.graphic && this.graphic.attributes) {
                    if (this.graphic.geometry.type === "polygon") {
                        this.graphic.attributes["area"] = e_geodesicUtils.geodesicAreas([
                                this.transformer.transform(this.graphic.geometry,
                                    "EPSG:4326")
                            ],
                            e_units.SQUARE_METERS);
                    } else if (this.graphic.geometry.type === "polyline") {
                        ct_css.switchVisibility(this.btnStartElevation.domNode,
                            true);
                        this.graphic.attributes["length"] = e_geodesicUtils.geodesicLengths([
                                this.transformer.transform(this.graphic.geometry,
                                    "EPSG:4326")
                            ],
                            e_units.METERS);
                    }

                }

                this.title = this.i18n.commentWindowTitle;

                this._initFieldValue();
            },

            _initFieldValue: function () {
                this.i18n.remainingCharacters + " " + this._maxChars;
                var g = this.graphic;
//                this.geometryTypeLabel.innerHTML = this.i18n.type + " " + g.geometry.type;
                var areaAndLength;
                var label;
                if (g.attributes.length) {
                    var l = g.attributes.length;
                    label = "m";
                    if (l > 1000) {
                        l /= 1000;
                        label = "km";
                    }
                    l = d_number.format(l, {
                        places: 2
                    }).replace(/\./g, " ");
                    areaAndLength = this.i18n.length + " " + l + " " + label;
                } else if (g.attributes.area) {
                    var a = g.attributes.area;
                    label = "m&sup2;"
                    if (a > 1000000) {
                        label = "km&sup2;";
                        a /= 1000000;
                    }
                    a = d_number.format(Math.round(a * 100) / 100, {
                        places: 2
                    }).replace(/\./g, " ");
                    areaAndLength = this.i18n.area + " " + a + " " + label;
                }
                if (areaAndLength) {
                    this.geometryAttrLabel.innerHTML = areaAndLength;
                }
            },

            _addCommentClick: function () {
                var text = this.inputText.displayedValue;
                if (text && text != "" && this.graphic) {
                    var attr = this.graphic.attributes || {};
                    attr.comment = text;
                    this.graphic.attributes = attr;
                    if(this.graphic.symbol && this.graphic.symbol.text){
                        this.graphic.symbol.setText(text);
                        this.graphic._graphicsLayer.redraw();
                    }
                    this.mapModel.fireModelStructureChanged({
                        source: this
                    });
                    this.eventService.postEvent(this.topics.EDIT_GRAPHIC, {
                        graphic: this.graphic
                    });

                    setTimeout(d_lang.hitch(this, function () {
                        var contentInfo = this.contentViewer.findContentInfoById("featureInfo");
                        this.contentViewer.closeContentInfo(contentInfo);
                    }), 250);

                }
            },

            _onKeyPress: function (evt) {
                evt.stopPropagation();
                if (evt.keyCode == dojo.keys.ENTER) {
                    this._addCommentClick();
                } else {
//                    var text = this.inputText.displayedValue;
//                    var l = text.length+1;
//                    if (l < this._maxChars) {
//                        this._remainingChars = this._maxChars-l;
//                    }
//                    this.remainingCharsLabel.innerHTML = this.i18n.remainingCharacters+" "+this._remainingChars;
                }
            },

            _onKeyUp: function (evt) {
                evt.stopPropagation();
            },

            _onShowElevation: function () {
                this.eventService.postEvent(this.topics.GET_ELEVATION_INFO, {
                    geometry: {
                        graphic: this.graphic
                    }
                });
            }

        });
        DrawingInfoWidget.createWidget = function (
            params,
            contentFactory
            ) {
            return new DrawingInfoWidget({
                graphic: params.content.graphic,
                i18n: contentFactory.get("ui").DrawingInfoWidget,
                transformer: contentFactory.get("transformer"),
                mapModel: contentFactory.get("mapModel"),
                eventService: contentFactory.get("eventService"),
                contentViewer: contentFactory.get("contentViewer"),
                baseClass: "agivDrawingInfoWidget"
            });
        };
        return DrawingInfoWidget;
    });

