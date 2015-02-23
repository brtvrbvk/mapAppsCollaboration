define([
        "ct",
        "dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/html",
        "dijit/_Widget",
        "dijit/_Templated",
        "dijit/form/Button",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "ct/_Connect",
        "ct/mapping/map/Map",
        "ct/mapping/map/MapState",
        "ct/mapping/map/MapModelInitializer",
        "ct/mapping/mapcontent/MappingResourceRegistry",
        "ct/mapping/map/EsriLayerFactory",
        "dojo/text!prj/agiv/bundles/pprselection/templates/PPRDetailView.html"
    ],
    function (
        ct,
        d_lang,
        declare,
        d_html,
        _Widget,
        _Templated,
        Button,
        BorderContainer,
        ContentPane,
        _Connect,
        Map,
        MapState,
        MapModelInitializer,
        MappingResourceRegistry,
        EsriLayerFactory,
        templateStringContent
        ) {
        /*
         * COPYRIGHT 2012 con terra GmbH Germany
         */

        var PPRDetailView = declare(
            [
                _Widget,
                _Templated
            ],
            /**
             * @lends prj.agiv.bundles.pprinfo.PPRDetailView
             */
            {
                baseClass: "ctInfoContent ctInfoDetail",
                templateString: templateStringContent,
                widgetsInTemplate: true,

                attributeMap: d_lang.delegate(_Widget.prototype.attributeMap, {
                    beneficiary: [
                        {
                            node: "beneficiaryNode",
                            type: "innerHTML"
                        }
                    ],
                    type: [
                        {
                            node: "typeNode",
                            type: "innerHTML"
                        }
                    ],
                    startDate: [
                        {
                            node: "startDateNode",
                            type: "innerHTML"
                        }
                    ],
                    endDate: [
                        {
                            node: "endDateNode",
                            type: "innerHTML"
                        }
                    ]
                }),

                /**
                 * @constructs
                 * @param args arguments
                 */
                constructor: function (args) {
                },

                startup: function () {
                    var started = this._started;
                    this.inherited(arguments);
                    if (!started) {
                        this.mapModel.getNodeById("highlighterPane").set("enabled", false);
                        this.mapModel.fireModelNodeStateChanged();
                        var modelInitializer = this._createMapModelInitializer();
                        this._createDetailMap(modelInitializer);
                        this._createOverviewMap(modelInitializer);
                    }
                    this.set("title", ""); // overwrite title attribute to get rid of the browser tooltip. By default the "title" attribute is set to the name of the picture and the tooltip was displayed when the mouse hovered over one of the buttons or over a different image.
                },

                _createMapModelInitializer: function () {
                    var serviceDefinition = this.serviceDefinition;
                    if (!serviceDefinition) {
                        // TODO: use as default the initial base layer?
                        throw ct.Exception.illegalStateError("PPRDetailView: missing 'serviceDefinition' property!");
                    }
                    serviceDefinition.id = "agiv_wmts_bsk";
                    return new MapModelInitializer({
                        mapInitData: {
                            maps: [
                                {
                                    baseLayer: [serviceDefinition]
                                }
                            ]
                        },
                        mapResourceRegistry: this.mrr
                    });
                },

                _createDetailMap: function (modelInitializer) {
                    this._createNewMapModel(this._initDetailMap, modelInitializer);
                },

                _createOverviewMap: function (modelInitializer) {
                    this._createNewMapModel(this._initOverviewMap, modelInitializer);
                },

                _createNewMapModel: function (
                    initMapCallback,
                    modelInitializer
                    ) {
                    /*
                     * Concept taken from OverviewMapFactory to create an own
                     * map model for each map, as otherwise we would end up in
                     * a NodeStateChangedState  event loop when > 1 map have
                     * the same model
                     */
                    var initMap = d_lang.hitch(this, initMapCallback);
                    // the layer factory is used to create a esri layer from the service model node
                    var layerFactory = this._layerFactory || new EsriLayerFactory();

                    var that = this;// ok init the model
                    modelInitializer.initMapModel().then(function (model) {
                        var serviceNode = model.getBaseLayer().get("children")[0];
                        if (!serviceNode) {
                            console.error("Detail view service couldn't be initialized!");
                            return;
                        }
                        var wrapper = layerFactory.createEsriLayerWrapper(serviceNode);
                        wrapper.set("enabled", true);
                        if (serviceNode.hasChildren()) {
                            wrapper.set("enabledLayers", serviceNode.getEnabledLayerIds());
                        }
                        var esriLayer = wrapper.get("esriLayer");
                        if (esriLayer.loaded) {
                            initMap(model);
                        } else {
                            that.connect(esriLayer, "onLoad", function () {
                                that.disconnect();
                                initMap(model);
                            });
                        }
                    }, function (err) {
                        console.error("Could not create map model:", err);
                    });
                },

                _initDetailMap: function (mapModel) {
                    var mapDetail = this._dmap = this._createMapForContentPane(mapModel, this.mapPane);
                    mapDetail.mapState.setExtent(this.content.geometry.getExtent());
                    this.mapPane.set("content", mapDetail);
                },

                _initOverviewMap: function (mapModel) {
                    var mapOverview = this._omap = this._createMapForContentPane(mapModel, this.mapPaneOverview);
                    mapOverview.mapState.setExtent(this.content.geometry.getExtent());
                    var lod = mapOverview.mapState.getLODLevel();
                    mapOverview.mapState.setLODLevel(lod - 3);
                    this.mapPaneOverview.set("content", mapOverview);
//                
//                var mapOverview = this._map = new ct.mapping.map.Map({
//                    esriMapOpts: {
//                        logo : false,
//                        pan: false,
//                        slider: false,
//                        doubleClickZoom: false,
//                        rubberBandZoom: false,
//                        scrollWheelZoom: false,
//                        keyboardNavigation: false,
//                        mapNavigation: false
//                    },
//                    mapModel: mapModel,
//                    mapState: new ct.mapping.map.MapState({
//                        viewport: mapViewPort,
//                        lods : refState.getLODs()
//                    }) 
//                });
                },

                _createMapForContentPane: function (
                    mapModel,
                    contentPane
                    ) {
                    var refState = this.referencedState;
                    var viewPort = refState.getViewPort();
                    var size = d_html.contentBox(contentPane.domNode);
                    var mapViewPort = viewPort.createViewPortForScreenExtent({
                        width: size.w,
                        height: size.h
                    });
                    return new Map({
                        esriMapOpts: {
                            logo: false,
                            pan: false,
                            slider: false,
                            doubleClickZoom: false,
                            rubberBandZoom: false,
                            scrollWheelZoom: false,
                            keyboardNavigation: false,
                            mapNavigation: false
                        },
                        mapModel: mapModel,
                        mapState: new MapState({
                            viewport: mapViewPort,
                            lods: refState.getLODs()
                        })
                    });
                },

//            _bindOnEsriMapLoaded: function(map, extent){
//                ct.when(map.esriMapReference.waitForEsriMapLoad(), function(){
//                    //this._deactivateEsriMapInfoWindow(map);
//                    
//                    /* initializing the map with the correct extent will lead to a wrong geo extent in the minimap.
//                     * calling map.resize(domNodeExtent) with the same (correct) extent wont fix it, because the
//                     * EsriStateManager wont forward the event to the esri map when the extent has not changed.
//                     * So the workaround is to resize the map with a slightly different dom extent, so it gets forwarded.
//                     */
//                    extent.w = extent.w - 1;
//                    map.resize(extent);
//                }, this);
//            },

                resize: function (a) {
                    this.rootContainer.resize(a);
                },

                _setContentAttr: function (content) {
                    this._set("content", content);
                    this.set("beneficiary", content.beneficiary || "--");
                    this.set("type", content.type || "--");
                    this.set("startDate", content.startDate || "--");
                    this.set("endDate", content.endDate || "--");
                    this.set("title", content.municipality + ", " + content.parcelID);
                },

                uninitialize: function () {
                    this.inherited(arguments);
                    this.mapModel.getNodeById("highlighterPane").set("enabled", true);
                    this.mapModel.fireModelNodeStateChanged();
                    if (this._dmap) {
                        this._dmap.destroyRecursive();
                        this._dmap = null;
                    }
                    if (this._omap) {
                        this._omap.destroyRecursive();
                        this._omap = null;
                    }
                }
            });

        PPRDetailView.createWidget = function (
            params,
            contentFactory
            ) {
            return new PPRDetailView(d_lang.mixin(params, {
                mapModel: contentFactory.get("mapModel"),
                referencedState: contentFactory.get("mapState"),
                dataModel: contentFactory.get("dataModel"),
                mrr: contentFactory.get("_mrr"),
                serviceDefinition: contentFactory.get("serviceDefinition"),
                ui: contentFactory.get("ui").PPR
            }));
        }
        return PPRDetailView;
    });