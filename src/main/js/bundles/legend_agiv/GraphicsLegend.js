/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 22.11.13
 * Time: 11:49
 */
define([
        "dojo/_base/declare",
        "ct/_Connect",
        "ct/array",
        "dojo/_base/array",
        "dojo/dom-construct",
        "dojo/dom-class",
        "base/util/POISymbolRenderer",
//    "dojo/string",
//    "dojo/dom-class",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dojo/text!./templates/GraphicsLegend.html"
    ],
    function (
        declare,
        Connect,
        ct_array,
        d_array,
        d_dom,
        d_class,
        POISymbolRenderer,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        templateString
        ) {
        return declare([
                _WidgetBase,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {

                templateString: templateString,
                baseClass: "ctGraphicLegend",
                _skipGraphicNodeIds: ["pointer", "radiusCircle", "radiusLabel", "IGNORE"],

                constructor: function () {

                },

                postCreate: function () {

                    this.inherited(arguments);
                    this._handler = new Connect({
                        defaultConnectScope: this
                    });

                    if (!this.symbolRenderer) {
                        this.symbolRenderer = new POISymbolRenderer();
                    }

                },

                show: function () {

                    this._handler.connect("mapmodel", this.mapModel, "onModelStructureChanged",
                        this._update);
                    this._handler.connect("mapmodel", this.mapModel, "onModelNodeStateChanged",
                        this._update);
                    this._update();

                },

                hide: function () {

                    this._handler.disconnect();

                },

                refresh: function () {
                    this._update();
                },

                __renderPriorityComparator: function (
                    a,
                    b
                    ) {
                    a = Number(a.get("renderPriority"));
                    b = Number(b.get("renderPriority"));
                    if (!a && !b) {
                        return 0;
                    }
                    if (!a && b) {
                        return 1;
                    }
                    else if (!b && a) {
                        return -1;
                    }
                    else if (a < b) {
                        return 1;
                    }
                    else if (a == b) {
                        return 0;
                    }
                    return -1;
                },

                _checkSkipNode: function (nodeId) {
                    return d_array.some(this._skipGraphicNodeIds, function(skipNodeId) {
                        return nodeId.indexOf(skipNodeId) > -1;
                    });
                },

                getGraphicLegendNodes: function () {
                    var gpNodes = this.mapModel.getGlassPaneLayer().filterNodes(function (node) {
                        if (this._checkSkipNode(node.id)) {
                            return null;
                        }

                        //get search result and other stuff
                        if (node.nodeType) {
                            if ((node.nodeType.indexOf("SEARCH_RESULT") > -1) ||
                                (node.nodeType.indexOf("RESULT_IDENTIFY") > -1) ||
                                (node.nodeType.indexOf("POLYGON") > -1) ||
                                (node.nodeType.indexOf("TEXT") > -1) ||
                                (node.nodeType.indexOf("POINT") > -1 && this._skipGraphicNodeIds.indexOf(node.id) === -1) ||
                                (node.nodeType.indexOf("POLYLINE") > -1)
                                ) {
                                return node;
                            }
                        }
                        return null;
                    }, this);
                    var opNodes = this.mapModel.getOperationalLayer().filterNodes(function (node) {
                        //get pois and gipod
                        if (node.service && node.service.serviceType === "POI") {
                            return node;
                        }
                        return null;
                    }, this);

                    return gpNodes.concat(opNodes);

                },

                _update: function () {

                    d_dom.empty(this.containerNode);

                    var items = this.getGraphicLegendNodes();
                    if (items.length === 0) {

                        this.containerNode.innerHTML = this.i18n.ui.noGraphicLegend;
                        return;

                    }
                    items = ct_array.arraySort(items, this.__renderPriorityComparator);

                    d_array.forEach(items, function (item) {

                        var domnode = d_dom.create("div", {
                            'class': "ctGraphicsLegendItem"
                        }, this.containerNode);
                        var iconNode = d_dom.create("span", {
                            'class': 'ctLegendIcon iconNode'
                        }, domnode);
                        var labelnode = d_dom.create("span", {
                            'class': 'ctLegendLabel',
                            innerHTML: item.title || item.id
                        }, domnode);

                        if (item.service && item.service.serviceType === "POI") {

                            var g = item.graphicResolver.getDefault();
                            d_class.add(iconNode, "ctPOILegendIcon");
                            this.symbolRenderer.renderSymbol(iconNode, g);

                        } else if (item.nodeType) {
                            var nodeType = item.nodeType;
                            if ((nodeType.indexOf("SEARCH_RESULT") > -1) ||
                                (nodeType.indexOf("RESULT_IDENTIFY") > -1) ||
                                (nodeType.indexOf("POLYGON") > -1) ||
                                (nodeType.indexOf("POINT") > -1) ||
                                (nodeType.indexOf("TEXT") > -1) ||
                                (nodeType.indexOf("POLYLINE") > -1)
                                ) {

                                if (item.graphics && item.graphics.length > 0) {
                                    var g = item.graphics[0];
                                    labelnode.innerHTML = g.attributes && g.attributes.comment || item.title || item.id;
                                    if (g.attributes && g.attributes.resultNumber) {
                                        d_class.add(domnode, "result" + g.attributes.resultNumber);
                                    }
                                }

                                d_class.add(domnode, nodeType);
                                d_class.add(iconNode, nodeType);

                            }
                        }

                    }, this);

                }
            }
        )
    }
);