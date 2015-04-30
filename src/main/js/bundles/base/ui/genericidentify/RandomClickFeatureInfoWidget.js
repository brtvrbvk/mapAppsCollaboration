/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 27.06.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "base/ui/genericidentify/FeatureInfoWidget",
        "ct/_when",
        "dojo/dom-geometry",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/query",
        "dijit/form/Button",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "infoviewer/FourAnchorsPlacementStrategy"
    ],
    function (
        declare,
        d_lang,
        d_array,
        FeatureInfoWidget,
        ct_when,
        domGeom,
        d_class,
        domConstruct,
        d_query,
        Button,
        BorderContainer,
        ContentPane,
        FourAnchorsPlacementStrategy
        ) {
        var RandomClickFeatureInfoWidget = declare([
                FeatureInfoWidget
            ],
            {

                constructor: function (args) {

                    this._listeners.connect(args.contentViewer.infoViewer,
                        "onShowNewInfoWindow", this,
                        this._resizeWindowForLayerInfos);

                },

                postCreate: function () {
                    this.inherited(arguments);

                    if (this.storeQueries) {

                        d_array.forEach(this.storeQueries, function (query) {

                            var ctx = d_lang.mixin({query: query}, this);
                            new Button({
                                "class": "convertButtonToLink",
                                iconClass: "icon-arrow-rounded-right",
                                label: query.layerTitle,
                                onClick: d_lang.hitch(ctx, this._layerInfoClick)
                            }).placeAt(this.layerInfoList, "last");

                        }, this);
                    }

                    // Only show routing button when routing bundle is active
                    if (!this.routingTool) {
                        this.buttonContainer.removeChild(this.btnStartRouting);
                    }

                },

                _resizeWindow: function (
                    h,
                    evt
                    ) {

                    this.contentWindow = this.contentWindow || (evt.infoWindow && evt.infoWindow.window);

                    var contentWindow = this.contentWindow;
                    if (!contentWindow) {
                        return;
                    }
                    var domNode = contentWindow.window.domNode;
                    var marginBox = domGeom.getMarginBox(domNode);

                    if (h) {
                        contentWindow.window.resize({
                            h: marginBox.h + h
                        });
                    }

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

                _resizeWindowForLayerInfos: function (evt) {

                    ct_when(this.geocodeDeferred, function (resp) {

                        this._resizeWindow(45, evt);

                    }, function (error) {
                        this._showMessage("warning", error);
                    }, this);

                    this._resizeWindow(this.storeQueries.length * 16, evt);

                },

                resize: function (dim) {
                    this.mainContainer.resize(dim);
                },

                _layerInfoClick: function () {
                    var context = d_lang.mixin(this.context, {
                        query: this.query,
                        backEnabled: true
                    });
                    var content = {
                        geometry: this.content.geometry,
                        title: this.query.layerTitle
                    };
                    context.infotype = "WMS_FEATURE_INFO";
                    this.eventService.postEvent("agiv/genericidentify/SHOW_NEXT", {
                        nextContent: content,
                        nextContext: context,
                        content: this.content,
                        context: this.context
                    });
                }
            }
        );
        RandomClickFeatureInfoWidget.createWidget = function (
            params,
            contentFactory
            ) {
            var graphic = params.content.graphic;
            if (graphic || (!graphic && contentFactory.get("alwaysEnableFeatureInfo"))) {
                return new RandomClickFeatureInfoWidget({
                    geocodeDeferred: params.content.geocodeDeferred,
                    geometry: params.content.geometry,
                    storeQueries: params.content.storeQueries,
                    graphic: graphic,
                    content: params.content,
                    context: params.context,
                    poiFocus: params.content.poiFocus,
                    hideEmptyLayerResults: params.rule.hideEmptyLayerResults,
                    layerFeatureCount: params.rule.layerFeatureCount || 0,
                    contentViewer: contentFactory.get("contentViewer"),
                    addressLevelSwitch: contentFactory.get("addressLevelSwitch"),
                    i18n: contentFactory.get("ui").FeatureInfo,
                    showDetailsButton: params.rule.showDetailsButton,
                    agivGeocoder: contentFactory.get("agivGeocoder"),
                    transformer: contentFactory.get("transformer"),
                    mapState: contentFactory.get("mapState"),
                    metadataMapping: contentFactory.get("metadataMapping"),
                    expandInfoHeight: contentFactory.get("expandInfoHeight"),
                    eventService: contentFactory.get("eventService"),
                    routingTool: contentFactory.get("routingTool"),
//                    baseClass: "agivFeatureInfoWidget",
                    showNearby: contentFactory.get("locationInfoController"),
                    skipButtons: params.rule.skipButtons
                });
            }
        };
        return RandomClickFeatureInfoWidget;
    }
)
;