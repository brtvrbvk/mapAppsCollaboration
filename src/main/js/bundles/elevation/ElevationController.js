/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 25.02.14.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/_base/Deferred",
        "dojo/io-query",
        "ct/Stateful",
        "ct/_Connect",
        "ct/array",
        "ct/mapping/edit/Highlighter",
        "ct/_when",
        "esri/geometry/mathUtils",
        "esri/geometry/Polyline",
        "base/analytics/AnalyticsConstants"
    ],
    function (
        declare,
        d_lang,
        d_array,
        Deferred,
        ioQuery,
        Stateful,
        Connect,
        ct_array,
        Highlighter,
        ct_when,
        e_mathUtils,
        Polyline,
        AnalyticsConstants
        ) {
        return declare([
                Stateful,
                Connect
            ],
            {
                DEFAULT_SRS: "31370",
                _resetZoom: true,
                KEY: "heightProfile",
                EMPTY_TYPE: [],
                NAME: "Hoogteprofiel",
                DATAFORM_ELEMENT: [
                    {
                        "type": "checkbox",
                        "disabled": true,
                        "label": "Hoogteprofiel",
                        "field": "print.heightProfile"
                    }
//                    ,{
//                    "type":"label",
//                    "value":"Hoogteprofiel"
//                }
                ],

                constructor: function () {

                },

                activate: function () {

                    this.i18n = this._i18n.get();

                    this._eventService.postEvent("ct/tool/set/ACTIVATE", {id: "elevationSampleLowTool"});
                    this._eventService.postEvent("ct/tool/set/HIDE", {id: "elevationRestoreTool"});
                    this.samples = this.sampleRates.low;

                    this._chartHoverHandle = this.elevationWidget.on("chartHover", d_lang.hitch(this,
                        this._chartHover));
                    this._chartZoomHandle = this.elevationWidget.on("chartZoom",
                        d_lang.hitch(this, this._chartZoom));
                    this._chartPanHandle = this.elevationWidget.on("chartPan",
                        d_lang.hitch(this, this._chartZoom));

                    this.connect("tool", this.elevationToggleTool, "onActivate", function () {
                        if (this.elevationPolylineTool) {
                            this.elevationPolylineTool.set("active", true);
                            this.connect("mapHover", this._mapState, "onMouseMove", this, this._mapHover);
                        }
                    });
                    this.connect("tool", this.elevationToggleTool, "onDeactivate", function () {
                        if (this.elevationPolylineTool) {
                            this.elevationPolylineTool.set("active", false);
                            this.disconnect("mapHover");
                        }
                    });

                    this.connect("render", this.drawStateController, "onNewGeometryPart", this,
                        this.queryElevation);

                },

                deactivate: function () {

                    this.disconnect();
                    if (this._chartHoverHandle) {
                        this._chartHoverHandle.remove();
                    }
                    if (this._chartZoomHandle) {
                        this._chartZoomHandle.remove();
                    }

                },

                _chartZoom: function (evt) {

                    if (!evt) {
                        var axis = this.elevationWidget.profileChart.getAxis("x");
                        var scaler = axis.getScaler();
                        evt = {
                            lower: scaler.bounds.from,
                            upper: scaler.bounds.to
                        };
                    }
                    var data = this._data.elevationResults;
                    data.reverse();
                    var lower = ct_array.arrayFirstIndexOf(data, "(x <= " + evt.lower + ")");
                    lower = data.length - lower - 1;
                    data.reverse();
                    var upper = ct_array.arrayFirstIndexOf(data, "(x >= " + evt.upper + ")") + 1;
                    var tmp = data.slice(lower, upper);
                    var geoms = d_array.map(tmp, function (elem) {
                        return [
                            elem.geometry.x,
                            elem.geometry.y
                        ];
                    }, this);
                    var p = new Polyline({
                        spatialReference: this._mapState.getExtent().spatialReference,
                        paths: [geoms]
                    });
                    this._eventService.postEvent("ct/elevation/selection/SELECT_PART", {geometry: p});

                },

                _chartHover: function (evt) {
                    var item = evt.item;
                    var point = ct_array.arraySearchFirst(this._data.elevationResults, {x: item.x});
                    if (point) {
                        this._showHighlighter(point);
                    }
                },

                _mapHover: function (evt) {
                    if (this._mapHoverTimer) {
                        return;
                    }
                    this._mapHoverTimer = setTimeout(d_lang.hitch(this, function () {
                        this._mapHoverTimer = null;
                        if (this._data && this._data.elevationResults) {
                            this._d = undefined;
                            var matchedPoint;
                            d_array.forEach(this._data.elevationResults, function (data) {
                                var d = e_mathUtils.getLength(data.geometry, evt.mapPoint);
                                if (!this._d || this._d > d) {
                                    matchedPoint = data;
                                    this._d = d;
                                }
                            }, this);
                            if (matchedPoint) {
                                this._showHighlighter(matchedPoint);
                                evt.item = matchedPoint;
                                this.elevationWidget.updateMouseIndicator(evt);
                            }
                        }

                    }), 50);
                },

                _showHighlighter: function (point) {
                    if (!this._highlighter) {
                        this._highlighter = new Highlighter({
                            mapModel: this._mapModel
                        });
                        this._highlighter._highlighterPaneID = this._highlighter._highlighterPaneID + "_IGNORE_ALL";
                    } else {
                        this._highlighter.clear();
                    }
                    this._highlighter.highlight(point.geometry);
                },

                onNewGeometry: function (evt) {
                },

                _checkIfDataIsValid: function (resp) {
                    var allElevationResults = resp.allElevationResults;
                    return d_array.every(allElevationResults, function (elevationResult) {
                        return elevationResult.y === -9999 || elevationResult.y === -9999.9;
                    });

                },

                queryElevation: function (geom) {
                    var geometry = (geom && (geom.graphic && geom.graphic.geometry)) || this._currentGeometry;
                    if (geometry) {
                        this._currentGeometry = geometry;
                        if (!geometry.paths || geometry.paths.length === 0) {
                            this.elevationWidget.showMessage({
                                type: "error",
                                "msg": this.i18n.ui.messages["400"]
                            });
                            return;
                        }
                        var points = geometry.paths[0];
                        if (points.length === 1) {
                            return;
                        }
                        this._eventService.postEvent("agiv/elevation/loading/START");
//                        this.elevationWidget.showMessage({
//                            type: "loading",
//                            "msg": this.i18n.ui.messages.loading
//                        });
                        ct_when(this._queryElevation({geometry: geometry}), function (resp) {
                            this._eventService.postEvent("agiv/elevation/loading/END");
                            var invalid = this._checkIfDataIsValid(resp);
                            if (invalid) {
                                this._clearHighlightingAndChart();
                                this.elevationWidget.showMessage({
                                    type: "error",
                                    "msg": this.i18n.ui.messages.noData
                                });
                                return;
                            }
                            this._delegateNewData(resp);
                            this._chartZoom();
                            this.elevationWidget.clearMessages();
                        }, function (err) {
                            this._eventService.postEvent("agiv/elevation/loading/END");
                            this._fromRouting = false;
                            if (err && err.error) {
                                this.elevationWidget.clearMessages();
                                var resp = JSON.parse(err.error.responseText);

                                var validationErrors = resp.ValidationErrors;
                                var msg = "";
                                d_array.forEach(validationErrors, function (validationError) {
                                    if (validationError.ErrorCode === "99") {
                                        msg = this.i18n.ui.messages.outsideFlanders;
                                        return;
                                    }
                                }, this);
                                this._clearHighlightingAndChart();
                                this.elevationWidget.showMessage({
                                    type: "error",
                                    "msg": msg === "" ? this.i18n.ui.messages["400"] : msg
                                });
                            }
                        }, this);
                    } else {
                        console.log("Elevation Controller: no data for elevation widget");
                        this._fromRouting = false;
                    }
                },

                _delegateNewData: function (data) {
                    if (!this._data) {
                        this.DATAFORM_ELEMENT[0].disabled = false;
                        this._eventService.postEvent("agiv/printing/UPDATE_DIALOG");
                    }
                    this._data = data;
                    this.elevationWidget.displayProfileChart(data, this._resetZoom);
                    this._resetZoom = true;
                    if (!this.elevationToggleTool.get("active")) {
                        this.elevationToggleTool.set("active", true);
                    }
                    if (this._fromRouting) {
                        this._eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                            eventType: AnalyticsConstants.EVENT_TYPES.ELEVATION_ROUTE,
                            eventCategory: AnalyticsConstants.CATEGORIES.ELEVATION,
                            eventValue: ""
                        });
                    } else {
                        this._eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                            eventType: AnalyticsConstants.EVENT_TYPES.ELEVATION,
                            eventCategory: AnalyticsConstants.CATEGORIES.ELEVATION,
                            eventValue: ""
                        });
                    }
                    this._fromRouting = false;
                },

                readPrintData: function (opts) {
                    if (this._data && this._data.elevationResults) {
                        var upperY = -10000, upperX = -100000;
                        d_array.forEach(this._data.elevationResults, function (item) {
                            upperY < item.y ? upperY = item.y : upperY = upperY;
                            upperX < item.x ? upperX = item.x : upperX = upperX;
                        }, this);
                        var noDataItems = d_array.map(this._data.noDataResults, function (item) {
                            return{
                                x: item.x,
                                y: upperY
                            }
                        }, this);
                        var items = [], hadNullBefore = false;
                        d_array.forEach(this._data.allElevationResults, function (
                            item,
                            idx
                            ) {

                            var x = upperX > 10000 ? item.x / 1000 : item.x;

                            if (item.y < -9000) {
                                //no value
                                if (idx > 0) {
                                    items.push({
                                        x: items[items.length - 1].x + 0.001,
                                        y: 0
                                    });
                                }
                                items.push({
                                    x: x,
                                    y: 0
                                });
                                hadNullBefore = true;
                            } else {
                                if (hadNullBefore) {
                                    hadNullBefore = false;
                                    items.push({
                                        x: x - 0.001,
                                        y: 0
                                    });
                                }
                                items.push({
                                    x: x,
                                    y: item.y
                                });
                            }

                        }, this);
                        var yAxisOpt = this.elevationWidget.profileChart.getAxis("y").opt;
                        return {
                            heightProfile: [
                                {
                                    coordinates: items,
                                    unit: upperX > 10000 ? "km" : "m",
                                    ymax: yAxisOpt.max,
                                    interval: yAxisOpt.majorTickStep
                                }
                            ]
                        };
                    }
                    return null;
                },

                _queryElevation: function (query) {
                    var geometry = query.geometry;
                    var queryOpts = {
//                        srsin: geometry.spatialReference.wkid || this.inputSrs || this.DEFAULT_SRS,
//                        srsout: this.targetSrs || this.DEFAULT_SRS
                    };
                    if (this.samples) {
                        queryOpts["samples"] = this.samples;
                    }
                    var deferred = new Deferred();
                    ct_when(this.elevationStore.query({geometry: geometry}, queryOpts),
                        function (result) {
                            deferred.resolve(result);
                        }, function (error) {
                            deferred.reject({
                                error: error
                            });
                        }, this);
                    return deferred;
                },

                _clearHighlightingAndChart: function () {
                    this._data = null;
                    if (this._highlighter) {
                        this._highlighter.clear();
                    }
                    this.elevationWidget.clearProfileChart();
                    this._eventService.postEvent("ct/elevation/selection/CLEAR");
                },

                _windowClose: function () {
                    if (this.clearDiagramOnClose) {
                        this._clear();
                    } else {
                        if (this._highlighter) {
                            this._highlighter.clear();
                        }
                    }
                },

                _clear: function () {
                    this._currentGeometry = null;
                    this._clearHighlightingAndChart();
                    if (this.geometryRenderer) {
                        this.geometryRenderer.clearGraphics(true);
                    }
                    this._eventService.postEvent("ct/elevation/selection/CLEAR", {});
                    this.DATAFORM_ELEMENT[0].disabled = true;
                    this._eventService.postEvent("agiv/printing/UPDATE_DIALOG");
                },

                _handleUpdateChart: function (evt) {
                    var geom = evt.getProperty("geometry");
                    if (!geom) {
                        this._clearHighlightingAndChart();
                    } else {
                        this.queryElevation(geom);
                    }
                },

                _retrieveElevationInfo: function (evt) {
                    this.elevationToggleTool.set("active", true);
                    this._clear();
                    this._handleUpdateChart(evt);
                },

                _retrieveElevationInfoRoute: function (evt) {
                    this._fromRouting = true;
                    this._retrieveElevationInfo(evt);
                },

                maximize: function (evt) {
                    var tool = evt.tool;
                    this._eventService.postEvent("ct/tool/set/SHOW", {id: "elevationRestoreTool"});
                    this._eventService.postEvent("ct/tool/set/HIDE", {id: "elevationMaximizeTool"});
                    if (tool) {
                        var w = tool.findWindow(evt);
                        this._oldWindowSize = d_lang.clone(w._getPositionBox());
                        if (w) {
                            var cb = w._getViewPort();
                            cb.t = 50;
                            cb.b = 70;
                            cb.h -= (cb.t + cb.b);
                            w.resize(cb);
                        }
                    }

                },
                restore: function (evt) {
                    var tool = evt.tool;
                    this._eventService.postEvent("ct/tool/set/HIDE", {id: "elevationRestoreTool"});
                    this._eventService.postEvent("ct/tool/set/SHOW", {id: "elevationMaximizeTool"});
                    if (tool) {
                        var w = tool.findWindow(evt);
                        if (w) {
                            var cb = w._getViewPort();
                            //because of window base not saving b we need to manually apply the bottom space...
                            this._oldWindowSize.t = cb.h - this._oldWindowSize.h - 45;
                            w.resize(this._oldWindowSize);
                        }
                    }
                },

                activateSampleLow: function () {
                    this.samples = this.sampleRates.low;
                    if (this._currentGeometry) {
                        this._resetZoom = false;
                        this.queryElevation(this._currentGeometry);
                    }
                },

                activateSampleMedium: function () {
                    this.samples = this.sampleRates.medium;
                    if (this._currentGeometry) {
                        this._resetZoom = false;
                        this.queryElevation(this._currentGeometry);
                    }
                },

                activateSampleHigh: function () {
                    this.samples = this.sampleRates.high;
                    if (this._currentGeometry) {
                        this._resetZoom = false;
                        this.queryElevation(this._currentGeometry);
                    }
                }

            }
        );
    }
);