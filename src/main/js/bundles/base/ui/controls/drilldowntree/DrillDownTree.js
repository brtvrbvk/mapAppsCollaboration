/**
 * COPYRIGHT 2012-2013 con terra GmbH Germany
 *
 * User: fba
 * Date: 26.07.13
 * Time: 14:14
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "./TreeNode",
        "./BreadcrumbNode",
        "ct/util/css",
        "ct/_Connect",
        "dojo/text!./templates/DrillDownTree.html"
    ],
    function (
        declare,
        d_array,
        d_lang,
        d_dom,
        _WidgetBase,
        _TemplatedMixin,
        TreeNode,
        BreadcrumbNode,
        ct_css,
        Connect,
        templateString
        ) {
        return declare([
                _WidgetBase,
                _TemplatedMixin
            ],
            {
                templateString: templateString,
                rootId: "__operationallayer__",
                showSingleRootInBreadcrumb: false,
                i18n: {
                    categorytooltip: "To category ${category}",
                    layertooltip: "${description}",
                    mainCategory: "Thema´s"
                },

                constructor: function () {
                },

                postCreate: function () {
                    this.inherited(arguments);
                    var root = this.model.getNodeById(this.rootId);
                    this._currentNode = root;
                    this._listeners = new Connect({
                        defaultConnectScope: this
                    });
                    this._buildCurrentView(root);
                    this._buildCurrentBreadCrumb(root);
                    this._listeners.connect("mode", this.model, "onModelNodeStateChanged",
                        "_handleModelUpdate");
                },

                destroy: function () {
                    this.inherited(arguments);
                    this._listeners.disconnect();
                },

                _handleModelUpdate: function (args) {
                    if (args.layer) {
                        this._currentNode = args.layer.get("parent");
                        this._buildCurrentBreadCrumb(this._currentNode);
                    }
                    // BartVerbeeck Bug50562
                    //this._buildCurrentView(this._currentNode);
                },

                _buildCurrentBreadCrumb: function (node) {
                    if (this.breadcrumbNodes && this.breadcrumbNodes.length > 0) {
                        this._listeners.disconnect("breadcrumbs");
                        d_array.forEach(this.breadcrumbNodes, function (n) {
                            n.destroyRecursive();
                        });
                    }
                    this.breadcrumbNodes = [];
                    this._buildCurrentBreadCrumbRecursive(node, this.breadcrumbnode);
                },

                _buildCurrentBreadCrumbRecursive: function (node, listelem) {
                    var breadcrumbnode = this.breadcrumbnode;
                    ct_css.switchHidden(breadcrumbnode, breadcrumbnode.children.length===0);
                    if (node.get("id") !== this.rootId) {
                        this._createBreadcrumbNode(node, listelem, null,
                            (listelem.children.length === 0));
                        this._buildCurrentBreadCrumbRecursive(node.get("parent"), listelem);
                    } else if (node.get("id") === this.rootId) {
                        if (this.showSingleRootInBreadcrumb) {
                            this._createBreadcrumbNode(node, listelem, this.i18n.mainCategory);
                        } else {
                            if (this.breadcrumbNodes.length > 0) {
                                this._createBreadcrumbNode(node, listelem, this.i18n.mainCategory);
                            }
                        }
                    }
                },

                _createBreadcrumbNode: function (
                    node,
                    listelem,
                    title,
                    isLeaf
                    ) {
                    var bc = new BreadcrumbNode({
                        title: title || node.title || node.id,
                        modelNode: node,
                        'class': (isLeaf) ? "isLeaf" : ""
                    });
                    bc.placeAt(listelem, "first");
                    this.breadcrumbNodes.push(bc);
                    this._listeners.connect("breadcrumbs", bc, "onNodeClick", "_onBreadcrumbClick");
                },

                _onBreadcrumbClick: function (evt) {
                    this._currentNode = evt.modelNode;
                    this._buildCurrentView(evt.modelNode);
                    this._buildCurrentBreadCrumb(evt.modelNode);
                },

                _buildCurrentView: function (node) {
                    
                    var children = node.get("children");
                    if (this.treenodes && this.treenodes.length > 0) {
                        this._listeners.disconnect("nodes");
                        d_array.forEach(this.treenodes, function (n) {
                            n.destroyRecursive();
                        });
                        this.treenodes = null;
                    }

                    if (children) {
                        this.treenodes = d_array.map(children, function (n) {
                            var treenode = this._createNode(n);
                            treenode.placeAt(this.viewnode);
                            return treenode;
                        }, this);
                    }
                    
                },

                _createNode: function (modelNode) {
                    var isLeaf = !modelNode.hasChildren() || modelNode.get("service");
                    var node = new TreeNode({
                        modelNode: modelNode,
                        isLeaf: isLeaf,
                        label: modelNode.title || modelNode.id,
                        checked: modelNode.get("enabled"),
                        baseClass: modelNode.get("cssClass"),
                        i18n: this.i18n
                    });
                    this._listeners.connect("nodes", node, "onNodeClick", "_onNodeClick");
                    this._listeners.connect("nodes", node, "onInfoClick", "_onNodeInfoClick");
                    this._listeners.connect("nodes", node, "onPOILeave", "_onPOILeave");
                    this._listeners.connect("nodes", node, "onPOIHover", "_onPOIHover");
                    return node;
                },

                _onNodeInfoClick: function (evt) {
                    this.onInfoClick(evt);
                },

                _onNodeClick: function (evt) {
                    if (evt.isLeaf) {
                        this._currentNode = evt.modelNode.parent;
                        this.onClick(evt.modelNode);
                    } else {
                        this._currentNode = evt.modelNode;
                        this._buildCurrentView(evt.modelNode);
                        this._buildCurrentBreadCrumb(evt.modelNode);
                    }
                },

                _onPOILeave: function (modelNode) {
                    this.onPOILeave(modelNode);
                },

                _onPOIHover: function (modelNode) {
                    this.onPOIHover(modelNode);
                },

                onInfoClick: function () {
                },
                onClick: function () {
                },
                onPOIHover: function () {
                },
                onPOILeave: function () {
                }

            }
        );
    }
);