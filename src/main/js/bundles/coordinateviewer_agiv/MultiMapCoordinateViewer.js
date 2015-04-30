/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 08.10.13
 * Time: 13:09
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "ct/_lang",
        "ct/mapping/geometry",
        "ct/mapping/LatLon",
        "coordinateviewer/CoordinateViewer",
        "./CoordinateViewerWidget"
    ],
    function (
        declare,
        d_lang,
        ct_lang,
        geometry,
        LatLon,
        CoordinateViewer,
        CoordinateViewerWidget
        ) {
        return declare([CoordinateViewer],
            {
                constructor: function () {

                },

                activate: function () {
                    this._transformHitch = d_lang.hitch(this, "_transform");
                    console.debug("CoordinateViewer.activate");
                    var properties = this._properties;

                    var i18n = this._i18n.get().ui;
                    var mapState = this._mapState;
                    var targetWkid = properties.targetSrs ? this._getWkidFromEPSGString(properties.targetSrs) : mapState.getSpatialReference().wkid;
                    var coordinateTransformer = this._coordinateTransformer;
                    var projection = coordinateTransformer && coordinateTransformer.getProjection(targetWkid);
                    this._useDegreeFormat = (projection && geometry.isProjectionDegree(projection) && properties.degreeFormat) || properties.degreeFormat;

                    var srs = coordinateTransformer && coordinateTransformer.getProjection(targetWkid);
                    var srsTitle = (srs && srs.title && d_lang.trim(srs.title) ) || i18n.noSrs;
                    var showScale = true;
                    if (properties.showScale !== undefined) {
                        showScale = properties.showScale;
                    }
                    var showCoordinates = true;
                    if (properties.showCoordinates !== undefined) {
                        showCoordinates = properties.showCoordinates;
                    }
                    var decimalPlaces = this._decimalPlaces = !isNaN(properties.decimalPlaces) ? properties.decimalPlaces : 3;

                    var opts = {
                        coordsTemplate: i18n.coordinates,
                        scaleTemplate: i18n.scale,
                        showScale: showScale,
                        showCoordinates: showCoordinates,
                        showLambertCoordinates: properties.showLambertCoordinates,
                        decimalPlaces: decimalPlaces,
                        srs: srsTitle
                    }

                    if (properties.showLambertCoordinates) {
                        var lambertDecimalPlaces = this._lambertDecimalPlaces = !isNaN(properties.lambertDecimalPlaces) ? properties.lambertDecimalPlaces : 2;
                        opts = d_lang.mixin(opts, {
                            lambertCoordsTemplate: i18n.lambertCoordinates,
                            lambertDecimalPlaces: lambertDecimalPlaces
                        });
                    }

                    var coordinateViewerWidget = this._coordinateViewerWidget = new CoordinateViewerWidget(opts);

                    var that = this;
                    if (showCoordinates) {
                        this.connect("map", this._mapState, "onMouseMove", function (e) {
                            that._updateCoordInfo(e.mapPoint || (e.event && e.mapPoint));
                        });
                        this.connect("map", this._mapState, "onMouseDown", function (e) {
                            that._updateCoordInfo(e.mapPoint);
                        });
                        if (this._secondMapState) {
                            this.connect("map", this._secondMapState, "onMouseMove", function (e) {
                                that._updateCoordInfo(e.mapPoint || (e.event && e.mapPoint));
                            });
                            this.connect("map", this._secondMapState, "onMouseDown", function (e) {
                                that._updateCoordInfo(e.mapPoint);
                            });
                        }
                    }
                    if (showScale) {
                        this.connect("mapstate", mapState, "onViewPortChange", this._updateScale);
                        coordinateViewerWidget.set("scale", mapState.getViewPort().getScale());
                    }
                },

                _transform: function () {
                    var hemispheres = this._i18n.get().hemispheres;
                    var decimalPlaces = this._decimalPlaces;
                    if (this.p && this._coordinateViewerWidget) {
                        this.timer = undefined;
                        var latLonPoint;
                        // transform here
                        var coordinateTransformer = this._coordinateTransformer;
                        if (this._properties.transformSrs && coordinateTransformer) {
                            ct_lang.hasProp(this._properties, "targetSrs", true,
                                "Property 'targetSrs' not defined!");
                            latLonPoint = coordinateTransformer.transform(this.p,
                                this._properties.targetSrs);
                        } else {
                            latLonPoint = this.p;
                        }
                        var lonString = this._useDegreeFormat ? LatLon.parse(latLonPoint.x, {
                            hemispheres: hemispheres,
                            decimalPlaces: decimalPlaces
                        }).asDegree() : latLonPoint.x + "";
                        var latString = this._useDegreeFormat ? LatLon.parse(latLonPoint.y, {
                            latitudeFirst: true,
                            hemispheres: hemispheres,
                            decimalPlaces: decimalPlaces
                        }).asDegree() : latLonPoint.y + "";
                        var pattern = /0*/;
                        this._coordinateViewerWidget.set("coords", lonString.replace(pattern, ""),
                            latString.replace(pattern, ""));

                        if (this._properties.showLambertCoordinates) {
                            var lambertPoint = coordinateTransformer.transform(this.p,
                                this._properties.lambertSrs);
                            var xString = lambertPoint.x;
                            var yString = lambertPoint.y;
                            this._coordinateViewerWidget.set("lambertCoords", xString, yString);
                        }
                    }
                }
            }
        )
    }
);