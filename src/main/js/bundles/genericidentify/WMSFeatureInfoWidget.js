/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 27.06.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-geometry",
        "dojo/string",
        "dojo/query",
        "ct/_when",
        "ct/_lang",
        "ct/_Connect",
        "ct/util/css",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "infoviewer/FourAnchorsPlacementStrategy",
        "base/ui/genericidentify/_BackEnabledFIWidgetMixin",
        "dojo/text!./templates/WMSFeatureInfoWidget.html",
        "dijit/layout/ContentPane"
    ],
    function (
        declare,
        d_lang,
        d_array,
        domGeom,
        d_string,
        d_query,
        ct_when,
        ct_lang,
        Connect,
        ct_css,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        FourAnchorsPlacementStrategy,
        _BackEnabledFIWidgetMixin,
        templateString
        ) {
        var WMSFeatureInfoWidget = declare([
                _Widget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin,
                _BackEnabledFIWidgetMixin
            ],
            {

                templateString: templateString,

                constructor: function (args) {
                    this._listeners = new Connect({
                        defaultConnectScope: this
                    });
                    this.set("title", "Info");
                    this._listeners.connect(args.contentViewer.infoViewer,
                        "onShowNewInfoWindow", this,
                        this._saveContentWindow);
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this._showMessage("loading", this.i18n.loadingGeneralInfo);
                    this._executeQuery();
                    this.titleNode.innerHTML = this.content.title;
                },

                _saveContentWindow: function (evt) {
                    this.set("contentWindow", evt.infoWindow.window);
                },

                _executeQuery: function () {

                    var query = this.context.query,
                        layerTitle = query.layerTitle;

//                    var queryOpts = layerFeatureCount > 0 ? {
//                        count: layerFeatureCount,
//                        //TODO how to retrieve queryradius?
//                        queryRadius: 200
//                    } : {};
                    ct_when(query.executeQuery({queryRadius: 200, count: 10}), function (result) {
                        this._hideMessage();
                        var error = result.error;
                        if (error) {
                            var msg = d_string.substitute(this.i18n.formatNotSupported, {
                                format: result.store.format
                            });
                            if (error.status === 404) {
                                //if 404 we probably got rejected by security filter
                                msg = error.message;
                            }
                            this._showMessage("error", msg);
                            return;
                        }
                        if (result.length === 0) {
                            this._showMessage("info", this.i18n.noResultsFound);
                            this._resizeWindowForTable(15);
                            return;
                        }

                        var idProperty = result.idProperty;

                        var feature = result[0];
                        if (feature.hasNoAttributes) {
                            this._showMessage("info", this.i18n.noAttributes);
                            this._resizeWindowForTable(15);
                            return;
                        }
                        this._features = result;
                        this._current = 0;
                        this._query = query;
                        this._renderControlButtons(this._current, this._features.length);
                        this._addFeature(feature, idProperty, query);

                    }, function (e) {
                        var msg = this.i18n.errors[e.type];
                        this._showMessage("error", msg || e.msg || this.i18n.errors.noValidResponse);
                    }, this);

                },

                _renderControlButtons: function (
                    idx,
                    length
                    ) {

                    if (idx > 0) {
                        this.previousButton.set("disabled", false);
                    } else {
                        this.previousButton.set("disabled", true);
                    }
                    if (idx < length - 1) {
                        this.nextButton.set("disabled", false);
                    } else {
                        this.nextButton.set("disabled", true);
                    }
                    if (length === 1) {
                        ct_css.switchVisibility(this.nextButton.domNode, false);
                        ct_css.switchVisibility(this.previousButton.domNode, false);
                    } else {
                        ct_css.switchVisibility(this.nextButton.domNode, true);
                        ct_css.switchVisibility(this.previousButton.domNode, true);
                    }

                },

                _getRowHeight: function () {

                    if (!this._gridWidget) {
                        return 50;
                    }

                    var rows = d_query("div[role='row']", this._gridWidget.domNode),
                        height = 0;

                    d_array.forEach(rows, function (row) {

                        height += row.clientHeight;

                    }, this);

                    return height;

                },

                _resizeWindowForTable: function (tableheight) {
                    var contentWindow = this.contentWindow;
                    if (!contentWindow) {
                        this._listeners.connectP("contentwindow", this, "contentWindow", function () {
                            this._listeners.disconnect("contentwindow");
                            this._resizeWindowForTable(this._getRowHeight());
                        });
                        return;
                    }
                    var domNode = contentWindow.window.domNode;
                    if (!this._initialHeight) {
                        var marginBox = domGeom.getMarginBox(domNode);
                        this._initialHeight = marginBox.h;
                    }

                    var parentBox = domGeom.getMarginBox(domNode.parentNode),
                        newHeight = this._initialHeight + tableheight;

                    contentWindow.window.resize({
                        h: newHeight < parentBox.h ? newHeight : parentBox.h
                    });

                    var viewPort = this.mapState.getViewPort();
                    var windowDistanceFromPoint = {
                        x: 35,
                        y: 35
                    };

                    var fourAnchorsPS = new FourAnchorsPlacementStrategy(windowDistanceFromPoint);
                    var windowDimensions = {
                        h: domGeom.getMarginBox(domNode).h,
                        w: domGeom.getMarginBox(domNode).w
                    };
                    var placement = fourAnchorsPS.getPlacement(this.geometry,
                        windowDimensions,
                        viewPort, {
                            x: 0,
                            y: 0
                        });
                    contentWindow.resize({
                        l: placement.screenPoint.x,
                        t: placement.screenPoint.y,
                        w: windowDimensions.w,
                        h: windowDimensions.h
                    });

                },

                _addFeature: function (
                    feature,
                    idProperty,
                    query
                    ) {

                    if (feature) {
                        switch (query.resultType) {
                            case "json":
                            case "xml":
                                var widget = this._resolveFeatureContent(feature, query);
                                if (!widget) {
                                    console.warn("FeatureInfoWidget: no content widget for feature '" + feature[idProperty] + "' found!",
                                        feature);
                                    this.set("title", "");
                                } else {
                                    this.layerInfoPane.set("content", widget);
                                    this._gridWidget = widget;
                                }
                                break;
                            case "text":
                                switch (query.store.format) {
                                    case "text/html":
                                        ct_css.toggleClass(this.layerInfoPane.domNode, "noOverflow", true);
                                        this.layerInfoPane.set("content",
                                                "<iframe frameborder='0' style='width:inherit;height:inherit;' src='" + query.store.getLastQueryUrl() + "'></iframe");
                                        break;
                                    default:
                                        this.layerInfoPane.set("content", feature);
                                        break;
                                }
                                break;
                        }
                        this.mainContainer.resize();
                    }

                    this._resizeWindowForTable(this._getRowHeight());

                },

                _previousClicked: function () {
                    if (this._current > 0) {
                        this._current--;
                        var feature = this._features[this._current];
                        this._renderControlButtons(this._current, this._features.length);
                        this._addFeature(feature, this._features.idProperty, this._query);
                    }
                },

                _nextClicked: function () {
                    if (this._current < this._features.length - 1) {
                        this._current++
                        var feature = this._features[this._current];
                        this._renderControlButtons(this._current, this._features.length);
                        this._addFeature(feature, this._features.idProperty, this._query);
                    }
                },

                _resolveFeatureContent: function (
                    feature,
                    queryResult
                    ) {
                    var context = ct_lang.copyAllProps({}, queryResult, ["results"]);
                    context.infotype = "WMS_FEATURE_INFO_GRID";
                    return this.get("contentViewer").resolveContentWidget(feature, context);
                },

                _showMessage: function (
                    type,
                    message
                    ) {
                    this._hideMessage();
                    this.messagePane.addMessage({
                        type: type,
                        value: message
                    }, true);
                },

                _hideMessage: function () {
                    if (this.messagePane.messages.length > 0) {
                        this.messagePane.clearMessages();
                    }
                },

                startup: function () {
                    this.inherited(arguments);
                },

                resize: function (dim) {

                    this.mainContainer.resize(dim);

                }
            }
        );
        WMSFeatureInfoWidget.createWidget = function (
            params,
            contentFactory
            ) {
            params.i18n = d_lang.mixin({}, contentFactory.get("GridContentWidget").i18n);
            params.storeResolver = contentFactory.storeResolver;
            params.contentViewer = contentFactory.get("contentViewer");
            params.mapState = contentFactory.get("mapState");
            params.eventService = contentFactory.get("eventService");
            params.geometry = params.content.geometry;
            params.backEnabled = params.context.backEnabled;
            return new WMSFeatureInfoWidget(params);
        };

        return WMSFeatureInfoWidget;
    }
);