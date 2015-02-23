/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/declare",
        "dojo/query",
        "dojo/dom-class",
        "dojo/_base/lang",
        "dojo/_base/array",
        "./LeftClickMenu",
        "dijit/MenuItem",
        "ct/_Connect",
        "ct/_when",
        "ct/request",
        "ct/Stateful",
        "ct/Exception",
        "ct/async",
        "base/analytics/AnalyticsConstants",
        "esri/geometry/jsonUtils",
        "esri/toolbars/edit",
        "./PrintedRoutingResultWidget"
    ],

    function (
        declare,
        query,
        domClass,
        lang,
        d_array,
        Menu,
        MenuItem,
        Connect,
        ct_when,
        ct_request,
        Stateful,
        Exception,
        ct_async,
        AnalyticsConstants,
        e_geometryUtils,
        EditToolbar,
        PrintedRoutingResultWidget
        ) {

        var illegalArgumentError = Exception.illegalArgumentError;

        var RoutingController = declare([
            Connect,
            Stateful
        ], {

            topics: {
                CALC_ROUTE_START: "ct/agivrouting/CALC_ROUTE_START",
                CALC_ROUTE_END: "ct/agivrouting/CALC_ROUTE_END"
            },

            activate: function () {
                this.connect("tool", this._tool, "onActivate", function () {
                    if (this._menuTool) {
                        ct_async.hitch(this, function () {
                            this._menuTool.set("active", true);
                        }, 25)();
                    }
                });
                this.connect("tool", this._tool, "onDeactivate", function () {
                    if (this._menuTool) {
                        ct_async.hitch(this, function () {
                            this._menuTool.set("active", false);
                        }, 25)();

                    }
                });
                this.connect("tool", this.routingwidget, "onDndMouseUp",
                    lang.hitch(this, function (evt) {
                        this._geocodeItem(evt.target,
                            lang.hitch(this, function (resp) {
                                if (resp.length >= 1) {
                                    this.routingwidget._fillTargetBox(resp[0],
                                        evt.index);
                                }
                            }));
                    }));
                if (!this.router) {
                    throw illegalArgumentError("No router found!");
                }
                var d = ct_request.requestJSON({
                    url: this._properties.geometry
                });
                ct_when(d, function (response) {
                    this.geometry = e_geometryUtils.fromJson(response);
                    //                    var test = {
                    //                        geometry: this.geometry,
                    //                        attributes: {}
                    //                    }
                    //                    this.renderer._renderer.draw(test);
                }, function (error) {
                    console.error(error);
                }, this);
                this.connect("mapMouseMove", this.map, "onMouseMove",
                    function (evt) {
                        var graphic = evt.graphic;
                        if (graphic && graphic !== this._currentGraphic && !this.dndActiv &&
                            graphic.symbol && graphic.symbol.type === "picturemarkersymbol" && graphic.attributes &&
                            graphic.attributes.type === "ROUTING") {
                            this._currentGraphic = graphic;
                            this.activateEditToolbar(graphic);
                        } else if (graphic && graphic.attributes && graphic.attributes.type === "ROUTING" && !this.dndActiv &&
                            graphic.symbol.type !== "picturemarkersymbol") {
                            this._drawNeutralMarker(evt);
                        }
                    });
                this._connectGraphics();
            },

            _geocodeItem: function (
                point,
                doit
                ) {
                this._broadCast("agiv/routing/loading/START", {});
                var tp = this.transformer.transform(point, 4326);
                var options = {
                    count: 1
                };
                var query = {
//                    title: {
                    $suggest: tp.y + "," + tp.x
//                    }
                };
                var result;
                //                if (!this.geometry.contains(point) && this.secondaryGeocoder) {
                result = this.geocoderStore.query(query, options);
                //                } else {
                //                    result = this.primaryGeocoder.query(query,options);
                //                }
                ct_when(result, doit, lang.hitch(this, function (error) {
                    var errorString;
                    this._broadCast("agiv/routing/loading/END", {});
                    if (error.dojoType == "timeout") {
                        errorString = "timeout exceeded";
                    } else {
                        errorString = error.responseText;
                    }
                    this.logger.error(this._i18n.get().error, errorString);
                    this.routingwidget.recalculateRoute(false);
                    this._broadCast(this.topics.CALC_ROUTE_END, {});
                }));
            },

            startRouting: function (evt) {
                if (evt.targets.length < 2) {
                    return;
                }
                var length = evt.targets.length;
                if (evt.transportMode != "car") {
                    length++;
                }
                if (evt.type != "fastest") {
                    length++;
                }
                this.routingwidget.setRequestParamLength(length);
                this._geocodeItem(evt.targets[0].geometry,
                    lang.hitch(this, function (resp) {
                        if (resp.length >= 1) {
                            this.routingwidget.fillFirstTargetBox(resp[0],
                                true);
                        }
                    }));

                this._geocodeItem(evt.targets[1].geometry,
                    lang.hitch(this, function (resp) {
                        if (resp.length >= 1) {
                            this.routingwidget.fillLastTargetBox(resp[0],
                                true);
                        }
                    }));
                //the first 2 points will be set regularlly,
                //if there are more than 2 points, they will be added afterwards as new points
                if (evt.targets.length > 2) {
                    for (var i = 2; i < evt.targets.length; i++) {
                        var scope = {
                            index: i
                        };
                        lang.mixin(scope, this);
                        this._geocodeItem(evt.targets[i].geometry,
                            lang.hitch(scope, function (resp) {
                                if (resp.length >= 1) {
                                    this.routingwidget.fillNewTargetBox(resp[0],
                                        true,
                                        this.index);  // index is required to maintain order
                                }
                            }));
                    }
                }

                if (evt.transportMode != "car") {
                    this.routingwidget.setTransportMode(evt.transportMode);
                }
                if (evt.type != "fastest") {
                    this.routingwidget.setType(evt.type);
                }
                this._tool.set("active", true);
            },

            getRoutingInfo: function () {
                return this.routingwidget.getRoutingInfo();
            },

            _onCalculateRoute: function (evt) {
                if (!evt.targets) {
                    throw illegalArgumentError("No targets found!");
                }
                this._broadCast("agiv/routing/loading/START", {});
                if (evt.targets.length > 1) {
                    var d = this.router.route(evt);
                    ct_when(d, function (resp) {
                        this._broadCast("agiv/routing/loading/END", {});
                        if (resp && resp.routes) {
                            this.routingwidget.set("routingresult", resp);
                            this.renderer.drawRoute(resp.routes[0], evt.zoom);
                            this.renderer.drawMarkers(evt.targets);
                            this.lastResult = resp;

                            if (!this._hasRoute) {
                                this._broadCast("agiv/routing/UPDATE_PRINT_INFO", {hasRoute: true});
                                this._hasRoute = true;
                            }

                        } else if (resp && resp.type === "ApplicationError") {
                            this.routingwidget.set("error", resp);
                            this.renderer.clear();
                            this.renderer.drawMarkers(evt.targets);
                        } else {
                            this._broadCast(this.topics.CALC_ROUTE_END, {});
                            this.renderer.drawRoute(this.lastResult.routes[0],
                                false);
                        }
                        var eventType = AnalyticsConstants.EVENT_TYPES["TRANSPORT_" + evt.transportMode.toUpperCase()];
                        this._fireTrackEvent(this._getRouteNames(evt.targets),
                            eventType);
                    }, function (err) {
                        this._broadCast(this.topics.CALC_ROUTE_END, {});
                        this._broadCast("agiv/routing/loading/END", {});
                        this.renderer.drawRoute(this.lastResult.routes[0], false);
                    }, this);
                } else {
                    this.renderer.clear();
                    this.renderer.drawMarkers(evt.targets);
                    this._broadCast("agiv/routing/loading/END", {});
                }
            },

            getPrintedRoutingWidget: function () {
                if (!this._printedroutingwidget || this._printedroutingwidget._destroyed) {
                    var printedroutingwidget = this._printedroutingwidget = new PrintedRoutingResultWidget({
                        i18n: this._i18n
                    });
                    printedroutingwidget.set("routingresult",
                        this.routingwidget.getRoutingResultInfo());
                    return printedroutingwidget;
                }
            },

            _getRouteNames: function (targets) {
                var route = "";
                var targetsNum = targets.length;
                d_array.forEach(targets, function (
                    target,
                    index
                    ) {
                    route = route + (index + 1) + ": " + (target.FormattedAddress || target.title);
                    if (index + 1 != targetsNum) {
                        route = route + " / ";
                    }
                });
                return route;
            },

            _fireTrackEvent: function (
                value,
                eventType
                ) {
                this._eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                    eventType: eventType,
                    eventCategory: AnalyticsConstants.CATEGORIES.ROUTE,
                    eventValue: value
                });
            },

            _onClearRoute: function (evt) {
                this.renderer.clear();
                this.routingwidget.set("routingresult", []);
                this._broadCast("agiv/routing/UPDATE_PRINT_INFO", {hasRoute: false});
                this._hasRoute = false;
            },

            _updateDirection: function (
                direction,
                index,
                byClick
                ) {
                this.routingwidget.updateTargetBox(direction, index, byClick);
                this._broadCast(this.topics.CALC_ROUTE_END, {});
            },

            _addFromDirection: function (
                direction,
                byClick
                ) {
                if (direction.FormattedAddress || direction.title) {
                    this.routingwidget.fillFirstTargetBox(direction, byClick);
                    this._broadCast(this.topics.CALC_ROUTE_END, {});
                } else {
                    //we need to geocode
                    this._geocodeItem(direction, lang.hitch(this, function (resp) {
                        if (resp.length >= 1) {
                            this.routingwidget.fillFirstTargetBox(resp[0], true);
                        }
                        this._broadCast(this.topics.CALC_ROUTE_END, {});
                    }));
                }
            },

            _addToDirection: function (
                direction,
                byClick
                ) {
                if (direction.FormattedAddress || direction.title) {
                    this.routingwidget.fillLastTargetBox(direction, byClick);
                    this._broadCast(this.topics.CALC_ROUTE_END, {});
                } else {
                    //we need to geocode
                    this._geocodeItem(direction, lang.hitch(this, function (resp) {
                        if (resp.length >= 1) {
                            this.routingwidget.fillLastTargetBox(resp[0], true);
                        }
                        this._broadCast(this.topics.CALC_ROUTE_END, {});
                    }));
                }
            },

            _addNewDirection: function (
                direction,
                byClick
                ) {
                if (direction.FormattedAddress || direction.title) {
                    this.routingwidget.fillNewTargetBox(direction, byClick);
                    this._broadCast(this.topics.CALC_ROUTE_END, {});
                } else {
                    //we need to geocode
                    this._geocodeItem(direction, lang.hitch(this, function (resp) {
                        if (resp.length >= 1) {
                            this.routingwidget.fillNewTargetBox(resp[0], true);
                        }
                        this._broadCast(this.topics.CALC_ROUTE_END, {});
                    }));
                }
            },

            _openwidget: function () {
                // start loader
                this._broadCast(this.topics.CALC_ROUTE_START, {});
                this._tool.set("active", true);
            },

            _createMenu: function () {
                if (this.pMenu) {
                    return;
                }
                this.mapNode = query(".mainMap")[0].id;
                this.pMenu = new Menu({
                    targetNodeIds: [this.mapNode],
                    mapState: this._mapState
                });
                domClass.add(this.pMenu.domNode, "ctRoutingPopup");
                var i18n = this._i18n.get();
                // start menu item
                var start = new MenuItem({
                    label: i18n.ui.contextMenu.start,
                    onClick: lang.hitch(this, function () {
                        this._openwidget();
                        if (this.pMenu.mapPoint) {
                            this._geocodeItem(this.pMenu.mapPoint,
                                lang.hitch(this,
                                    function (resp) {
                                        if (resp.length >= 1) {
                                            this._addFromDirection(resp[0],
                                                true);
                                        }
                                    }));
                            this.pMenu.mapPoint = null;
                        }
                    })
                })
                this.pMenu.addChild(start);
                // end menu item
                var end = new MenuItem({
                    label: i18n.ui.contextMenu.end,
                    onClick: lang.hitch(this, function () {
                        this._openwidget();
                        if (this.pMenu.mapPoint) {
                            this._geocodeItem(this.pMenu.mapPoint,
                                lang.hitch(this,
                                    function (resp) {
                                        if (resp.length >= 1) {
                                            this._addToDirection(resp[0],
                                                true);
                                        }
                                    }));
                            this.pMenu.mapPoint = null;
                        }
                    })
                })
                this.pMenu.addChild(end);
                // add direction
                var addDir = new MenuItem({
                    label: i18n.ui.contextMenu.newPoint,
                    onClick: lang.hitch(this, function () {
                        this._openwidget();
                        if (this.pMenu.mapPoint) {
                            this._geocodeItem(this.pMenu.mapPoint,
                                lang.hitch(this,
                                    function (resp) {
                                        if (resp.length >= 1) {
                                            this._addNewDirection(resp[0],
                                                true);
                                        }
                                    }));
                            this.pMenu.mapPoint = null;
                        }
                    })
                })
                this.pMenu.addChild(addDir);
            },

            _broadCast: function (
                topic,
                evtObj
                ) {
                console.debug("RoutingController post event " + topic);
                this._eventService.postEvent(topic, evtObj);
            },

            _destroyMenu: function () {
                if (this.pMenu) {
                    this.pMenu.destroy();
                    this.pMenu = null;
                }
            },

            createFromDirection: function (item) {
                if (item._properties && item._properties.entries && item._properties.entries.event_properties) {
                    this._openwidget();
                    this._addFromDirection(item._properties.entries.event_properties);
                }
            },

            createToDirection: function (item) {
                if (item._properties && item._properties.entries && item._properties.entries.event_properties) {
                    this._openwidget();
                    this._addToDirection(item._properties.entries.event_properties);
                }
            },

            createNewDirection: function (item) {
                if (item._properties && item._properties.entries && item._properties.entries.event_properties) {
                    this._openwidget();
                    this._addNewDirection(item._properties.entries.event_properties);
                }
            },

            createRouteDirection: function (item) {
                var targetBoxes = this.getRoutingInfo().items;
                if (!targetBoxes[0].get("item")) {
                    this.createFromDirection(item);
                } else if (!targetBoxes[1].get("item")) {
                    this.createToDirection(item);
                } else {
                    this.createNewDirection(item);
                }
            },

            activateEditToolbar: function (graphic) {
                try {
                    this._editToolbar.activate(EditToolbar.MOVE, graphic);
                    this.connect("moveStart", this._editToolbar,
                        "onGraphicMoveStart", function (evt) {
                            this.dndActiv = true;
                        });
                    this.connect("moveStop", this._editToolbar, "onGraphicMoveStop",
                        function (evt) {
                            this.dndActiv = false;
                            var index = evt.symbol.index;
                            this._geocodeItem(evt.geometry, lang.hitch(this,
                                function (resp) {
                                    if (resp.length >= 1) {
                                        this._updateDirection(resp[0],
                                            index,
                                            true);
                                    }
                                }));
                            this.disconnect("moveStop");
                            this._currentGraphic = null;
                        });
                } catch (e) {
                    var i18n = this._i18n.get().ui;
                    var msg = (i18n.error && i18n.error.activation) ? i18n.error.activation : "Activation error";
                    if (this._logger) {
                        this._logger.error(msg, e);
                    }
                    console.error("ct.bundles.editingtoolset.GraphicEditor: " + msg,
                        e);
                }
            },

            setMenutool: function (tool) {
                this._menuTool = tool;
            },

            unsetMenutool: function (tool) {
                this._menuTool = null;
            },

            enable: function (evt) {
                this._createMenu();
                if (!this._editToolbar) {
                    this._editToolbar = new EditToolbar(this.map);
                }
            },

            _connectGraphics: function () {

                this.connect("ongraphicOver", this._mapState, "onGraphicMouseOver", function (evt) {
                    var graphic = evt.graphic;
                    if (graphic && !this._routeDNDenabled && !this.dndActiv &&
                        graphic.symbol && graphic.symbol.type === "simplelinesymbol" && graphic.attributes &&
                        graphic.attributes.type === "ROUTING") {
                        this._currentRoute = graphic;
                        this._enableRouteDragging(evt);

                    }
                });
                this.connect("ongraphicOut", this._mapState, "onGraphicMouseOut", function (evt) {
                    clearTimeout(this._graphicTimer);
                    this._graphicTimer = setTimeout(lang.hitch(this, function () {
                        this._enableMapNav();
                        this.disconnect("routeStartDrag");
                        this.disconnect("routeEndDrag");
                        this.renderer.removeMarker(this._neutralMarker);
                        this._routeDNDenabled = false;
                    }), 500);

                });

            },

            _disconnectGraphics: function () {

                this.disconnect("ongraphicOver");
                this.disconnect("ongraphicOut");

            },

            _disableMapNav: function () {
                var a = this.map;
                this._mapNavState = {isDoubleClickZoom: a.isDoubleClickZoom, isClickRecenter: a.isClickRecenter, isPan: a.isPan, isRubberBandZoom: a.isRubberBandZoom, isKeyboardNavigation: a.isKeyboardNavigation, isScrollWheelZoom: a.isScrollWheelZoom};
                a.disableDoubleClickZoom();
                a.disableClickRecenter();
                a.disablePan();
                a.disableRubberBandZoom();
                a.disableKeyboardNavigation();
                this._routeDNDenabled = true;
            },

            _enableMapNav: function () {
                var a = this.map, c = this._mapNavState;
                c && (c.isDoubleClickZoom &&
                    a.enableDoubleClickZoom(), c.isClickRecenter && a.enableClickRecenter(), c.isPan && a.enablePan(), c.isRubberBandZoom && a.enableRubberBandZoom(), c.isKeyboardNavigation && a.enableKeyboardNavigation(), c.isScrollWheelZoom && a.enableScrollWheelZoom());
                this._routeDNDenabled = false;
            },

            _enableRouteDragging: function (evt) {

                if (this._routeDNDenabled) {
                    return;
                }

                this._routeDNDenabled = true;

                this._disableMapNav();

                this.connect("routeStartDrag", this.map, "onMouseDown", this, this._startRouteDragging);

            },

            _drawNeutralMarker: function (evt) {
                clearTimeout(this._graphicTimer);
                this.renderer.removeMarker(this._neutralMarker);
                return this._neutralMarker = this.renderer.drawNeutralMarker(evt.mapPoint);

            },

            _endRouteDragging: function (evt) {

                this.disconnect("routeEndDrag");
                this._enableMapNav();
                this._drawNeutralMarker(evt);
                this._geocodeItem(evt.mapPoint, lang.hitch(this,
                    function (resp) {
                        this._connectGraphics();
                        if (resp.length >= 1) {
                            this.routingwidget.addBetweenTarget(resp[0], this._currentRoute.attributes.endIndex);
                        }
                        this._currentRoute = null;
                    }));

            },

            _startRouteDragging: function () {
                clearTimeout(this._graphicTimer);
                this.disconnect("routeStartDrag");

                this._disconnectGraphics();

                this.connect("routeEndDrag", this.map, "onMouseUp", this, this._endRouteDragging);
                this.connect("routeEndDrag", this.map, "onMouseDrag", this, this._drawNeutralMarker);

            },

            disable: function (evt) {
                this._destroyMenu();
            }
        });
        return RoutingController;
    });
