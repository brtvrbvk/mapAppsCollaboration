/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 31.07.13
 * Time: 12:56
 */
define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/string",
        "dojo/dom-construct",
        "dojo/dom-class",
        "dijit/_Widget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "ct/util/css",
        "dijit/TooltipDialog",
        "dijit/popup",
        "ct/_Connect",
        "dijit/form/Button",
        "dijit/form/ToggleButton",
        "ct/mapping/mapcontent/ServiceTypes",
        "dijit/Tooltip",
        "dojo/text!./templates/TreeNode.html"
    ],
    function (
        declare,
        d_lang,
        d_string,
        d_dom,
        d_class,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        ct_css,
        TooltipDialog,
        popup,
        Connect,
        Button,
        ToggleButton,
        ServiceTypes,
        Tooltip,
        templateString
        ) {
        return declare([
                _Widget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            {

                templateString: templateString,

                i18n: {
                    categorytooltip: "Toon ${category}",
                    layertooltip: "${description}"
                },

                constructor: function () {
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this._listeners = new Connect({
                        defaultConnectScope: this
                    });
                    ct_css.replaceClass(this.domNode, "ctTreeNodeLeaf", "ctTreeNodeCategory", this.isLeaf);
//                    this._createTooltipHoverNode(this.modelNode);
                    var mn = this.modelNode;
                    if (mn.service && mn.service.serviceType === ServiceTypes.POI) {
                        this._listeners.connect("poi", this, "onMouseEnter", "_onPOIHover");
                        this._listeners.connect("poi", this, "onMouseLeave", "_onPOILeave");
                    }
                    var toggleBtn, btn;
                    if (this.isLeaf) {

                        var s = mn.service;
                        if ((s && s.serviceType !== ServiceTypes.WMTS && s.serviceType !== ServiceTypes.POI) ||
                            (mn.props && (mn.props.description || mn.props.metadataUrl))) {
                            this.infoButton = new Button({
                                label: 'i',
                                'class': 'ctLayerInfoButton',
                                iconClass: 'icon-info-italic',
                                onClick: d_lang.hitch(this, this._onInfoClick)
                            }, this.infoNode);
                        } else if (mn.type === "app") {
                            if (mn.props && (mn.props.description || mn.props.metadataUrl)) {
                                this.infoButton = new Button({
                                    label: 'i',
                                    'class': 'ctLayerInfoButton',
                                    iconClass: 'icon-info-italic',
                                    onClick: d_lang.hitch(this, this._onInfoClick)
                                }, this.infoNode);
                            }
                        }
                        if (!this.isHeader) {
                            toggleBtn = this._toggleButton = new ToggleButton({
                                label: this.label,
                                iconClass: "dijitCheckBoxIcon",
                                checked: this.modelNode.get("enabled")
                            }, this.buttonNode);
                            this._listeners.connect("button", toggleBtn, "onClick", "_onNodeClick");
                        } else {
                            d_dom.create("div", {
                                innerHTML: this.label
                            }, this.buttonNode);
                            d_class.add(this.domNode, "ctThemaHeader");
                        }

                    } else {
                        btn = new ToggleButton({
                            label: this.label,
                            "class": this.isHeader ? "ctThemaHeader" : "",
                            checked: this.uncollapsed
                        }, this.buttonNode);
                        this._listeners.connect("button", btn, "onChange", "_onNodeClick");
                    }

                    var tooltipHtml = this._getMapPreviewUrl(this.modelNode);
                    if (tooltipHtml) {
                        this.mapTooltip = new Tooltip({
                            label: tooltipHtml,
                            connectId: [this.domNode]
                        });
                    }

                },

                _onInfoClick: function () {
                    this.onInfoClick({
                        item: this.modelNode
                    });
                },

                _getMapPreviewUrl: function (node) {
                    var imgUrl;
                    if (node.category && node.category.imgUrl) {
                        imgUrl = node.category.imgUrl;
                    } else if (node.props && node.props.imgUrl) {
                        imgUrl = node.props.imgUrl;
                    }
                    var wrapper = d_dom.create("div"), div;
                    if (imgUrl) {
                        div = d_dom.create("div", {
                            "class": "ctContentManagerMapTooltip"
                        }, wrapper);
                        d_dom.create("img", {
                            "src": imgUrl,
                            "class": "ctContentManagerMapTooltipImg"
                        }, div);
                    } else if (node.category && node.category.description) {
                        div = d_dom.create("div", {}, wrapper);
                        d_dom.create("span", {
                            "innerHTML": node.category.description,
                            "class": "ctContentManagerMapTooltip"
                        }, div);
                    }
                    return wrapper.innerHTML;
                },
                _onPOIHover: function () {
                    this.onPOIHover(this.modelNode);
                },

                _onPOILeave: function () {
                    this.onPOILeave(this.modelNode);
                },

                destroyRecursive: function () {
                    this.destroy();
                    this.inherited(arguments);
                },

                destroy: function () {
                    this._listeners.disconnect();
                    if (this.mapTooltip) {
                        this.mapTooltip.destroy();
                    }
                    this.inherited(arguments);
                },

                _onNodeClick: function () {
                    this.onNodeClick({
                        isLeaf: this.isLeaf,
                        modelNode: this.modelNode,
                        checked: this.checked
                    });
                },

                onNodeClick: function () {
                },
                onPOIHover: function () {
                },
                onPOILeave: function () {
                },
                onInfoClick: function () {
                }

//                _createTooltipHoverNode: function (item) {
//                    var tt = this._createInfoTooltip(item);
//                    if (item.props && (item.props.description || item.props.metadataUrl) && item.service && item.service.serviceType != "POI") {
//                        return d_dom.create("span", {
//                            "innerHTML": "i",
//                            "class": "ctContentItemInfoIcon",
//                            "onmouseover": d_lang.hitch(this, function () {
//                                this._mouseOverTooltip = false;
//                                popup.open({
//                                    popup: tt,
//                                    around: this.domNode,
//                                    orient: [
//                                        {
//                                            aroundCorner: "BL",
//                                            corner: "TL"
//                                        }
//                                    ]
//                                });
//                            }),
//                            "onmouseout": d_lang.hitch(this, function () {
//                                setTimeout(d_lang.hitch(this, function () {
//                                    if (!this._mouseOverTooltip) {
//                                        popup.close(tt);
//                                    }
//                                }), 1000);
//                            })
//                        }, this.infoNode);
//                    }
//                },

//                _createInfoTooltip: function (item) {
//                    var infowidget = new NodeInfoWidget({
//                        item: item
//                    });
//                    this._listeners.connect("tooltip", infowidget, "onCloseClick", this, function () {
//                        popup.close(tooltip);
//                        this._mouseOverTooltip = false;
//                    });
//                    var tooltip = new TooltipDialog({
//                        content: infowidget,
//                        baseClass: "ctLayerInfoTooltip ctHideConnector"
//                    });
//                    this._listeners.connect("tooltipenter", tooltip, "onMouseEnter", this, function () {
//                        this._mouseOverTooltip = true;
//                    });
//                    this._listeners.connect("tooltipleave", tooltip, "onMouseLeave", this, function () {
//                        this._mouseOverTooltip = false;
//                        setTimeout(d_lang.hitch(this, function () {
//                            if (!this._mouseOverTooltip) {
//                                popup.close(tooltip);
//                            }
//                        }), 1000);
//                    });
//                    return tooltip;
//                }
            }
        );
    }
);