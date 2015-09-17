/*
 * COPYRIGHT 2011-2012 con terra GmbH Germany
 */
/**
 * @fileOverview
 * @author mss
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/string",
        "dojo/dom-construct",
        "dojo/dom-class",
        "dojo/aspect",
        "dojo/touch",
        "dojo/sniff",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dijit/form/HorizontalSlider",
        "dijit/form/Button",
        "dijit/Tooltip",
        "dijit/typematic",
        "dojo/on",
        "dojo/sniff",
        "ct/_Connect",
        "ct/_when",
        "ct/util/css",
        "ct/mapping/mapcontent/ServiceTypes",
        "base/util/POISymbolRenderer",
        "dojo/text!./templates/LayerManagerItemWidget.html"        
    ],
    function (
        declare,
        d_array,
        d_lang,
        d_string,
        d_dom,
        d_class,
        d_aspect,
        touch,
        d_sniff,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        HorizontalSlider,
        Button,
        Tooltip,
        d_typematic,
        on,
        has,
        Connect,
        ct_when,
        ct_css,
        ServiceTypes,
        POISymbolRenderer,
        templateStringContent
        ) {
        /*
         * COPYRIGHT 2011 con terra GmbH Germany
         */
        return declare([
                _Widget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {
                templateString: templateStringContent,
                _sliderVisible: false,
                _counter: 0,

                topics: {
                    ON_POI_HOVER: "ct/contentmanager/ON_POI_HOVER",
                    ON_POI_LEAVE: "ct/contentmanager/ON_POI_LEAVE",
                    ON_WIDGET_CLICK: "ct/contentmanager/ON_WIDGET_CLICK",
                    ON_WIDGET_REMOVE: "ct/contentmanager/ON_WIDGET_REMOVE"
                },

                showPOICounts: false,

                _drawingPattern: /drawingtoolsetNode[0-9]/,
                _searchPattern: /SEARCH_RESULT/,

                constructor: function (args) {
                    this._isMobile = d_sniff("ios") || d_sniff("android");
                },

                postCreate: function () {
                    this.inherited(arguments);

                    this._handler = new Connect({
                        defaultConnectScope: this
                    });

                    var layer = this.layer;
                    //slider
                    if (this.opacityControls) {
                        this._createOpacityControls(layer);
                        var opacity = layer.get("layerOpacity") || 1;
                        if (opacity) {
                            this.slider.setValue(opacity);
                            layer.set("layerOpacity", opacity);
                        }
                    }
                    var service = layer.get("service");
                    var type;
                    if (service) {
                        type = service.get("serviceType");
                    } else if (layer.get("nodeType")) {
                        type = layer.get("nodeType");
                    }
                    if (type === "POI" && layer.children && layer.children[0] && layer.children[0].layer && layer.children[0].layer.poiID) {
                        type = "SEARCH_RESULT_POI";
                    }
                    this.type = type;

                    var title = layer.title;

                    if (layer.graphics && layer.graphics.length > 0) {
                        var g = layer.graphics[0];
                        title = g.attributes && g.attributes.comment || title;
                        if (g.attributes && g.attributes.resultNumber) {
                            ct_css.toggleClass(this.domNode, "result" + g.attributes.resultNumber, true);
                        }
                    }

                    this.titleLabelNode.innerHTML = title;
//BartVerbeeck Bug29973
                    layer.title = title;
                    ct_css.toggleClass(this.domNode, type, true);

//                    this.set("sliderVisible", this.sliderVisible);
                    this.set("sliderVisible", layer.get("sliderVisible"));
                    if (this.visibilityControls) {
                        this._createVisibilityControls(layer);
                    }
                    if (this.removeControls) {
                        this._createRemoveControls(layer);
                    }

                    this._handler.connect(this.layerVisibilityButton, "onClick", this, function (evt) {
                        this._onSliderVisibleClick(evt);
                    });
                    var tt = new Tooltip({
                        label: this.i18n.transparency,
                        connectId: [this.layerVisibilityButton.domNode]
                    });
                    d_aspect.before(this, "destroy", function () {
                        tt.destroy();
                    });

                    this._onVisibilityChanged();
                    this._onScaleVisibilityChanged();
                    this._handler.connectP("visibilityWatch", this.layer, "visibleInMap",
                        "_onVisibilityChanged");
                    this._handler.connectP("visibilityWatch", this.layer, "visibleInScale",
                        "_onScaleVisibilityChanged"); // needed for RVV
//
                    if (service && type === ServiceTypes.POI) {
                        if (!this.type.match(this._searchPattern)) {
                            this._createInfoControls(layer, d_lang.hitch(this, function () {
                                this.onInfoClick({
                                    item: layer
                                });
                            }));
                        }
                        this._update();
                        this._handler.connect("updateCounts", this.layer.store, "onUpdateEnd", "_update");
                        if (this.enablePOIHighlighting) {
                            this._handler.connect("poi", this, "onMouseEnter", "_onPOIHover");
                            this._handler.connect("poi", this, "onMouseLeave", "_onPOILeave");
                        }
                    }

                    if (!this.type.match(this._searchPattern) && !layer.id.match(this._drawingPattern)) {
                        if ((service && type !== ServiceTypes.WMTS && type !== ServiceTypes.POI) ||
                            (layer.props && (layer.props.description || layer.props.metadataUrl))) {
                            this._createInfoControls(layer, d_lang.hitch(this, function () {
                                this.onInfoClick({
                                    item: layer
                                });
                            }));
                        }
                    }

                    this._handler.connectP(layer, "minScale", function (
                        name,
                        oldValue,
                        newValue
                        ) {
                        this._showLayerVisibility(layer, newValue);
                    });
                    this._handler.connectP(layer, "maxScale", function (
                        name,
                        oldValue,
                        newValue
                        ) {
                        this._showLayerVisibility(layer, null, newValue);
                    });
                    this._handler.connectP(layer, "title", function (
                        name,
                        oldValue,
                        newValue
                        ) {
                        this.titleLabelNode.innerHTML = newValue;
//BartVerbeeck Bug29973                        
                        this.layer.title = newValue;
                    });
                    this._showLayerVisibility(layer);

                    if (!this.showPOICounts) {
                        ct_css.switchVisibility(this.poiCountNode, false);
                    }
                    this._handler.connect("widget", this.clickNode, "onclick", "_handleOnWidgetClick");
                    this._handler.connect("widget", this.titleLabelNode, "onclick",
                        "_handleOnWidgetClick");
                    this._handler.connect("widget", this.iconNode, "onclick",
                        "_handleOnWidgetClick");
                    if (this._isMobile) {
                        touch.press(this.clickNode, d_lang.hitch(this, function (evt) {
                            this._handleOnWidgetClick(evt);
                        }));
                    }
                },

                onScaleChanged: function () {
                },

                _showLayerVisibility: function (
                    layer,
                    minScale,
                    maxScale
                    ) {
                    var scaleText;
                    minScale = minScale || layer.minScale;
                    maxScale = maxScale || layer.maxScale;
//BartVerbeeck Bug45593 rara dinges met zoomin en zoomuit
                    var Currentscale = this.mapState.getViewPort().getScale();
                    if (minScale && minScale > 0) {
                        if(Currentscale > minScale)
                        scaleText = d_string.substitute(this.i18n.visibleMinScale, {
                            scale: minScale
                        });
                    }
                    if (maxScale && maxScale > 0) {
                        if(Currentscale < maxScale)
                        scaleText = d_string.substitute(this.i18n.visibleMaxScale, {
                            scale: maxScale
                        });
                    }
                    if (scaleText) {
                        this.visibleScaleNode.innerHTML = scaleText;
                    } else {
                        ct_css.switchVisibility(this.visibleScaleNode, false);
                    }
                },

                _getTooltipLabel: function () {
                    return "<div class='ctLayerInfoTooltip'>" + ((this.layer.props && this.layer.props.description) || this.layer.title) + "</div>";
                },

                _showTooltip: function () {
                    var type = this.type;
                    if (type) {
                        return type.indexOf("INSPIRE") > -1 || type.indexOf("WMS") > -1 || type.indexOf("AGS") > -1 || type.indexOf("WMTS") > -1;
                    }
                    return false;
                },

                _update: function () {
                    var store = this.layer.store;
                    var qoptions = {
                        fromCache: true,
                        queryAll: true,
                        silent: true
                    };
                    var queryFunc = d_lang.hitch(this, function () {
                        store = this.layer.store;
                        ct_when(store.query({}, qoptions), function (res) {
                            if (res) {
                                this.set("count", res.length);
                                if (res[0]) {
                                    this.set("totalCount", res[0].totalCount);
                                }
                            }
                            if (this.type === "POI") {
                                var g = this.layer.graphicResolver.getDefault();
                                if (!this.symbolRenderer) {
                                    this.symbolRenderer = new POISymbolRenderer();
                                }
                                d_dom.empty(this.iconNode);
                                this.symbolRenderer.renderSymbol(this.iconNode, g);
                            }
                        }, this);
                    });
                    if (!store) {
                        this._handler.connectP(this.layer, "store", queryFunc);
                    } else {
                        queryFunc();
                    }
                },

                _setCountAttr: function (count) {
                    this.count = count;
                    this.countNode.innerHTML = this.i18n.shownPOIsLabel + " " + count;
                },
                _setTotalCountAttr: function (totalCount) {
                    this.totalCount = totalCount;
                    this.totalCountNode.innerHTML = this.i18n.totalPOIsLabel + " " + totalCount;
                },

                _onVisibilityChanged: function () {
                    // for some layers which are only visible on certain scale, this method is called on template change.
                    if (this.layer.visibleInMap) {
                        this._visibilityTooltip.set("label", this.i18n.switchLayerInvisible);
                        if (this.domNode) {
                            d_class.remove(this.domNode, "ctNotVisibleInMap");
                        }
                    } else {
                        if (this.layer.visibleInScale) {
                            this._visibilityTooltip.set("label", this.i18n.switchLayerVisible);
                        }
                        if (this.domNode) {
                            d_class.add(this.domNode, "ctNotVisibleInMap");
                        }
                    }
                },

                _onScaleVisibilityChanged: function () {
                    if (this.layer.visibleInScale) {
                        ct_css.switchVisibility(this.visibleScaleNode, false);
                        if (!this.layer.visibleInMap) {
                            this._visibilityTooltip.set("label", this.i18n.switchLayerVisible);
                        }
                    } else {
                        this._visibilityTooltip.set("label", this.i18n.notVisible);
//BartVerbeeck Bug32154                        
                        var Currentscale = this.mapState.getViewPort().getScale();
                        if(Currentscale > this.layer.minScale)
                                this.visibleScaleNode.innerHTML = this.i18n.visibleMinScale;
                        else if(Currentscale < this.layer.maxScale)
                                this.visibleScaleNode.innerHTML = this.i18n.visibleMaxScale;
                        ct_css.switchVisibility(this.visibleScaleNode, true);
                    }
                    this._button.set("disabled", !this.layer.visibleInScale);
                },

                _createInfoControls: function (
                    layer,
                    cb
                    ) {
                    var b = new Button({
                        iconClass: "icon-info-italic",
                        onClick: cb
                    }, this.infoButtonNode);
                    var tt = new Tooltip({
                        label: this.i18n.infoLayer,
                        connectId: [b.domNode]
                    });
                    d_aspect.before(this, "destroy", function () {
                        tt.destroy();
                    });
                },

                _createRemoveControls: function (layer) {
                    var b = new Button({
                        iconClass: "icon-trashcan",
                        onClick: d_lang.hitch(this, function () {
                            tt.destroy();
                            this.eventService.postEvent(this.topics.ON_WIDGET_REMOVE,
                                {layer: this.layer});
                            this.onRemoveClick({
                                layerId: layer.get("id")
                            });
                        })
                    }, this.removeButtonNode);
                    var tt = new Tooltip({
                        label: this.i18n.removeLayer,
                        connectId: [b.domNode]
                    });
                    d_aspect.before(this, "destroy", function () {
                        tt.destroy();
                    });
                },

                _createVisibilityControls: function (layer) {
                    var i18n = this.i18n;
                    var b = this._button = new Button({
                        iconClass: "ctIconVisibility",
                        onClick: d_lang.hitch(this, function () {
                            layer.get("enabled") ?
                                this._visibilityTooltip.set("label",
                                    i18n.switchLayerVisible) :
                                this._visibilityTooltip.set("label",
                                    i18n.switchLayerInvisible);
                            this.onVisibilityChange({
                                layerId: layer.get("id"),
                                itemNode: this.itemNode
                            });
                        })
                    }, this.visibilityButtonNode);
                    var tt = this._visibilityTooltip = new Tooltip({
                        label: "",
                        connectId: [b.domNode]
                    });
                    d_aspect.before(this, "destroy", function () {
                        tt.destroy();
                    });
                    layer.get("enabled") ?
                        this._visibilityTooltip.set("label", i18n.switchLayerInvisible) :
                        this._visibilityTooltip.set("label", i18n.switchLayerVisible);
                },

                _createOpacityControls: function (layer) {
                    //                this.transparencyLabelNode.innerHTML=this.i18n.transparencyLabel;
                    this.slider = new HorizontalSlider({
                        value: (layer.get("opacity") || 1),
                        minimum: 0,
                        maximum: 1,
                        intermediateChanges: true,
                        onChange: d_lang.hitch(this, function () {
                            this.onOpacityChange({
                                source: this
                            });
                        })
                    }, this.transparencySliderNode);

                    if (has("ie") >= 10) {
                        //IE 10/11 doesnt fire onmousedown anymore, need another dijit/typematic to do so
                        //probably to be removed with dojo 2.0
                        var myTypematic = {
                            addMouseListener: function (
                                /*DOMNode*/
                                node,
                                /*Object*/
                                _this,
                                /*Function*/
                                callback,
                                /*Number*/
                                subsequentDelay,
                                /*Number*/
                                initialDelay,
                                /*Number?*/
                                minDelay
                                ) {
                                var handles = [
                                    on(node, "pointerdown", d_lang.hitch(this, function (evt) {
                                        evt.preventDefault();
                                        d_typematic.trigger(evt, _this, node, callback, node, subsequentDelay,
                                            initialDelay,
                                            minDelay);
                                    })),
                                    on(node, "pointerup", d_lang.hitch(this, function (evt) {
                                        if (this._obj) {
                                            evt.preventDefault();
                                        }
                                        d_typematic.stop();
                                    })),
                                    on(node, "mouseout", d_lang.hitch(this, function (evt) {
                                        if (this._obj) {
                                            evt.preventDefault();
                                        }
                                        d_typematic.stop();
                                    })),
                                    on(node, "dblclick", d_lang.hitch(this, function (evt) {
                                        evt.preventDefault();
                                        if (has("ie") < 9) {
                                            d_typematic.trigger(evt, _this, node, callback, node, subsequentDelay,
                                                initialDelay, minDelay);
                                            setTimeout(d_lang.hitch(this, d_typematic.stop), 50);
                                        }
                                    }))
                                ];
                                return { remove: function () {
                                    d_array.forEach(handles, function (h) {
                                        h.remove();
                                    });
                                } };
                            }
                        };
                        this.slider.own(
                            myTypematic.addMouseListener(this.slider.decrementButton, this.slider, "_typematicCallback",
                                25,
                                500),
                            myTypematic.addMouseListener(this.slider.incrementButton, this.slider, "_typematicCallback",
                                25,
                                500)
                        );
                        //IE 10/11 don´t fire onMouseUp anymore... workaround
                        this._handler.connect("moverwidget", this.slider._movable, "onMoveStop", function () {
                            this.onOpacityChanged({
                                source: this
                            });
                        });
                    }

                },
                _onSliderVisibleClick: function (evt) {
                    this._sliderVisible = !this._sliderVisible;
                    this.onSliderVisibilityChanged({
                        sliderVisible: this._sliderVisible,
                        source: this
                    });
                },

                onSliderVisibilityChanged: function (evt) {
                },
                _onPOIHover: function (evt) {
                    this.eventService.postEvent(this.topics.ON_POI_HOVER, {item: this.layer});
                },

                _onPOILeave: function (evt) {
                    this.eventService.postEvent(this.topics.ON_POI_LEAVE, {item: this.layer});
                },

                onOpacityChange: function (evt) {
                },
                onOpacityChanged: function (evt) {
                },
                onVisibilityChange: function (evt) {
                },
                onRemoveClick: function (evt) {
                },
                onInfoPOIClick: function (evt) {
                },
                onInfoClick: function (ev) {
                },

                setSliderValue: function (val) {
                    if (this.slider) {
                        this.slider.set("value", val);
                    }
                },

                _setSliderVisibleAttr: function (val) {
//                    this.sliderVisible = val;
                    this.layer.set("sliderVisible", val);
                    ct_css.switchVisibility(this.sliderNode, val);
                },

                getSliderValue: function () {
                    return this.slider.get("value");
                },

                _handleOnWidgetClick: function (evt) {
                    // var counter is used to avoid double execution
                    if (this._counter === 1) {
                        this._counter--;
                    }
                    if (this._counter < 1) {
                        if (this.layer && (this.layer.nodeType || this.type === "SEARCH_RESULT_POI")) {
                            this.eventService.postEvent(this.topics.ON_WIDGET_CLICK, {layer: this.layer});
                            this._counter++;
                        }
                    }
                    if (this._counter > 1) {
                        this._counter = 0;
                    }
                },

                destroy: function () {
                    this.inherited(arguments);
                    if (this._handler) {
                        this._handler.disconnect();
                    }
                    if (this.slider) {
                        this.slider.destroyRecursive();
                    }
                }

            });
    });