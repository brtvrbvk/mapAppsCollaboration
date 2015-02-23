define([
        "dijit",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-class",
        "dojo/dom-construct",
        "dijit/TooltipDialog",
        "dijit/popup",
        "ct/util/css",
        "ct/_Connect",
        "../drilldowntree/NodeInfoWidget"
    ],

    function (
        dijit,
        declare,
        d_lang,
        d_domclass,
        d_domconstruct,
        TooltipDialog,
        popup,
        css,
        _Connect,
        NodeInfoWidget
        ) {
        /*
         * COPYRIGHT 2011 con terra GmbH Germany
         */
        return declare([dijit._TreeNode], {
            OPERATIONAL_LAYER: "__operationallayer__",
            _stateIconNode: null,

            constructor: function (args) {
                this._listeners = new _Connect();
                this.inherited(arguments);
            },

            postCreate: function () {
                this.inherited(arguments);
                this._oldClick = this._onClick;
                this._createNode(this.item);
            },

            _updateItemClasses: function () {
                this.inherited(arguments);
                if (this.isExpanded) {
                    d_domclass.add(this.domNode, "ctTreeNodeOpened");
                    d_domclass.remove(this.domNode, "ctTreeNodeClosed");
                } else {
                    d_domclass.remove(this.domNode, "ctTreeNodeOpened");
                    d_domclass.add(this.domNode, "ctTreeNodeClosed");
                }
            },

            _createNode: function (item) {
                this.iconNode.src = "";
                this.item = item;
                if (item.get("layer")) {
                    // leaf node, don't show checkbox
                    d_domclass.add(this.labelNode, "ctContentItemLeafNodeLabel");
                }
                if (item.get("service")) {
                    // service/layer node
                    d_domclass.add(this.domNode, "ctContentLeaf");
                    d_domclass.remove(this.expandoNode,
                        "dijitTreeExpando dijitTreeExpandoClosed dijitTreeExpandoOpened");
                    d_domclass.add(this.labelNode, "ctContentItemServiceLabel");
                    this._createContentNode(item);
                }
                if (item.get("category")) {
                    d_domclass.add(this.domNode, "ctContentCategory");
                    // category node
                    if (item.get("id") !== this.OPERATIONAL_LAYER && (item.get("parent") && item.get("parent").get("id") !== this.OPERATIONAL_LAYER)) {
                        d_domclass.add(this.labelNode, "ctContentItemCategoryLabel");
                        this._createContentNode(item);
                    } else {
                        d_domclass.add(this.labelNode, "ctContentItemMainCategoryLabel");
                        // this._onClick = function(nodeWidget, e) {
                        //     debugger;
                        //     var domElement = e.target,
                        //         isExpandoClick = this.isExpandoNode(domElement, nodeWidget);

                        //     if ((this.openOnClick && nodeWidget.isExpandable) || isExpandoClick) {
                        //         // expando node was clicked, or label of a folder node was clicked; open it
                        //         if (nodeWidget.isExpandable) {
                        //             this._onExpandoClick({
                        //                 node: nodeWidget
                        //             });
                        //         }
                        //     }
                        // };

                    }
                }
            },

            _createContentNode: function (item) {
                this._stateIconNode = this._createStateIconNode(item);
                if (this._stateIconNode) {
                    d_domconstruct.place(this._stateIconNode, this.expandoNode, "before");
                }
                this._createLinkNode(item);
            },

            _createStateIconNode: function (item) {
                var stateIconNode = null;
                var stateIconNodeClass = "ctContentItemStateIcon ";
                stateIconNodeClass += (item.enabled) ? "ctContentItemChecked" : "ctContentItemUnchecked";
                stateIconNode = d_domconstruct.create("span", {
                    "class": stateIconNodeClass
                });
                return stateIconNode;
            },

            _createLinkNode: function (item) {
                var tt = this.createInfoTooltip(item);
                if (item.props && item.props.description && item.service && item.service.serviceType != "POI") {
                    var linkNode = d_domconstruct.create("span", {
                        "innerHTML": "i",
                        "class": "ctContentItemInfoIcon",
                        "onmouseover": d_lang.hitch(this, function () {
                            this._mouseOverTooltip = false;
                            popup.open({
                                popup: tt,
                                around: this.expandoNode,
                                orient: [
                                    {
                                        aroundCorner: "ML",
                                        corner: "MR"
                                    }
                                ]
                            });
                        }),
                        "onmouseout": d_lang.hitch(this, function () {
                            setTimeout(d_lang.hitch(this, function () {
                                if (!this._mouseOverTooltip) {
                                    popup.close(tt);
                                }
                            }), 1000);
                        })
                    });
                    d_domconstruct.place(linkNode, this.contentNode, "after");
                }
            },

            createInfoTooltip: function (item) {
                var infowidget = new NodeInfoWidget({
                    i18n: this.i18n,
                    item: item
                });
                this._listeners.connect("tooltip", infowidget, "onCloseClick", this, function () {
                    popup.close(tooltip);
                    this._mouseOverTooltip = false;
                });
                var tooltip = new TooltipDialog({
                    content: infowidget,
                    baseClass: "ctLayerInfoTooltip ctHideConnector"
                });
                this._listeners.connect("tooltipenter", tooltip, "onMouseEnter", this, function () {
                    this._mouseOverTooltip = true;
                });
                this._listeners.connect("tooltipleave", tooltip, "onMouseLeave", this, function () {
                    this._mouseOverTooltip = false;
                    setTimeout(d_lang.hitch(this, function () {
                        if (!this._mouseOverTooltip) {
                            popup.close(tooltip);
                        }
                    }), 1000);
                });
                return tooltip;
            },

            setChecked: function (checked) {
                if (this._stateIconNode) {
                    css.replaceClass(this._stateIconNode, "ctContentItemChecked", "ctContentItemUnchecked", checked);
                }
            },

            destroy: function () {
                this._stateIconNode = null;
                this.inherited(arguments);
            }

        });
    });