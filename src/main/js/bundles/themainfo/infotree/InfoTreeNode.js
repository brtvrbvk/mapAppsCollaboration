/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 04.08.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "base/ui/controls/drilldowntree/TreeNode",
        "base/util/units",
        "ct/util/css",
        "ct/async",
        "dijit/form/ToggleButton",
        "dijit/Tooltip",
        "dojo/dom-construct",
        "dojo/dom-class",
        "base/util/POISymbolRenderer",
        "dojo/text!./templates/InfoTreeNode.html"
    ],
    function (
        declare,
        d_lang,
        TreeNode,
        units,
        css,
        ct_async,
        ToggleButton,
        Tooltip,
        d_domConstruct,
        d_domClass,
        POISymbolRenderer,
        templateString
        ) {
        return declare([TreeNode],
            {

                templateString: templateString,

                constructor: function () {

                },

                postCreate: function () {
                    this.inherited(arguments);
                    if (!this.symbolRenderer) {
                        this.symbolRenderer = new POISymbolRenderer();
                    }
                    var mn = this.modelNode;
                    if (mn.service && mn.service.serviceType === "POI") {
                        if (this.checked) {
                            this.renderPOILegendIcon();
                        } else {
                            this.clearPOILegendIcon();
                        }
                    }
                    if (mn.category && mn.category.isHeader) {
                        css.switchHidden(this.resultInfoNode, true);
                        this.resultInfoNode.innerHTML = "";
                    } else {

                        var layer = (mn.children && mn.children.length === 1 && mn.children[0]) || mn;

                        this._listeners.connectP("results", layer, "nearestFeature",
                            this._updateNearestFeature);
                        if (layer.nearestFeature !== undefined) {
                            this._updateNearestFeature("", this.i18n.loading, layer.nearestFeature);
                        }
                    }
                },

                _updateScaleVisibility: function (
                    attributeName,
                    oldVal,
                    newVal
                    ) {
                    css.toggleClass(this.domNode, "ctNotVisibleInMap", !newVal);
                    if (this._tooltip) {
                        this._tooltip.destroy();
                        this._tooltip = null;
                    }
                    if (this._identifyNotPossibleTT) {
                        this._identifyNotPossibleTT.destroy();
                        this._identifyNotPossibleTT = null;
                    }
                    if (newVal !== undefined && !newVal) {
                        this._tooltip = new Tooltip({label: this.i18n.notVisibleTooltip});
                        this._tooltip.addTarget(this.domNode);
                    }
                    this._resultButton.set("disabled", !newVal);
                    this._visible = newVal;
                },

                _onNodeClick: function (evt) {

                    this.inherited(arguments);
                    if (this._toggleButton && this._toggleButton.get("checked")) {
                        this.renderPOILegendIcon();
                        var mapModelNode = this.mapModel.getNodeById(this.modelNode.id);
                        this._listeners.connectP("visibility", mapModelNode, "visibleInScale",
                            this._updateScaleVisibility);
                        this._updateScaleVisibility("", "", mapModelNode.visibleInScale);
                    } else {
                        this.clearPOILegendIcon();
                        this._listeners.disconnect("visibility");
                    }

                },

                _updateNearestFeature: function (
                    attr,
                    oldVal,
                    newVal
                    ) {

                    if (this._resultButton) {
                        this._resultButton.destroy();
                        this._resultButton = null;
                    }

                    if (newVal !== undefined && newVal) {
                        css.switchHidden(this.resultInfoNode, false);
                        if (newVal.title) {
                            d_domConstruct.empty(this.resultInfoNode);
                            var distanceString = units.getDistanceStringMetric(newVal.distance / 1000, 1);
                            var toggleBtn = this._resultButton = new ToggleButton({
                                label: newVal.title + " op " + distanceString,
                                iconClass: "",
                                'class': "convertButtonToLink",
                                checked: this.modelNode.get("enabled")
                            }, d_domConstruct.create("div", {}, this.resultInfoNode));
//                            this._listeners.connect("button", toggleBtn, "onChange", "_onNodeClick");
                            this._listeners.connect("button", toggleBtn, "onClick", "_onIdentifyClick");
                        } else {
                            this.resultInfoNode.innerHTML = newVal;
                        }
                    } else {
                        css.switchHidden(this.resultInfoNode, true);
//                        this.resultInfoNode.innerHTML = this.i18n.noResult;
                    }

                },

                _onIdentifyClick: function () {

                    if (!this.modelNode.get("enabled")) {
                        this._toggleButton.set("checked", true);
                        this._onNodeClick(true);
                    }
                    ct_async.hitch(this, function () {
                        if (this._visible) {
                            this.onIdentifyClick(this.modelNode);
                        } else {
                            this._tooltip.open(this.domNode);
                        }
                    }, 200)();
                },

                onIdentifyClick: function () {
                },

                renderPOILegendIcon: function () {
                    var mapModelNode = this.mapModel.getNodeById(this.modelNode.id);
                    if (mapModelNode) {
                        this._render(mapModelNode.graphicResolver);
                    }
                },

                _render: function (graphicResolver) {
                    if (graphicResolver) {
                        var g = graphicResolver.getDefault();
                        d_domClass.add(this.iconNode, "ctPOILegendIcon");
                        this.symbolRenderer.renderSymbol(this.iconNode, g);
                    }
                },

                clearPOILegendIcon: function () {
                    d_domClass.remove(this.iconNode, "ctPOILegendIcon");
                    d_domConstruct.empty(this.iconNode);
                }
            }
        );
    }
);