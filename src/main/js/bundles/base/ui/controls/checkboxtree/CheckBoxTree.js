define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dojo/_base/event",
        "ct/_Connect",
        "ct/mapping/mapcontent/ServiceTypes",
        "dijit/Tree",
        "./CheckBoxTreeNode",
        "dijit/Tooltip"
    ],
    function (
        declare,
        d_array,
        d_domclass,
        d_domconstruct,
        d_domevent,
        _Connect,
        ServiceTypes,
        Tree,
        CheckBoxTreeNode,
        Tooltip
        ) {

        /*
         * COPYRIGHT 2011 con terra GmbH Germany
         */

        var getMapPreviewUrl = function (node) {
            var imgUrl;
            if (node.category && node.category.imgUrl) {
                imgUrl = node.category.imgUrl;
            } else if (node.service && node.props && node.props.imgUrl) {
                imgUrl = node.props.imgUrl;
            }
            if (imgUrl) {
                var div = d_domconstruct.create("div");
                d_domconstruct.create("img", {
                    "src": imgUrl,
                    "width": "200",
                    "class": "ctContentManagerMapTooltip"
                }, div);
                return div.innerHTML;
            } else if (node.category && node.category.description) {
                div = d_domconstruct.create("div");
                d_domconstruct.create("span", {
                    "innerHTML": node.category.description,
                    "class": "ctContentManagerMapTooltip"
                }, div);
                return div.innerHTML;
            }
            return null;
        }

        return declare([Tree],
            {
                OPERATIONAL_LAYER: "__operationallayer__",

                constructor: function () {
                    this._listeners = new _Connect();
                    this.inherited(arguments);
                },

                _createTreeNode: function (args) {
                    args.i18n = this.i18n;
                    var treenode = new CheckBoxTreeNode(args);
                    var item = args.item;

                    var tooltipHtml = getMapPreviewUrl(item);
                    var mapTooltip;
                    if (tooltipHtml) {
                        mapTooltip = new Tooltip({
                            label: tooltipHtml,
                            connectId: [treenode.contentNode]
                        });
                        mapTooltip.connect(treenode, "destroy", "destroy");
                    }

                    treenode.connect(treenode, "_updateItemClasses", function (node) {
                        var enabled = node.get("enabled");
                        treenode.setChecked(enabled);
                    });
                    var that = this;
                    treenode.connect(treenode, "onMouseEnter", function (node) {
                        if (treenode.item && treenode.item.service && treenode.item.service.serviceType == ServiceTypes.POI) {
                            that.onPOIHover(treenode.item);
                        }
                    });
                    treenode.connect(treenode, "onMouseLeave", function (node) {
                        if (treenode.item && treenode.item.service && treenode.item.service.serviceType == ServiceTypes.POI) {
                            that.onPOILeave(treenode.item);
                        }
                    });

                    return treenode;
                },

                onPOIHover: function (item) {
                },
                onPOILeave: function (item) {
                },

                /**
                 * OVERWRITE: to handle onClick events from checkbox and labelNode
                 */
                _onClick: function (
                    /*TreeNode*/
                    nodeWidget,
                    /*Event*/
                    e
                    ) {
                    var domElement = e.target,
                        isExpandoClick = this.isExpandoNode(domElement, nodeWidget);
                    var domContains = d_domclass.contains;

                    if ((this.openOnClick && nodeWidget.isExpandable) || isExpandoClick) {
                        // expando node was clicked, or label of a folder node was clicked; open it
                        if (nodeWidget.isExpandable) {
                            this._onExpandoClick({
                                node: nodeWidget
                            });
                        }
                    }
                    /***************** BEGIN *****************/
                    else if (domElement.nodeName === "DIV" && domContains(domElement, "dijitTreeRow")) {
                        // click on rowNode, do nothing
                    }
                    else if (domElement.nodeName === "SPAN" && (domContains(domElement,
                        "ctContentItemMainCategoryLabel") || domContains(domElement,
                        "ctContentItemLeafNodeLabel") || domContains(domElement,
                        "ctContentItemInfoIcon") || domContains(domElement,
                        "ctContentItemCategoryLabel"))) {
                        // click on mainCategory label, category label, leafNode label, and info icon, do nothing
                    }
                    /****************** END ******************/
                    else {
                        this._publish("execute", {
                            item: nodeWidget.item,
                            node: nodeWidget,
                            evt: e
                        });
                        // click on checkbox, service label
                        if (domElement.nodeName === "SPAN" && (domContains(domElement,
                            "ctContentItemStateIcon") || domContains(domElement,
                            "ctContentItemServiceLabel"))) {
                            this._onLayerChange(nodeWidget.item, nodeWidget, e);
                        }
                        this.onClick(nodeWidget.item, nodeWidget, e);
                        this.focusNode(nodeWidget);
                    }
                    d_domevent.stop(e);
                },

                /**
                 * OVERWRITE: to handle onClick events from checkbox and labelNode
                 */
                _onDblClick: function (
                    /*TreeNode*/
                    nodeWidget,
                    /*Event*/
                    e
                    ) {
                    var domElement = e.target,
                        isExpandoClick = (domElement == nodeWidget.expandoNode || domElement == nodeWidget.expandoNodeText);
                    var domContains = d_domclass.contains;

                    if ((this.openOnDblClick && nodeWidget.isExpandable) || isExpandoClick) {
                        // expando node was clicked, or label of a folder node was clicked; open it
                        if (nodeWidget.isExpandable) {
                            this._onExpandoClick({
                                node: nodeWidget
                            });
                        }
                    }
                    /***************** BEGIN *****************/

                    else if (domElement.nodeName === "DIV" && domContains(domElement, "dijitTreeRow")) {
                        // click on rowNode, do nothing
                    }
                    else if (domElement.nodeName === "SPAN" && (domContains(domElement,
                        "ctContentItemMainCategoryLabel") || domContains(domElement,
                        "ctContentItemLeafNodeLabel") || domContains(domElement,
                        "ctContentItemInfoIcon") || domContains(domElement,
                        "ctContentItemCategoryLabel"))) {
                        // click on mainCategory label, category label, leafNode label, and info icon, do nothing
                    }
                    /****************** END ******************/
                    else {
                        this._publish("execute", {
                            item: nodeWidget.item,
                            node: nodeWidget,
                            evt: e
                        });
                        // click on checkbox, service label
                        if (domElement.nodeName === "SPAN" && (domContains(domElement,
                            "ctContentItemStateIcon") || domContains(domElement,
                            "ctContentItemServiceLabel"))) {
                            this._onLayerChange(nodeWidget.item, nodeWidget, e);
                        }
                        this.onDblClick(nodeWidget.item, nodeWidget, e);
                        this.focusNode(nodeWidget);
                    }
                    d_domevent.stop(e);
                },

                _onLayerChange: function (
                    item,
                    node,
                    evt
                    ) {
                    var enabled = item.get("enabled");
                    if (item.category) {
                        if (enabled) {
                            this.tree._collapseNode(node);
                        } else {
                            this.tree._expandNode(node);
                        }
                        var children = item.get("children");
                        // if it has children, expand/collapse child nodes
                        if (children && children.length > 0) {
                            this._traverseChildNodes(node.getChildren(), enabled);
                        }
                    }
                },

                // see http://dojo-toolkit.33424.n3.nabble.com/tree-collapse-disables-expand-ability-td1295330.html
                _traverseChildNodes: function (
                    childNodes,
                    enabled
                    ) {
                    d_array.forEach(childNodes, function (n) {
                        if (n.item.category) {
                            if (enabled) {
                                this.tree._collapseNode(n);
                            } else {
                                this.tree._expandNode(n);
                            }
                        }
                        var newChildNodes = n.getChildren();
                        if (newChildNodes && newChildNodes.length > 0) {
                            this._traverseChildNodes(newChildNodes, enabled);
                        }
                    }, this);
                },

                destroy: function () {
                    this.inherited(arguments);
                }

            });
    });