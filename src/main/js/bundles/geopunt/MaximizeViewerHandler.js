/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/declare",
        "base/analytics/AnalyticsConstants"
    ],
    function (
        declare,
        AnalyticsConstants
        ) {
        return declare([], {

            constructor: function () {
            },

            activate: function () {
                if (!window.postMessage) {
                    this._disabled = true;
                } else {
                    this._parent = window.parent;
                }
            },

            encodeURLParameter: function () {
                if (this.parent_origin) {
                    return {
                        parent_origin: encodeURIComponent(this.parent_origin),
                        maximize: this._maximize || 0
                    };
                }
                return {};
            },

            decodeURLParameter: function (parameterObject) {

                if (parameterObject.parent_origin) {
                    try {
                        this.parent_origin = decodeURIComponent(parameterObject.parent_origin);
                    } catch (e) {
                        console.error("Error while parsing parent origin", e);
                        this._disabled = true;
                    }
                } else {
                    this._disabled = true;
                }
                this._maximize = parameterObject.maximize;
                if (parameterObject.maximize === "1" || parameterObject.maximize === 1) {
                    this.maximizeScreen();
                }

            },

            maximizeScreen: function (event) {

                if (!this._disabled) {
                    this._setTooltipForMinimize(event.tool);

                    var msg = { action: 'resize', params: 'maximize' };
                    this._parent.postMessage(msg, this.parent_origin);
                    console.debug("post message to " + this._parent_origin, msg);
                    if (this._eventService) {
                        this._eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                            eventType: AnalyticsConstants.EVENT_TYPES.RESIZE_MAX,
                            eventCategory: AnalyticsConstants.CATEGORIES.RESIZE,
                            eventValue: ""
                        });
                    }
                }

            },

            minimizeScreen: function (event) {
                if (!this._disabled) {
                    this._setTooltipForMaximize(event.tool);

                    var msg = { action: 'resize', params: 'restore' };
                    this._parent.postMessage(msg, this.parent_origin);
                    console.debug("post message to " + this._parent_origin, msg);
                    if (this._eventService) {
                        this._eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                            eventType: AnalyticsConstants.EVENT_TYPES.RESIZE_MIN,
                            eventCategory: AnalyticsConstants.CATEGORIES.RESIZE,
                            eventValue: ""
                        });
                    }
                }

            },

            _setTooltipForMinimize: function (tool) {
                if (tool) {
                    tool.set("tooltip", tool.minimizeTooltip);
                }
            },

            _setTooltipForMaximize: function (tool) {
                if (tool) {
                    tool.set("tooltip", tool.maximizeTooltip);
                }
            }

        });
    });
