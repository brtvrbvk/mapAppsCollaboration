/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 11.02.14
 * Time: 09:10
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/string",
        "dojo/aspect",
        "ct/array",
        "ct/request",
        "ct/_when",
        "ct/Stateful",
        "ct/_Connect",
        "ct/mapping/mapcontent/ServiceTypes",
        "base/util/css",
        "base/analytics/AnalyticsConstants",
        "dijit/Tooltip",
        "./ImageMenuItem",
        "dojo/Evented"
    ],
    function (
        declare,
        d_array,
        d_lang,
        d_string,
        aspect,
        ct_array,
        ct_request,
        ct_when,
        Stateful,
        Connect,
        ServiceTypes,
        agiv_css,
        AnalyticsConstants,
        Tooltip,
        ImageMenuItem,
        Evented
        ) {
        return declare([
                Stateful,
                Connect
            ],
            {

                fetchBaselayerCapabilitiesOnStartup: true,
                transitionTime: 2000,

                constructor: function () {

                },

                activate: function () {

                    this.imageSelector = this.timeSlider.imageSelector;
                    this.timeSliderBar = this.timeSlider.timeSliderBar;

                    if (this.rootNode) {
                        this.root = this.mapModel.getNodeById(this.rootNode);
                    } else {
                        this.root = this.mapModel.getOperationalLayer();
                    }

                    this._createSelectionItems();

                    this.connect("menu", this.imageSelector, "onItemClick", "_onItemClick");

                    this.timeSliderBar.on("pause", d_lang.hitch(this, this._onPause));
                    this.timeSliderBar.on("start", d_lang.hitch(this, this._onStart));
                    this.timeSliderBar.on("sliderChange", d_lang.hitch(this, this._onSliderValueChange));

                    if (this.fetchBaselayerCapabilitiesOnStartup) {

                        var servicenodes = this.mapModel.getServiceNodes(this.root);

                        window.capabilitiesMap = window.capabilitiesMap || {};

                        d_array.forEach(servicenodes, function (service) {
                            var s = service.service;
                            //check if we can and should fetch the capabilities
                            if (s.serviceType === ServiceTypes.WMTS && !window.capabilitiesMap[s.serviceUrl]) {
                                window.capabilitiesMap[s.serviceUrl] = true;
                                //esri api wants text...
                                ct_when(ct_request.request({
                                    handleAs: "text",
                                    url: s.serviceUrl + "?SERVICE=WMTS&REQUEST=GetCapabilities&VERSION=1.0.0"
                                }), function (resp) {

                                    window.capabilitiesMap[s.serviceUrl] = resp;

                                }, function (err) {
                                    console.error(err);
                                    delete window.capabilitiesMap[s.serviceUrl];
                                }, this);
                            }

                        }, this);

                    }

                },

                _createSelectionItems: function () {
                    var layers = this.layers = this.root.get("children");
                    this._items = [];
                    var selectedLayer;

                    d_array.forEach(layers, function (bl) {

                        var cat = bl.category;
                        var year = cat && cat.description;
                        if (year) {
                            year = year.split(",");
                            year = year[year.length - 1];
                            year = d_string.trim(year);
                        }

                        var item = new ImageMenuItem({
                            label: year || "",
                            overlayLabel: cat.title || bl.title,
                            value: bl.id,
                            'class': bl.id,
                            index: this._items.length
                        });

                        var tooltip = cat.description || bl.description;
                        if (tooltip) {
                            tooltip = new Tooltip({
                                connectId: [item.domNode],
                                label: tooltip
                            });
                            aspect.before(item, "destroy", function () {
                                tooltip.destroy();
                            });
                        }

                        agiv_css.createSelector(".ctImageSelectorWidget .dijitMenuItem." + bl.id + " .dijitMenuItemIconCell",
                                "background-image:url('" + cat.imgUrl + "');background-position:0px 0px;");

                        this._items.push(item);

                        this.imageSelector.addChild(item);

                        if (bl.enabled) {
                            if (!selectedLayer) {
                                selectedLayer = this._items.length - 1;
                                selectedLayer = selectedLayer + bl.get("opacity");
                            }
                        }

                    }, this);

                    this.timeSliderBar.set("minimum", 0);
                    this.timeSliderBar.set("maximum", this._items.length);

                    this.timeSliderBar.set("value", selectedLayer > 1 ? selectedLayer : 0.5);
                },

                _onStart: function () {
                    var interval = 100;
                    var tansitiontime = this.transitionTime || 4000;
                    var step = 1 / (tansitiontime / interval);

                    this.intervalTimer = setInterval(d_lang.hitch(this, function () {

                        var newval = this.timeSliderBar.get("value") + step;
                        if (newval < this.timeSliderBar.get("maximum")) {
                            this.timeSliderBar.set("value", newval);
                        } else {
                            this.timeSliderBar.set("value", this.timeSliderBar.get("minimum"));
                        }

                    }), interval);

                    if (this.eventService) {
                        this.eventService.postEvent(AnalyticsConstants.TOPICS.TRACK_EVENT, {
                            eventType: AnalyticsConstants.EVENT_TYPES.SLIDER_PLAY,
                            eventCategory: AnalyticsConstants.CATEGORIES.SLIDER,
                            eventValue: ""
                        });
                    }
                },

                _onModelStructureChange: function () {

                    this.imageSelector.clear();
                    this._createSelectionItems();
                    this.timeSlider.updateLayout();

                },

                _onPause: function () {
                    clearInterval(this.intervalTimer);
                },

                _onItemClick: function (item) {

                    this.timeSliderBar.set("value", item.index + 0.5);

                },

                _findMenuIdxForID: function (id) {
                    return ct_array.arrayFirstIndexOf(this._items, {value: id});
                },

                encodeURLParameter: function () {
                    return {};
                },

                decodeURLParameter: function () {

                    var sel = this._findSelectedIndex();
                    if (sel && this.timeSliderBar) {
                        this.timeSliderBar.set("value", sel.idx + sel.layer.get("opacity"));
                    }

                },

                _findSelectedIndex: function () {
                    var layers = ct_array.arraySearch(this.layers, {
                        enabled: true
                    });
                    if (layers.length === 1) {

                        var idx = this._findMenuIdxForID(layers[0].id),
                            item = this._items[idx]
                        this.imageSelector.set("selected", item, idx);

                    } else if (layers.length === 2) {

                        var op1 = this._getAttributeFromLayer(layers[0], "opacity"),
                            op2 = this._getAttributeFromLayer(layers[1], "opacity");
                        var current;
                        if (op1 > op2) {
                            current = layers[0];
                        } else {
                            current = layers[1];
                        }

                        var idx = this._findMenuIdxForID(current.id),
                            item = this._items[idx];

                        return {
                            idx: idx,
                            layer: current,
                            item: item
                        }

                    } else {
                        console.debug("too many/less layers", layers);
                    }
                    return null;
                },

                _onModelNodeStateChange: function () {

                    if (this.imageSelector) {

                        var sel = this._findSelectedIndex();
                        if (sel) {
                            this.imageSelector.set("selected", sel.item, sel.idx);
                        }

                    }

                },

                _onSliderValueChange: function (evt) {

                    var value = Math.round(evt.value * 10000) / 10000;

                    d_array.forEach(this.layers, function (bl) {
                        bl.set("enabled", false);
                    });

                    var indexLeft = Math.floor(value - 0.5);
                    var indexRight = Math.floor(value);
                    if (indexLeft < 0) {
                        indexLeft = 0;
                        indexRight++;
                    }
                    if (indexLeft === indexRight) {
                        indexRight++;
                    }

                    var leftLayer = this.layers[indexLeft];
                    var rightLayer = this.layers[indexRight];

                    var raise = function (
                        x,
                        map
                        ) {
                        var f = ((map * -100) + 50 + (x * 100)) / 100;
                        if (f < 0 || f > 1) {
                            return 0;
                        }
                        return f;
                    };
                    var fall = function (
                        x,
                        map
                        ) {
                        var f = ((map * 100) + 150 - (x * 100)) / 100;
                        if (f < 0 || f > 1) {
                            return 0;
                        }
                        return f;
                    };

                    //check what function (raise or fall) we need for left value
                    var isLeftRaise = (value - indexLeft) > 0.5 ? false : true;
                    var opacityR, opacityL;
                    if (isLeftRaise) {

                        opacityL = raise(value, indexLeft);
                        opacityR = fall(value, indexRight);

                    } else {

                        opacityL = fall(value, indexLeft);
                        opacityR = raise(value, indexRight);

                    }

                    if (leftLayer) {
                        this._setAttributesOnLayer(leftLayer, opacityL);
                    }
                    if (rightLayer) {
                        this._setAttributesOnLayer(rightLayer, opacityR);
                    }

                    if (!this._timer) {

                        this._timer = setTimeout(d_lang.hitch(this, function () {

                            this.mapModel.fireModelNodeStateChanged({
                                source: this
                            });

                            this._timer = null;

                        }), 75)

                    }
                },

                _getAttributeFromLayer: function (
                    layer,
                    attr
                    ) {

                    if (layer.service) {
                        return layer.get(attr);
                    }
                    var res = null;
                    d_array.forEach(layer.children, function (l) {
                        res = l.get(attr);
                    }, this);
                    return res;

                },

                _setAttributesOnLayer: function (
                    layer,
                    opacity
                    ) {

                    layer.set("enabled", true);

                    if (layer.service) {
                        layer.set("opacity", opacity);
                    } else {
                        d_array.forEach(layer.children, function (l) {
                            this._setAttributesOnLayer(l, opacity);
                        }, this);
                    }

                }
            }
        )
    }
);