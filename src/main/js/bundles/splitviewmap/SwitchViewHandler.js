define([
        "dojo/_base/declare",
        "ct/Stateful",
        "ct/_Connect",
        "ct/util/css",
        "dojo/_base/html",
        "dojo/dom-class",
        "dojo/dom-geometry",
        "dojo/query",
        "dijit/registry",
        "dojo/dom-style",
        "dojo/window"
    ],
    function (
        declare,
        Stateful,
        _Connect,
        ct_css,
        d_html,
        d_class,
        d_domGeom,
        query,
        registry,
        d_style,
        d_window
        ) {
        /*
         * COPYRIGHT 2011-2012 con terra GmbH Germany
         */

        var SwitchViewHandler = declare([Stateful],
            {
                topics: {
                    DISCONNECT_EVENTS: "agiv/splitview/DISCONNECT_EVENTS",
                    BIND_EVENTS: "agiv/splitview/BIND_EVENTS",
                    SYNC_HISTORIC: "agiv/splitview/SYNC_HISTORIC",
                    SYNC_MAIN: "agiv/splitview/SYNC_MAIN"
                },

                templates: {
                    SPLITVIEW: "splitview",
                    HISTORIC_PRINT: "historicprint"
                },

                constructor: function () {
                    this._listeners = new _Connect();
                    this._isSplit = true;
                },

                activate: function () {
                    this.i18n = this._i18n.get();
                    this._listeners.connect(window, "onresize", this,
                        this._onResizeWindow);
                    this._switchHiddenSlider(".mainMap", true);
                },

                _switchHiddenSlider: function (
                    cssClass,
                    hidden
                    ) {
                    var slider = query(cssClass + " .esriLargeSlider")[0];
                    ct_css.switchHidden(slider, hidden);
                    var extentTool = query(cssClass + " .toExtentToolButton")[0];
                    if (extentTool)
                        ct_css.switchHidden(extentTool, hidden);
                },

                switchSlider: function (evt) {
                    var templateName = evt.getProperty("name");
                    if (templateName === this.templates.SPLITVIEW) {
                        this._switchHiddenSlider(".mainMap", true);
                        this._switchHiddenSlider(".doubleMap", false);
                    }
                    if (templateName === this.templates.HISTORIC_PRINT) {
                        this._switchHiddenSlider(".mainMap", true);
                        this._switchHiddenSlider(".doubleMap", true);
                    }
                },

                swipeLeft: function () {
                    this._isSplit = false;
                    this._isRight = false;
                    this._eventService.postEvent(this.topics.DISCONNECT_EVENTS);

                    var doubleMapNode = query(".doubleMap")[0];
                    d_style.set(doubleMapNode, "width", 0 + "px");

                    var fullWidth = d_window.getBox().w;
                    var splitter = query(".separator")[0];
                    var splitterWidth = d_style.get(splitter, "width");

                    d_style.set(splitter, "left", "0px");

                    var mainMapNode = registry.byId("mainMapNode");
                    d_style.set(mainMapNode.domNode, "width",
                            fullWidth - splitterWidth + "px");
                    d_style.set(mainMapNode.domNode, "left", splitterWidth + "px");
                    mainMapNode.resize();

                    this._switchHiddenSlider(".mainMap", false);

                    this._eventService.postEvent(this.topics.BIND_EVENTS);
                    this.rightTool._tooltip.set("label", this.i18n.splitViewTooltip);
                    this.leftTool._tooltip.set("label", this.i18n.splitViewTooltip);
                },

                swipeRight: function () {
                    this._isSplit = false;
                    this._isRight = true;
                    this._eventService.postEvent(this.topics.DISCONNECT_EVENTS);

                    var mainMapNode = query(".mainMap")[0];
                    d_style.set(mainMapNode, "width", 0 + "px");

                    var fullWidth = d_window.getBox().w;
                    var splitter = query(".separator")[0];
                    var splitterWidth = d_style.get(splitter, "width");

                    d_style.set(splitter, "left", fullWidth - splitterWidth + "px");

                    var doubleMapNode = registry.byId("doubleMapNode");
                    d_style.set(doubleMapNode.domNode, "width",
                            fullWidth - splitterWidth + "px");
                    doubleMapNode.resize();

                    this._eventService.postEvent(this.topics.BIND_EVENTS);
                    this.rightTool._tooltip.set("label", this.i18n.splitViewTooltip);
                    this.leftTool._tooltip.set("label", this.i18n.splitViewTooltip);
                },

                _splitScreen: function () {
                    this._isSplit = true;

                    var fullWidth = d_window.getBox().w;
                    var splitter = query(".separator")[0];
                    if (splitter) {
                        var splitterWidth = d_style.get(splitter, "width");
                        var panelWidth = Math.round((fullWidth / 2) - (splitterWidth / 2));
                        d_style.set(splitter, "left", panelWidth + "px");
                        d_style.set(splitter, "height", "100%");
                        var mainMapNode = registry.byId("mainMapNode");
                        if (mainMapNode) {
                            d_style.set(mainMapNode.domNode, "width", panelWidth + "px");
                            d_style.set(mainMapNode.domNode, "left",
                                    (fullWidth / 2) + (splitterWidth / 2) + "px");
                            mainMapNode.resize();
                        }

                        var doubleMapNode = registry.byId("doubleMapNode");
                        if (doubleMapNode) {
                            d_style.set(doubleMapNode.domNode, "width",
                                    panelWidth + "px");
                            doubleMapNode.resize();
                        }
                    }

                    this._switchHiddenSlider(".mainMap", true);
                },

                syncResize: function () {

                    if (this._isSplit) {
                        this.syncLeft();
                    } else {
                        if (this._isRight) {
                            this.swipeRight();
                        } else {
                            this.swipeLeft();
                        }
                    }

                },

                syncLeft: function (evt) {
                    this.rightTool._tooltip.set("label", this.i18n.swipeRightTooltip);
                    this.leftTool._tooltip.set("label", this.i18n.swipeLeftTooltip);
                    this._splitScreen();
                    this._eventService.postEvent(this.topics.SYNC_HISTORIC);
                },

                syncRight: function (evt) {
                    this.rightTool._tooltip.set("label", this.i18n.swipeRightTooltip);
                    this.leftTool._tooltip.set("label", this.i18n.swipeLeftTooltip);
                    this._splitScreen();
                    this._eventService.postEvent(this.topics.SYNC_MAIN);
                },

                _onResizeWindow: function () {
                    if (this._isSplit) {
                        this._splitScreen();
                    } else {
                        var splitter = query(".separator")[0];
                        var splitterPos = d_style.get(splitter, "left");
                        var splitterWidth = d_style.get(splitter, "width");
                        var fullWidth = d_window.getBox().w;
                        if (splitterPos > 0) {
                            // if splitter is on the right side, adjust the new position
                            d_style.set(splitter, "left",
                                    fullWidth - splitterWidth + "px");
                            var doubleMapNode = registry.byId("doubleMapNode");
                            d_style.set(doubleMapNode.domNode, "width",
                                    fullWidth - splitterWidth + "px");
                            doubleMapNode.resize();
                            this._eventService.postEvent(this.topics.SYNC_MAIN);
                        } else {
                            // if splitter is on the left side, resize the mainMap
                            var mainMapNode = registry.byId("mainMapNode");
                            d_style.set(mainMapNode.domNode, "width",
                                    fullWidth - splitterWidth + "px");
                            mainMapNode.resize();
                            this._eventService.postEvent(this.topics.SYNC_HISTORIC);
                        }
                    }
                },

                deactivate: function () {
                    this._listeners.disconnect();
                }

            });

        return SwitchViewHandler;
    });