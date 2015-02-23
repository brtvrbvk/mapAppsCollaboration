define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/string",
        "dojo/dom-construct",
        "ct/array",
        "ct/util/css",
        "ct/_when",
        "ct/_Connect",
        "esri/dijit/Scalebar",
        "scaleviewer/ScaleViewerWidget",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "ct/mapping/map/MapModelInitializer",
        "ct/mapping/map/Map",
        "ct/mapping/map/MapState",
        "dojo/text!./templates/SimpleMapWidget.html",
        "dijit/layout/ContentPane",
        "ct/ui/template/OverlayContainer"
    ],
    function (
        declare,
        d_array,
        d_lang,
        d_string,
        d_domconstruct,
        ct_array,
        ct_css,
        ct_when,
        Connect,
        Scalebar,
        ScaleViewerWidget,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        MapModelInitializer,
        Map,
        MapState,
        templateStringContent
        ) {

        return declare([
                _Widget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {
                baseClass: "ctGipodResultIdentificatie",
                templateString: templateStringContent,

                postCreate: function () {
                    this.inherited(arguments);
                    this._initMap(this.graphics);
                },

                destroy: function () {
                    if (this._map) {
                        this._map.destroy();
                        this._map = null;
                    }
                    this.inherited(arguments);
                },

                _initMap: function (graphics) {

                    var mapdata = {
                        maps: [
                            {
                                glass_pane: [
                                    {
                                        "enabled": true,
                                        "id": "graphics",
                                        "graphics": graphics
                                    }
                                ],
                                baseLayer: [this.serviceDefinition]
                            }
                        ]
                    };

                    var modelInitializer = new MapModelInitializer({
                        mapInitData: mapdata,
                        mapResourceRegistry: this.mrr
                    });

                    ct_when(modelInitializer.initMapModel(),
                        function (model) {
                            var ms = this._detailMapState = new MapState({
                                lods: this.mapState.getLODs(),
                                initialExtent: this.initialExtent
                            });

                            var opts = {
                                logo: false,
                                showInfoWindowOnClick: false,
                                slider: true,
                                sliderStyle: "small",
                                scrollWheelZoom: false
                            };
                            var map = this._map = new Map({
                                esriMapOpts: opts,
                                esriLayerFactory: this.esriLayerFactory,
                                mapModel: model,
                                mapState: ms
                            });
                            ct_when(map.esriMapReference.waitForEsriMapLoad(), function (esriMap) {
                                if (esriMap) {
                                    this._esriMap = map.esriMapReference.esriMap;
                                }
                            }, this);

                            d_domconstruct.place(this._map.domNode, this.mapnode.domNode);
                            map.startup();

                            ct_when(map.get("esriMapReference").waitForEsriMapLoad(),
                                d_lang.hitch(this, function (success) {
                                    if (success) {
                                        new Scalebar({
                                            "map": map.esriMap,
                                            "scalebarUnit": "metric",
                                            "scalebarStyle": "line"
                                        }, this.scalebarNode);
                                    }
                                }));
                            var scaleviewer = new ScaleViewerWidget({
                                mapState: ms,
                                scaleTemplate: this.i18n.scale
                            });
                            d_domconstruct.place(scaleviewer.domNode, this.scaleviewerNode);

                            this._model = model;
                        }, function (err) {
                            console.error("Map can't be initialized:",
                                err);
                        }, this);
                },

                getMapComponents: function () {
                    return {
                        mapState: this._detailMapState,
                        mapModel: this._model,
                        esriMap: this._esriMap
                    };
                },

                resize: function (dim) {
                    if (this.overlayContainer && dim.w > 0 && dim.h > 0) {
                        this.overlayContainer.resize(dim);
                    }
//                    if (this.mapNode && dim.w > 0 && dim.h > 0) {
//                        this.mapNode.resize(dim);
//                    }
                }
            });
    });