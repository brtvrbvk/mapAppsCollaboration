/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
define([
        "dojo/_base/declare",
        "ct/_Connect",
        "ct/array",
        "base/analytics/AnalyticsConstants"
    ],
    function (
        declare,
        Connect,
        ct_array,
        AnalyticsConstants
        ) {
        return declare([], {

            constructor: function () {
                this._listeners = new Connect();
            },

            _trackOnBasemapSelected: function (evt) {
                var baseLayers = this.mapModel.getBaseLayer().children;
                var selectedLayer = ct_array.arraySearchFirst(baseLayers, {
                    "enabled": true
                }).get("id");
                if (this._oldLayer && this._oldLayer != selectedLayer) {
                    this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                        eventType: this._eventType || AnalyticsConstants.EVENT_TYPES.SELECT_BASEMAP,
                        eventCategory: AnalyticsConstants.CATEGORIES.BASEMAP,
                        eventValue: evt.basemap.title
                    });
                }
                this._oldLayer = selectedLayer;
            },

            setBasemapModel: function (basemapModel) {
                this._listeners.connect("trackEvents", basemapModel, "onBasemapSelected", this,
                    "_trackOnBasemapSelected");
            },

            setMeasurementTool: function (measurementTool) {
                this._listeners.connect("trackEvents", measurementTool, "onActivate", this,
                    "_trackOnMeasureSelected");
            },

            setAgivMapModel: function (agivMapModel) {
                // change event to splitviewmap event
                this._eventType = AnalyticsConstants.EVENT_TYPES.BASEMAP_RIGHT;
            },

            _trackOnMeasureSelected: function (evt) {
                this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                    eventType: AnalyticsConstants.EVENT_TYPES.MEASURE,
                    eventCategory: AnalyticsConstants.CATEGORIES.TOOLBOX,
                    eventValue: "measurement tool"
                });
            },

            _onMeasureEnd: function (type) {

                var event;

                switch (type) {
                    case "distance":
                        event = AnalyticsConstants.EVENT_TYPES.MEASURE_DISTANCE;
                        break;
                    case "area":
                        event = AnalyticsConstants.EVENT_TYPES.MEASURE_AREA;
                        break;
                    default:
                        event = AnalyticsConstants.EVENT_TYPES.MEASURE_POINT;
                        break;
                }

                this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                    eventType: event,
                    eventCategory: AnalyticsConstants.CATEGORIES.MEASURE,
                    eventValue: ""
                });

            },

            deactivate: function () {
                this._listeners.disconnect();
            }

        });
    });
