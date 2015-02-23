/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 24.02.14.
 */
define([
    "dojo/Evented",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "ct/array",
    "dojo/on",
    "dojo/aspect",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/Deferred",
    "dojo/_base/array",
    "dojo/number",
    "dijit/registry",
    "dijit/Dialog",
    "dijit/Toolbar",
    "dijit/layout/ContentPane",
    "dijit/form/Button",
    "dijit/form/ToggleButton",
    "put-selector/put",
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/_base/Color",
    "dojo/colors",
    "dojo/fx/easing",
    "dojo/has",
    "base/ui/charting/Chart",
    "dojox/charting/axis2d/Default",
    "dojox/charting/plot2d/Grid",
    "dojox/charting/plot2d/Areas",
//    "./CrossMouseIndicator",
    "base/ui/charting/MouseIndicator",
    "base/ui/charting/MouseZoomAndPan",
    "base/ui/charting/TouchZoomAndPan",
    "base/ui/charting/TouchIndicator",
    "dojox/charting/themes/ThreeD",
    "esri/config",
    "esri/sniff",
    "esri/request",
    "esri/geometry/jsonUtils",
    "esri/geometry/Polyline",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/graphic",
    "esri/tasks/FeatureSet",
    "esri/tasks/LinearUnit",
    "esri/geometry/geodesicUtils",
    "esri/geometry/webMercatorUtils",
    "esri/units",
    "dojo/text!./templates/ElevationWidget.html",
    "ct/ui/controls/MessagePane"
], function (
    Evented,
    _WidgetBase,
    _OnDijitClickMixin,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    ct_array,
    on,
    aspect,
    declare,
    d_lang,
    Deferred,
    array,
    number,
    registry,
    Dialog,
    Toolbar,
    ContentPane,
    Button,
    ToggleButton,
    put,
    domGeometry,
    domStyle,
    domClass,
    Color,
    colors,
    easing,
    d_has,
    Chart,
    Default,
    Grid,
    Areas,
    MouseIndicator,
    MouseZoomAndPan,
    TouchZoomAndPan,
    TouchIndicator,
    ThreeD,
    esriConfig,
    esriSniff,
    esriRequest,
    jsonUtils,
    Polyline,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    Graphic,
    FeatureSet,
    LinearUnit,
    geodesicUtils,
    webMercatorUtils,
    Units,
    templateString
    ) {

    /**
     *  ElevationsProfile
     */
    return declare([
        _WidgetBase,
        _OnDijitClickMixin,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Evented
    ], {

        baseClass: "ctElevationsProfile",
        templateString: templateString,
        chartRenderingOptions: {
            chartTitleFontSize: 13,
            axisTitleFontSize: 11,
            axisLabel: "normal normal bold 9pt Verdana",
            indicatorFontColor: '#eee',
            indicatorFillColor: '#666',
            titleFontColor: '#eee',
            axisFontColor: '#ccc',
            axisMajorTickColor: '#333',
            skyTopColor: "#FFFFFF",
            skyBottomColor: "#FFFFFF",
            waterLineColor: "#eee",
            waterTopColor: "#ADD8E6",
            waterBottomColor: "#FFFFFF",
            elevationLineColor: "#f9c114",
            elevationTopColor: "#fbd837",
            elevationBottomColor: "#fbd837",
            elevationIndicatorLabel: "normal normal bold 9pt Verdana",
            noDataStrokeColor: "#ff0000",
            noDataFillColor: "#FFFFFF"
        },
        _noDataSeries: [],

        constructor: function () {

        },

        resize: function (dim) {
            if (dim) {
                domGeometry.setMarginBox(this.domNode, dim);
                domGeometry.setMarginBox(this._chartNode, dim);
                this._resizeChart();
            }
        },

        postCreate: function () {
            this.inherited(arguments);
            // CHART RENDERING OPTIONS //
            this.own(
                aspect.after(registry.getEnclosingWidget(this.domNode), 'resize',
                    d_lang.hitch(this, this._resizeChart), true)
            );
            this.showMessage(this.i18n.messages.start);
        },

        /**
         *  STARTUP THE DIJIT
         */
        startup: function () {
            this.inherited(arguments);
            if ((!this.esriMap)) {
                this.emit('error', new Error("no map!"));
                this.destroy();
            } else {
                // DIJIT SUCCESSFULLY LOADED //
                this.loaded = true;
                this.emit("load", {});
            }
        },

        /**
         * DISPLAY PROFILE CHART
         *
         * @param geometry
         * @returns {*}
         */
        displayProfileChart: function (
            elevationInfo,
            resetZoom
            ) {
            domClass.remove(this._chartNode, "dijitDisplayNone");
            this._createProfileChart(elevationInfo, resetZoom);
            this.emit("display-profile", elevationInfo);
        },

        clearProfileChart: function () {
            domClass.add(this._chartNode, "dijitDisplayNone");
            this.showMessage(this.i18n.messages.start);
        },

        clearMessages: function () {
            this.messagePane.clearMessages();
        },

        showMessage: function (msg) {
            this.messagePane.clearMessages();
            this.messagePane.addMessage({
                type: msg.type || "info",
                value: msg.msg || msg
            }, true);
        },

        updateMouseIndicator: function (evt) {
            var plot = this.profileChart.getPlot("mouseIndicatorElevationData");
            var item = evt.item;
            item = plot.toPage(item);
            plot.pageCoord = {
                x: item.x,
                y: item.y
            };
            plot.dirty = true;
            this.profileChart.render();
        },

        _onHide: function () {
            this.eventService.postEvent("ct/elevation/WINDOW_HIDDEN");
        },

        _createNoDataPlots: function (
            profileChart,
            nodata
            ) {

            array.forEach(this._noDataSeries, function (nodataplot) {
                profileChart.updateSeries(nodataplot, []);
            }, this);

            array.forEach(nodata, function (
                nodataitems,
                idx
                ) {

                var name = "nodata" + idx,
                    dsName = name + "dataseries";

                var s = profileChart.getSeries(dsName);
                if (s) {
                    profileChart.updateSeries(dsName, nodataitems);
                    return;
                }

                // NoDATA PLOT //
                profileChart.addPlot(name, {
                    type: Areas,
                    tension: "X",
                    markers: false
                });

                // PROFILE DATA //
                profileChart.addSeries(name + "dataseries", nodataitems, {
                    plot: name,
                    stroke: {  width: 2, color: this.chartRenderingOptions.noDataStrokeColor },
                    fill: {
                        type: "linear",
                        space: "plot",
                        x1: 50, y1: 0, x2: 50, y2: 100,
                        colors: [
                            { offset: 0.0, color: this.chartRenderingOptions.noDataFillColor },
                            { offset: 1.0, color: this.chartRenderingOptions.noDataFillColor }
                        ]
                    }
                });

                profileChart.movePlotToFront(name);
                this._noDataSeries.push(dsName);

            }, this);

        },

        /**
         * CREATE PROFILE CHART
         *
         * @param elevationInfo
         * @returns {*}
         * @private
         */
        _createProfileChart: function (
            data,
            resetZoom
            ) {

            this.messagePane.clearMessages();

            // CHART SERIES NAMES //
            var elevationDataSeriesName = "ElevationData";

            this._data = data.elevationResults;
            this._noData = data.noDataResults;

            // MIN/MAX/STEP //
            var yMin = -10.0;
            var yMax = 100.0;
            var yTickStep = 20.0;

            var distance = this._getArrayMax(this._data, "x");
            var yMinSource = this._getArrayMin(this._data, "y");
            var yMaxSource = this._getArrayMax(this._data, "y");
            yMaxSource > 50 ? 0 : yMaxSource = 50;
            var yRange = (yMaxSource - yMinSource);
            yMin = yMinSource;// - (yRange * 0.05);
            yMax = yMaxSource;// + (yRange * 0.05);
            yTickStep = this._adjustYTickStep((yRange / 5.0));
            var xTickStep = Math.round(distance / 5 / 1000) * 1000;

            // ARE WE UPDATING OR CREATING THE CHART //
            if (this.profileChart != null) {

                // UPDATE CHART //
                this.profileChart.getAxis("y").opt.min = yMin;
                this.profileChart.getAxis("y").opt.max = yMax;
                this.profileChart.getAxis("y").opt.majorTickStep = yTickStep;
                this.profileChart.getAxis("x").opt.max = distance;
//                this.profileChart.getAxis("x").opt.majorTickStep = xTickStep;
                this.profileChart.dirty = true;
                this.profileChart.updateSeries(elevationDataSeriesName, this._data);
                this._createNoDataPlots(this.profileChart, this._noData);
                // RENDER CHART //
                this._resizeChart();
                this.profileChart.render();

            } else {

                // MAKE SURE CHART NODE HAS VALID HEIGHT OR CHARTING WILL FAIL //
                var nodeCoords = domGeometry.position(this._chartNode, true);
                if (nodeCoords.h < 1) {
                    domGeometry.setMarginBox(this._chartNode, domGeometry.getMarginBox(this.domNode));
                }

                // CREATE CHART //
                this.profileChart = new Chart(this._chartNode
                );

                // SET THEME //
                this.profileChart.setTheme(ThreeD);

                // OVERRIDE DEFAULTS //
                this.profileChart.fill = 'transparent';
                this.profileChart.theme.axis.stroke.width = 2;
                this.profileChart.theme.axis.majorTick = {
                    color: Color.named.white.concat(0.5),
                    width: 1.0
                };
                this.profileChart.theme.plotarea.fill = {
                    type: "linear",
                    space: "plot",
                    x1: 50, y1: 100, x2: 0, y2: 0,
                    colors: [
                        { offset: 0.0, color: this.chartRenderingOptions.skyTopColor },
                        { offset: 1.0, color: this.chartRenderingOptions.skyBottomColor }
                    ]
                };

                // Y AXIS //
                this.profileChart.addAxis("y", {
                    min: yMin,
                    max: yMax,
                    fontColor: this.chartRenderingOptions.axisFontColor,
                    font: this.chartRenderingOptions.axisLabel,
                    vertical: true,
//                    fixLower: "major",
                    fixUpper: "minor",
                    natural: true,
                    fixed: true,
                    includeZero: true,
                    majorTicks: true,
                    majorTickStep: yTickStep,
                    majorTick: { color: this.chartRenderingOptions.axisMajorTickColor, length: 6 },
                    labelFunc: d_lang.hitch(this, function (
                        label,
                        value
                        ) {
                        return this._getElevationLabel(label, value);
                    }),
                    minorTicks: false
                });

                // X AXIS //
                this.profileChart.addAxis("x", {
                    min: 0,
                    max: distance,
                    fontColor: this.chartRenderingOptions.axisFontColor,
                    font: this.chartRenderingOptions.axisLabel,
//                    fixLower: "none",
//                    fixUpper: "none",
                    includeZero: false,
                    natural: true,
//                    fixed: true,
                    majorTicks: true,
//                    majorTickStep: xTickStep,
                    majorTick: { color: this.chartRenderingOptions.axisMajorTickColor, length: 6 },
                    labelFunc: d_lang.hitch(this, function (
                        label,
                        value
                        ) {
                        return this._getDistanceLabel(label, value, 0);
                    }),
                    minorTicks: false
                });

                // GRID //
                this.profileChart.addPlot("grid", {
                    type: Grid,
                    hMajorLines: false,
                    hMinorLines: false,
                    vMajorLines: false,
                    vMinorLines: false,
                    majorHLine: {
                        color: "#000000"
                    }
                });

                this._createNoDataPlots(this.profileChart, this._noData);

                // PROFIlE PLOT //
                this.profileChart.addPlot("default", {
                    type: Areas,
                    tension: "X",
                    markers: false
                });

                // PROFILE DATA //
                this.profileChart.addSeries(elevationDataSeriesName, this._data, {
                    plot: "default",
                    stroke: {  width: 1.5, color: this.chartRenderingOptions.elevationLineColor },
                    fill: {
                        type: "linear",
                        space: "plot",
                        x1: 50, y1: 0, x2: 50, y2: 100,
                        colors: [
                            { offset: 0.0, color: this.chartRenderingOptions.elevationTopColor },
                            { offset: 1.0, color: this.chartRenderingOptions.elevationBottomColor }
                        ]
                    }
                });

                // MOUSE/TOUCH INDICATOR //
                if (this.elevationIndicator == null) {
                    var elevationIndicatorProperties = {
                        series: elevationDataSeriesName,
                        mouseOver: true,
                        font: this.chartRenderingOptions.elevationIndicatorLabel,
                        fontColor: this.chartRenderingOptions.indicatorFontColor,
                        fill: this.chartRenderingOptions.indicatorFillColor,
                        labelFunc: d_lang.hitch(this, function (obj) {
                            this.emit("chartHover", {
                                item: obj
                            });
                            return this._getElevationLabel('', obj.y,
                                this.decimalPlaces.height) + " " + this._getDistanceLabel("",
                                obj.x,
                                this.decimalPlaces.distance);
                        })
                    };
                    if (d_has("touch")) {
//                        this.elevationIndicator = new TouchIndicator(this.profileChart, "default", elevationIndicatorProperties);
//                        this.zoomInteraction = new TouchZoomAndPan(this.profileChart, "default");
                        this.elevationIndicator = new MouseIndicator(this.profileChart, "default",
                            elevationIndicatorProperties);
                    } else {
                        this.elevationIndicator = new MouseIndicator(this.profileChart, "default",
                            elevationIndicatorProperties);
                        this.zoomInteraction = new MouseZoomAndPan(this.profileChart, "default");
                    }

                    this.profileChart.on("chartZoom", d_lang.hitch(this, function (evt) {
                        this.emit("chartZoom", evt);
                    }));
                    this.zoomInteraction.on("chartPan", d_lang.hitch(this, function (evt) {
                        this.emit("chartPan", evt);
                    }));
                }

                // RENDER CHART //
                try {
                    this.profileChart.fullRender();
                } catch (e) {
                    console.error(e);
                }

            }

            if (resetZoom) {
                this._resetZoom();
            }

        },

        _resetZoom: function () {
            var axis = this.profileChart.getAxis("x");
            var scaler = axis.getScaler();
            this.profileChart.zoomIn("x", [
                scaler.bounds.lower,
                scaler.bounds.upper
            ]);
        },

        /**
         * RESIZE PROFILE CHART
         *
         * @private
         */
        _resizeChart: function () {
            if (this.profileChart) {
                this.profileChart.resize();
            }
        },

        /**
         * X-AXIS LABEL FUNCTION
         *
         * @param {String} label
         * @param {Number} val
         */
        _getDistanceLabel: function (
            label,
            val,
            decimals,
            from,
            to
            ) {
            var displayUnits = this._getDisplayUnits(val < 1000);
            if (from !== undefined) {
                if (displayUnits === Units.METERS) {
                    decimals = to - from < 1000 ? 1 : decimals;
                    decimals = to - from < 500 ? 2 : decimals;
                } else {
                    decimals = to - from < 1000 ? 1 : decimals;
                    decimals = to - from < 500 ? 2 : decimals;
                    decimals = to - from < 250 ? 3 : decimals;
                }
            }
            return this._getDisplayLabel(val, displayUnits, decimals);
        },

        /**
         * Y-AXIS LABEL FUNCTION
         *
         * @param {String} label
         * @param {Number} val
         */
        _getElevationLabel: function (
            label,
            val,
            decimals
            ) {
            var displayUnits = this._getDisplayUnits(true);
            return this._getDisplayLabel(val, displayUnits, decimals);
        },

        /**
         * GET DISPLAY LABEL GIVEN A VALUE IN METERS AND THE DISPLAY UNITS
         * CONVERT FROM METERS TO MILES THEN FROM MILES TO DISPLAY UNITS
         *
         * @param {Number} valueMeters
         * @param {String} displayUnits
         */
        _getDisplayLabel: function (
            valueMeters,
            displayUnits,
            decimals
            ) {
            var displayDistance = this._getDisplayValue(valueMeters, displayUnits);
            return number.format(displayDistance,
                { 'places': decimals || 0 }) + " " + (displayUnits === Units.METERS ? "m" : "km");
        },

        /**
         * GET DISPLAY VALUE GIVEN A VALUE IN METERS AND THE DISPLAY UNITS
         * CONVERT FROM METERS TO MILES THEN FROM MILES TO DISPLAY UNITS
         *
         * @param {Number} valueMeters
         * @param {String} displayUnits
         */
        _getDisplayValue: function (
            valueMeters,
            displayUnits
            ) {
            if (displayUnits === Units.METERS) {
                return valueMeters;
            }
            return valueMeters / 1000;
        },

        /**
         * GET DISPLAY UNITS
         *
         * @param {Boolean} isElevation
         */
        _getDisplayUnits: function (isElevation) {
            if (isElevation) {
                return Units.METERS;
            }
            return Units.KILOMETERS;
        },

        /**
         * ADJUST Y TICK STEP
         *
         * @param yTickStep
         * @returns {*}
         * @private
         */
        _adjustYTickStep: function (yTickStep) {
            var newYTickStep = yTickStep;
            var limits = [
                1000,
                200,
                100,
                10,
                1
            ];
            array.some(limits, function (limit) {
                newYTickStep = ((yTickStep + limit) - ((yTickStep + limit) % limit));
                return (yTickStep > limit);
            });
            return newYTickStep;
        },

        /**
         * CREATE ARRAY OF CERTAIN SIZE WITH CERTAIN VALUE AND ALLOW MULTIPLIER
         * @param size
         * @param value
         * @param asMultiplier
         * @returns {Array}
         * @private
         */
        _getFilledArray: function (
            size,
            value,
            asMultiplier
            ) {
            var dataArray = new Array(size);
            for (var dataIdx = 0; dataIdx < size; ++dataIdx) {
                dataArray[dataIdx] = {
                    x: asMultiplier ? (dataIdx * value) : dataIdx,
                    y: asMultiplier ? 0.0 : (value || 0.0)
                };
            }
            return dataArray;
        },

        /**
         * RESET Y VALUES IN ARRAY
         *
         * @param dataArray
         * @param value
         * @returns {*}
         * @private
         */
        _resetArray: function (
            dataArray,
            value
            ) {
            return array.map(dataArray, function (item) {
                return {
                    x: item.x,
                    y: value
                }
            });
        },

        /**
         * GET MAXIMUM Y VALUE IN ARRAY
         *
         * @param {array} dataArray
         * @return {number}
         * @private
         */
        _getArrayMax: function (
            dataArray,
            type
            ) {
            var values = array.map(dataArray, function (item) {
                return item[type];
            });
            return Math.max.apply(Math, values);
        },

        /**
         * GET MINIMUM Y VALUE IN ARRAY
         *
         * @param {array} dataArray
         * @return {number}
         * @private
         */
        _getArrayMin: function (
            dataArray,
            type
            ) {
            var values = array.map(dataArray, function (item) {
                return item[type];
            });
            return Math.min.apply(Math, values);
        },

        _getArraySum: function (
            dataArray,
            type
            ) {
            var res = 0;
            array.forEach(dataArray, function (item) {
                res += item[type];
            });
            return res;
        }

    });
});



