define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/html",
        "dojo/dom-class",
        "dojo/_base/fx",
        "dojo/fx",
        "dojox/fx/style",
        "dojo/fx/easing",
        "dojo/sniff",
        "dijit/Tooltip",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "ct/_Connect",
        "ct/async",
        "ct/util/css",
        "base/ui/controls/drilldowntree/DrillDownTree",
        "base/ui/controls/layermanager/LayerManagerWidget",
        "base/ui/controls/layermanager/LayerManagerController",
        "./DescriptionWidget",
        "dijit/layout/ContentPane",
        "dijit/layout/TabContainer",
        "dojo/text!./templates/ContentPanelUI.html",
        "dijit/TitlePane"
    ],
    function (declare, d_array, d_html, d_domClass, d_basefx, d_fx, d_fxstyle, d_fxeasing, d_sniff, Tooltip, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Connect, ct_async, ct_css, DrillDownTree, LayerManagerWidget, LayerManagerController, DescriptionWidget, ContentPane, TabContainer, templateStringContent) {
        /*
         * COPYRIGHT 2011 con terra GmbH Germany
         */
        return declare([
                _WidgetBase,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {
                templateString: templateStringContent,

                isLayoutContainer: true,

                topics: {
                    ON_CONTENTMANAGER_SHOW: "ct/contentmanager/ON_CONTENTMANAGER_SHOW",
                    ON_CONTENTMANAGER_HIDE: "ct/contentmanager/ON_CONTENTMANAGER_HIDE",
                    ON_POI_HOVER: "ct/contentmanager/ON_POI_HOVER",
                    ON_POI_LEAVE: "ct/contentmanager/ON_POI_LEAVE",
                    APP_SELECTED: "ct/appsoverview/APP_SELECTED",
                    INFO_CLICK: "ct/contentmanager/INFO_CLICK"
                },

                CONTENT_MODEL_LAYER_ADD: "contentModelLayerAdd",
                CONTENT_MODEL_LAYER_ADD_SILENT: "contentModelLayerAddSilent",
                CONTENT_MODEL_LAYER_REMOVE: "contentModelLayerRemove",
                CONTENT_MODEL_LAYER_LOAD: "contentModelLayerLoad",
                LAYER_REMOVE: "layerRemove",
                ALL_LAYERS_REMOVE: "allLayersRemove",

                types: {
                    GRAPHICS: "graphics",
                    OPERATIONAL: "operational"
                },

                _historicPointerNodeId: "pointer",
                openWindowOnNewData: true,

                constructor: function () {
                    this._listeners = new _Connect();
                },

                destroy: function () {
                    this._lmc.deactivate();
                    if (this.treeContent) {
                        this.treeContent.destroy();
                    }
                    if (this._descWidget) {
                        this._descWidget.destroy();
                    }
                    if (this.layermanagerWidget) {
                        this.layermanagerWidget.destroy();
                    }
                    if (this.featurelayermanagerWidget) {
                        this.featurelayermanagerWidget.destroy();
                    }
                    if (this.tabContainer) {
                        this.tabContainer.destroy();
                    }
                    this._listeners.disconnect();
                    this.inherited(arguments);
                },

                _createLayerManager: function () {
                    var widgets = {};
                    this.layermanagerWidget = new LayerManagerWidget({
                        i18n: this.i18n.ui.graphicLayerManager,
                        enablePOIHighlighting: this.props.enablePOIHighlighting,
                        itemProperties: {
                            opacityControls: true,
                            showAllLayerOpacityControl: false,
                            visibilityControls: true,
//                        infoPOIControls: false,
                            removeControls: true,
                            layerType: this.types.GRAPHICS,
                            title: this.i18n.ui.graphicLayerTitle
                        },
                        baseClass: "layerManagerGraphics ctLayerManager",
                        eventService: this.eventService,
//BartVerbeeck Bug32154                        
                        mapState:this._mapState,
                        mapModel:this._mapModel
                    });
                    widgets[this.types.GRAPHICS] = this.layermanagerWidget;
                    this.featurelayermanagerWidget = new LayerManagerWidget({
                        i18n: this.i18n.ui.operationalLayerManager,
                        enablePOIHighlighting: this.props.enablePOIHighlighting,
                        itemProperties: {
                            opacityControls: true,
                            showAllLayerOpacityControl: false,
                            visibilityControls: true,
                            removeControls: true,
                            layerType: this.types.OPERATIONAL,
                            title: this.i18n.ui.operationalLayerTitle
                        },
                        baseClass: "layerManagerOverlay ctLayerManager",
                        eventService: this.eventService,
//BartVerbeeck Bug32154                        
                         mapState:this._mapState,
                        mapModel:this._mapModel
                    });
                    widgets[this.types.OPERATIONAL] = this.featurelayermanagerWidget;
                    this._lmc = new LayerManagerController({
                        _mrr: this._mrr,
                        _mapModel: this._mapModel,
                        _contextMenuWidget: widgets,
                        eventService: this.eventService
                    });
                    this._lmc.activate();

                    this._listeners.connect("layermanager", this._lmc, "onInfoClick", this,
                        "_handleOnInfoClick");
                },

                _onModelStructureChanged: function (evt) {
                    //change to mijn selecties tab only when layers are added over loadservice bundle
                    if (evt.dynamicAdd) {
                        if (this.openWindowOnNewData) {
                            this._expandSelectionPanel();
                        }
                    }
                    this._animateTab(1);
                },

                _handleOnInfoClick: function (evt) {
                    this.eventService.postEvent(this.topics.INFO_CLICK, evt);
                },

                _handlePOIHover: function (item) {
                    this.eventService.postEvent(this.topics.ON_POI_HOVER, {item: item});
                },

                _handlePOILeave: function (item) {
                    this.eventService.postEvent(this.topics.ON_POI_LEAVE, {item: item});
                },

                onShow: function () {
                    this.eventService.postEvent(this.topics.ON_CONTENTMANAGER_SHOW);
                    this.layermanagerWidget.onShow();
                },

                onHide: function () {
                    this.eventService.postEvent(this.topics.ON_CONTENTMANAGER_HIDE);
                    this.layermanagerWidget.onHide();
                },

                _animateTab: function (idx) {

                    var elem = this.tabContainer.getChildren()[idx],
                        node = elem.get("controlButton").domNode;
                    if (d_sniff("ie") < 10) {
                        var inAnim = d_basefx.animateProperty({
                                node: node,
                                properties: { backgroundColor: "#fbd837" },
                                easing: d_fxeasing.linear,
                                duration: 500
                            }),
                            outAnim = d_basefx.animateProperty({
                                node: node,
                                properties: { backgroundColor: "#e5e5e5" },
                                easing: d_fxeasing.linear,
                                duration: 500
                            });
                        d_fx.chain([
                            inAnim,
                            outAnim,
                            inAnim,
                            outAnim
                        ]).play();
                    } else {
                        d_domClass.add(node, "dijitTabAnimated");
                        ct_async.hitch(this, function () {
                            d_domClass.remove(node, "dijitTabAnimated");
                        }, 3000)();
                    }

                },

                _handleOnClick: function (item) {
                    var cmc = this.contentModelController;

                    if (item.type === "app") {
                        this.eventService.postEvent(this.topics.APP_SELECTED, {id: item.appid});
                    }

                    var enabled = item.get("enabled");

                    if (!enabled) {
                        cmc.enableLayerInContentModel(item);
                    } else {
                        cmc.disableLayerInContentModel(item);
                    }
                },

                postCreate: function () {
                    this.inherited(arguments);
                    var props = this.props;
                    this._listeners.connect("mapModel", this._mapModel, "onModelStructureChanged", this,
                        this._onModelStructureChanged);
                    var hasDesc = props.showDescription;
                    ct_css.toggleClass(this.descNode.domNode, "dijitDisplayNone", !hasDesc);
                    if (hasDesc) {
                        this._createDescriptionPanel();
                    }
                    this._createLayerManager();
                    this._connectTree();

                    if (props.showBottomToolbar) {
                        this._setupOverlayToolbar();
                    }
                    this.nearbyNode.set("content", this.nearbyPlacesWidget);
                    this.treeNode.set("content", this.treeContent);
                    this.treeNode.set("open", this.props.expandTreePanel);
                    this.poiLayersNode.set("content", this.layermanagerWidget);
                    this.nonpoiLayersNode.set("content", this.featurelayermanagerWidget);

                    if (this._lmc) {
                        this._lmc._onHide();
                    }

                    this._listeners.connect("tabcontainer", this.tabContainer, "selectChild", this, function (selectedChild) {
                        if (selectedChild.id === this.layermanagerNode.id) {
                            this._lmc._onShow();
                        } else {
                            this._lmc._onHide();
                        }
                    });

                },

                _setupOverlayToolbar: function () {
                    var contentPane = new ContentPane({
                        content: this.overlayToolbar,
                        region: "bottom",
                        "class": "toolbarPane"
                    });
                    this.treeBorderContainer.addChild(contentPane);
                },

                _connectTree: function () {

                    this._listeners.disconnect("tree");
                    this._listeners.connect("tree", this.treeContent, "onClick", this, "_handleOnClick");
                    this._listeners.connect("tree", this.treeContent, "onInfoClick", this,
                        "_handleOnInfoClick");
                    if (this.props.enablePOIHighlighting) {
                        this._listeners.connect("tree", this.treeContent, "onPOIHover", this,
                            "_handlePOIHover");
                        this._listeners.connect("tree", this.treeContent, "onPOILeave", this,
                            "_handlePOILeave");
                    }

                },

                _createDescriptionPanel: function () {
                    this._descWidget = new DescriptionWidget({
                        description: this.props.description
                    });
                    this.descNode.set("content", this._descWidget);
                },

                _expandSelectionPanel: function () {
                    if (this.tabContainer && this.tabContainer.selectChild && this.tabContainer.getChildren().length === 2) {
                        this.tabContainer.selectChild(this.tabContainer.getChildren()[1]);
                    } else {
                        if (!this.combicontentmanagerTool.get("active")) {
                            this.combicontentmanagerTool.set("active", true);
                        }
                        if (!this.layermanagerNode.get("open")) {
                            this.layermanagerNode.set("open", true);
                        }
                    }
                },

                resize: function (d) {
                    this.tabContainer.resize(d);
                }
            });
    });