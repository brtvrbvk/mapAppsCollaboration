/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author fba
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/string",
        "dojo/_base/connect",
        "dojo/dom-class",
        "dojo/sniff",
        "dijit/_Widget",
        "dijit/_Templated",
        "dojo/dom-construct",
        "ct/store/SuggestQueryStore",
        "ct/_lang",
        "ct/_when",
        "ct/_Connect",
        "ct/array",
        "ct/util/css",
        "./RoutingResultWidget",
        "./RoutingTargetWidget",
        "dojo/text!./templates/RoutingWidget.html",
        "dojo/dnd/Source",
        "dojo/dnd/Manager",
        "dojo/io-query",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "dijit/form/Button",
        "dojox/form/CheckedMultiSelect",
        "ct/ui/controls/MessagePane"
    ],
    function (
        declare,
        d_array,
        d_lang,
        d_string,
        d_connect,
        dom_class,
        d_sniff,
        _Widget,
        _Templated,
        d_domconstruct,
        SuggestQueryStore,
        ct_lang,
        ct_when,
        Connect,
        ct_array,
        css,
        RoutingResultWidget,
        RoutingTargetWidget,
        templateString,
        Source,
        Manager,
        d_ioQuery
        ) {

        var EventStoreDecorator = function (store) {
            return d_lang.delegate(store, {
                query: function (
                    query,
                    options
                    ) {
                    this.onSearchBegin({
                        src: this
                    });
                    var queryResult = store.query(query, options);
                    var cancelled = false;
                    ct_when(queryResult, function (items) {
                            this.onSearchComplete({
                                src: this,
                                items: items
                            });
                        },
                        function (error) {
                            if (!cancelled) {
                                this.onSearchError({
                                    src: this,
                                    error: error
                                });
                            } else {
                                this.onSearchCancelled({
                                    src: this
                                });
                            }
                        }, this);
                    if (queryResult.cancel) {
                        var cancelFn = queryResult.cancel;
                        queryResult.cancel = function () {
                            cancelled = true;
                            try {
                                cancelFn.apply(queryResult, arguments);
                            } catch (e) {
                                //we catch this exception to prevent error logs
                            }
                        };
                    }
                    return queryResult;
                },
                onSearchBegin: function (event) {
                },
                onSearchComplete: function (event) {
                },
                onSearchError: function (event) {
                },
                onSearchCancelled: function (event) {
                }
            });
        };

        var ResultDecorator = function (store) {
            return d_lang.delegate(store, {
                query: function (
                    query,
                    options
                    ) {
                    var queryResult = store.query(query, options);
                    ct_when(queryResult, function (items) {
                        d_array.forEach(items, function (item) {
                            var searchAttr = store.omniSearchSearchAttr;
                            // add search attr to item since it is required by omnisearch
                            if (!item[searchAttr]) {
                                var label = item[store.omniSearchCustomTitle] || item[store.omniSearchLabelAttr] || "";
                                item[searchAttr] = label;
                            }
                        }, this);
                    });
                    return queryResult;
                }
            });
        };

        var substitute = d_string.substitute;
        var RoutingWidget = declare([
            _Widget,
            _Templated
        ], {

            templateString: templateString,
            widgetsInTemplate: true,
            _targetNodes: 2,
            _targetBoxes: null,
            attributeMap: d_lang.delegate(_Widget.prototype.attributeMap, {
                href: [
                    {
                        node: "mailLink",
                        type: "attribute"
                    }
                ]
            }),

            postCreate: function () {
                this.inherited(arguments);
                // init primary geocoder
                var s = SuggestQueryStore(this.searchStore);
                s = EventStoreDecorator(s);
                s = ResultDecorator(s);

                this._suggestStore = s;

                this._listeners = new Connect({
                    defaultConnectScope: this
                });
                this.directionsList = new Source(this.targetAttachNode);
                this.directionsList.withHandles = true;
                this.directionsList.skipForm = true;
                d_connect.connect(this.directionsList, "onDrop", this,
                    "_onDndDropHandler");
                d_connect.connect(this.directionsList, "onDndStart", this,
                    "_onDndStartHandler");
                d_connect.connect(this.transportModeNode, "onChange", this,
                    "_onTypeChangeHandler");
                d_connect.connect(this.typeNode, "onChange", this, "_startRouteCalc");
                var opts = {
                    "placeHolder": " ",
                    "store": this._suggestStore,
                    "searchDelay": 500,
                    "labelAttr": "title",
                    "searchAttr": "title",
                    "class": "ctRoutingTextBox",
                    "pageSize": 5,
                    queryExpr: "*${0}*",
                    hasDownArrow: false,
                    ignoreCase: true,
                    highlightMatch: 'first',
                    autoComplete: false
                };
                d_lang.mixin(opts, this.comboboxOpts);
                if (!d_sniff("ios") && !d_sniff("android")) {
                    this._comboOpts = opts;
                } else {
                    this._comboOpts = {};
                    ct_lang.copyAllProps(this._comboOpts, opts, ["placeHolder"], false);
                }
                this._initBoxes(this._targetNodes);
                // tooltip
//                new dijit.Tooltip({
//                    connectId: [this.clearRoute.domNode],
//                    label: this.i18n.tooltip.clearRoute
//                });
//                new dijit.Tooltip({
//                    connectId: [this.printRoutingResultBtn.domNode],
//                    label: this.i18n.tooltip.print
//                });
                new dijit.Tooltip({
                    connectId: [this.addTarget.domNode],
                    label: this.i18n.tooltip.addTarget
                });

                new dijit.Tooltip({
                    connectId: [this.switchTargets.domNode],
                    label: this.i18n.tooltip.switchTargets
                });

                this.toptoolbarnode.set("content", this.topToolbar);
            },

            onCalculateRoute: function (evt) {
            },
            onClearRoute: function (evt) {
            },

            _onAddTargetClick: function (evt) {
                var index;
                if (evt) {
                    index = evt.nodeIndex;
                }
                if (this._targetNodes === 10) {
                    this.showMessage("warning", this.i18n.exceedMaxTarget);
                    setTimeout(d_lang.hitch(this, function () {
                        this.hideMessage();
                    }), 2000);
                } else {
                    if (!index) {
                        this._targetNodes++;
                        this._createBox(this._targetNodes);
                    } else if (index && index >= this._targetNodes) {
                        // create boxes until the required index
                        var startIndex = this._targetNodes + 1;
                        var endIndex = index + 1;
                        for (var i = startIndex; i <= endIndex; i++) {
                            this._createBox(i);
                        }
                        this._targetNodes = endIndex;
                    } else if (index && index < this._targetNodes) {
                        var len = this._targetNodes;
                        this._createBox(this._targetNodes + 1);
                        this._targetNodes++;
                        var previous;
                        for (var j = index; j < len; j++) {
                            var next = this._targetBoxes[j + 1].get("item");
                            if (previous) {
                                this._targetBoxes[j + 1].set("item", previous);
                            } else {
                                this._targetBoxes[j + 1].set("item", this._targetBoxes[j].get("item"));
                            }
                            previous = next;

                        }
                        this._targetBoxes[index].set("item", evt.item);
                    }
                    this._setMarker();
                    this.resize();
                    this.hideMessage();
                }
            },

            _onClearTargetFields: function () {
                for (var i = 0; i < this._targetBoxes.length; i++) {
                    this._targetBoxes[i].destroyRecursive();
                }
                this._listeners.disconnect();
                this._targetBoxes = [];
                this._targetNodes = 2;
                this._initBoxes(2);
                this.onClearRoute();
            },

            _onSwitchTargetsClick: function () {
                if (this._targetBoxes && this._targetBoxes.length >= 2) {
                    var startBox = this._targetBoxes[0];
                    var destBox = this._targetBoxes[this._targetBoxes.length - 1];
                    var tmp = startBox.get("item");
                    startBox.set("item", destBox.get("item"));
                    destBox.set("item", tmp);
                }
            },

            setRequestParamLength: function (length) {
                this._requestParamLength = length;
            },

            _setAdvancedOptions: function (isEnabled) {
                css.switchHidden(this.typeNode.domNode, !isEnabled);
            },

            _onDndStartHandler: function (
                source,
                nodes,
                copy
                ) {
                var index;
                d_array.some(this.directionsList.getAllNodes(), function (
                    node,
                    idx
                    ) {
                    if (node === source.anchor) {
                        index = idx;
                        return true;
                    }
                }, this);

                var m = Manager.manager();
                dom_class.add(m.avatar.node, "ctRoutingAvatar");
                this._listeners.connect("dropListener", this.esriMap, "onMouseUp",
                    d_lang.hitch(this, function (evt) {
                        this._listeners.disconnect("dropListener");
                        if (!evt.graphic) {
                            this.onDndMouseUp({
                                index: index,
                                target: evt.mapPoint
                            });
                        }
                    }));
            },

            onDndMouseUp: function (evt) {
            },

            _onDndDropHandler: function (
                source,
                nodes,
                copy
                ) {
                this._listeners.disconnect("dropListener");
                if (this._targetBoxes && this._targetBoxes.length >= 2) {
                    var boxes = [];
                    d_array.some(this.directionsList.getAllNodes(), function (
                        node,
                        idx
                        ) {
                        var box = this._getBoxByID(node.id);
                        boxes.push(box);
                    }, this);
                    this._targetBoxes = boxes;
                    this._startRouteCalc();
                }
            },

            _onTypeChangeHandler: function (val) {
                if (val === "pedestrian") {
                    this._setAdvancedOptions(false);
                } else {
                    this._setAdvancedOptions(true);
                }
                this._startRouteCalc();
            },

            _startRouteCalc: function () {
                this._requestParamLength--;
                if (this._requestParamLength > 0) {
                    return;
                }
                this._setMarker();
                var targets = this._targets = [],
                    counter = -1;
                d_array.forEach(this.directionsList.getAllNodes(), function (node) {
                    counter++;
                    var box = this._getBoxByID(node.id);
                    var item = box.get("item");
                    if (item) {
                        item.index = counter;
                        targets.push(item);
                    }
                }, this);
                var zoom = true;
//                if (this.byClick) {
//                    zoom = false;
//                }
                // if there's only one point, don't zoom. check: byClick is unreliable.
                if (targets.length === 1) {
                    zoom = false;
                }
                var mode = this.transportModeNode.get("value");
                var type = this._getCurrentTransportType();
                this.onCalculateRoute({
                    targets: targets,
                    transportMode: mode,
                    type: type,
                    zoom: zoom
                });
                this.byClick = false;
            },

            setTransportMode: function (mode) {
                this.transportModeNode.set("value", mode);
            },

            setType: function (type) {
                this.typeNode.set("value", type);
            },

            recalculateRoute: function (zoom) {
                this.byClick = !zoom;
                this._startRouteCalc();
            },

            _setLoadingAttr: function (loading) {
                if (loading) {
                    dom_class.add(this.loaderNode, "ctLoading");
                } else {
                    dom_class.remove(this.loaderNode, "ctLoading");
                }
            },

            _setMarker: function () {
                d_array.forEach(this.directionsList.getAllNodes(), function (
                    node,
                    idx
                    ) {
                    dijit.byId(node.id).marker.src = this.markerUrls[idx];
                }, this);
            },

            _setRoutingresultAttr: function (obj) {
                this._routingResult = obj;
                if (!obj) {
                    return;
                }
                if (this._resultWidgets && this._resultWidgets.length > 0) {
                    d_array.forEach(this._resultWidgets, function (rw) {
                        rw.destroyRecursive();
                    });
                }
                this._resultWidgets = [];
                if (obj.routes) {
                    d_array.forEach(obj.routes, function (r) {
                        var w = new RoutingResultWidget({
                            type: "nonprint",
                            route: r,
                            i18n: this.i18n,
                            transportType: r.type,
                            transportMode: r.transportation[0],
                            targets: this._targets,
                            markerUrls: this.markerUrls,
                            eventService: this.eventService,
                            elevationTool: this.elevationTool
                        });
                        this._resultWidgets.push(w);
                        var d = d_domconstruct.create("div");
                        d_domconstruct.place(d, this.routeResultAttachNode);
                        d_domconstruct.place(w.domNode, d);
                    }, this);
                }
                this.hideMessage();
            },

            _setErrorAttr: function (error) {
                this.showMessage("error", "Error: " + error.subtype);
            },

            showMessage: function (
                type,
                message
                ) {
                this.hideMessage();
                this.messagePane.addMessage({
                    type: type,
                    value: message
                }, true);
            },

            hideMessage: function () {
                if (this.messagePane.messages.length > 0) {
                    this.messagePane.clearMessages();
                }
            },

            _initBoxes: function (count) {
                var i;
                this._targetBoxes = [];
                for (i = 0; i < count; i++) {
                    this._createBox(i);
                }
                this._setMarker();
            },

            _createBox: function (id) {
                var opts = this._comboOpts;
                var box = new RoutingTargetWidget({
                    comboOpts: opts,
                    geocoder: this.searchStore,
                    i18n: this.i18n
                });
                this._listeners.connect("box" + id, box, "onDelete", function () {
                    var recalculate = false;
                    if (box._box.get("item")) {
                        recalculate = true;
                    }
                    if (this.directionsList.getAllNodes().length > 2) {
                        this._targetNodes--;
                        ct_array.arrayRemove(this._targetBoxes, box);
                        box.destroyRecursive();
                        this._listeners.disconnect("box" + id);
                        this._listeners.disconnect("box" + id + "_change");
                    } else {
                        box._box.set("item", null);
                        this.onClearRoute();
                    }
                    if (recalculate) {
                        this._startRouteCalc();
                    }
                }, this);
                this._listeners.connect("box" + id + "_change", box,
                    "onSelectionChanged", this, function () {
                        var item = box.get("item");
                        if (!item.geometry) {
                            ct_when(this.searchStore.queryQualifiedResult(item),
                                function (res) {
                                    box.set("item", res);
                                    this._startRouteCalc();
                                }, this);
                        } else {
                            this._startRouteCalc();
                        }
                    });
                this._listeners.connect("box" + id + "_focusNext", box, "onFocusNext", this, function () {
                    var idx = ct_array.arrayFirstIndexOf(this._targetBoxes, {
                        id: box.id
                    });
                    if (idx > -1 && this._targetBoxes[idx + 1]) {
                        this._targetBoxes[idx + 1].focus();
                    }
                });
                this._targetBoxes.push(box);
                this.directionsList.insertNodes(false, [box.domNode]);

                box.startup();
                return box;
            },

            fillFirstTargetBox: function (
                item,
                byClick
                ) {
                this.byClick = byClick;
                this._fillTargetBox(item, 0);
            },

            fillLastTargetBox: function (
                item,
                byClick
                ) {
                this.byClick = byClick;
                if (!this._targetBoxes[1].get("item")) {
                    this._fillTargetBox(item, 1);
                } else {
                    if (this._targetBoxes.length > 2) {
                        // check for the last box with input
                        var boxId;
                        d_array.forEach(this._targetBoxes, function (
                            box,
                            index
                            ) {
                            if (box.get("item")) {
                                boxId = index;
                            }
                        });
                        this._fillTargetBox(item, boxId);
                    } else {
                        this._fillTargetBox(item, 1);
                    }
                }
            },

            addBetweenTarget: function (
                item,
                idx
                ) {
                this._onAddTargetClick({
                    nodeIndex: idx,
                    item: item
                });
//                this._fillTargetBox(item, idx);
            },

            fillNewTargetBox: function (
                item,
                byClick,
                index
                ) {
                this.byClick = byClick;
                // because geocode process is asynchronous (see startRouting), the box index has to be kept
                // sometimes the index is out of range (see _fillTargetBox), meaning the previous boxes are not yet created
                // therefore in _onAddTargetClick, we need to create the previous boxes.
                if (index) {
                    this._onAddTargetClick({
                        nodeIndex: index
                    });
                    this._fillTargetBox(item, index);
                } else {
                    if (this._targetBoxes.length > 2) {
                        // check for empty routing box
                        var boxId;
                        d_array.some(this._targetBoxes, function (
                            box,
                            idx
                            ) {
                            if (!box.get("item")) {
                                boxId = idx;
                                return true;
                            }
                        });
                        if (boxId) {
                            this._fillTargetBox(item, boxId);
                        } else {
                            this._onAddTargetClick();
                            this._fillTargetBox(item,
                                    this.directionsList.getAllNodes().length - 1);
                        }
                    } else {
                        this._onAddTargetClick();
                        this._fillTargetBox(item,
                                this.directionsList.getAllNodes().length - 1);
                    }
                }
            },

            updateTargetBox: function (
                item,
                index,
                byClick
                ) {
                this.byClick = byClick;
                this._fillTargetBox(item, index);
            },

            _fillTargetBox: function (
                item,
                idx
                ) {
                if (item && idx !== undefined) {
                    if (!item.title && item.FormattedAddress) {
                        item.title = item.FormattedAddress;
                    }
                    var node = this.directionsList.getAllNodes()[idx];
                    var box = this._getBoxByID(node.id);
                    item.index = idx;
                    if (box != null) {
                        box._box.set("item", null);
                        box._box.set("item", item);
                    }
                }
            },

            _getBoxByID: function (id) {
                var i;
                for (i = 0; i < this._targetBoxes.length; i++) {
                    if (this._targetBoxes[i].id === id) {
                        return this._targetBoxes[i];
                    }
                }
                return null;
            },

            _getCurrentTransportType: function () {
                var type = "";
                if (!dom_class.contains(this.typeNode.domNode, "dijitDisplayNone")) {
                    type = this.typeNode.get("value");
                }
                return type;
            },

            getRoutingInfo: function () {
                var obj = {
                    items: this._targetBoxes,
                    type: this._getCurrentTransportType(),
                    mode: this.transportModeNode.get("value")
                };
                return obj;
            },

            getRoutingResultInfo: function () {
                if (this._routingResult) {
                    return {
                        routes: this._routingResult.routes,
                        targets: this._targets,
                        markerUrls: this.markerUrls
                    };
                }

                return null;
            },

            resize: function (dim) {
                this.inherited(arguments);
                if (this.mainNode) {
                    this.mainNode.resize(dim);
                }
            }
        });
        return RoutingWidget;
    });
