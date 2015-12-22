/**
 * COPYRIGHT 2014 con terra GmbH Germany
 *
 * Created by fba on 04.08.2014.
 */
define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "ct/util/css",
        "ct/array",
        "dijit/_WidgetsInTemplateMixin",
        "base/ui/controls/drilldowntree/DrillDownTree",
        "./InfoTreeNode",
        "dojo/text!./templates/InfoTree.html",
        "dijit/form/ToggleButton"
    ],
    function (declare, d_array, css, ct_array, _WidgetsInTemplateMixin, DrillDownTree, InfoTreeNode, templateString) {
        return declare([
                DrillDownTree,
                _WidgetsInTemplateMixin
            ],
            {

                templateString: templateString,

                constructor: function () {

                },

                postCreate: function () {
                    this.inherited(arguments);
                    this._listeners.connect("button", this.collapseButton, "onClick", "_toggleButtonClicked");
                },

                startup: function () {
                    this.inherited(arguments);
                    this._collapse(this.collapsed);
                },

                _showCategories: function () {
                    css.switchHidden(this.mainNode.domNode, false);
                    this.mainNode.resize();
                },
                _hideCategories: function () {
                    css.switchHidden(this.mainNode.domNode, true);
                    this.mainNode.resize();
                },

                _createNode: function (modelNode) {
                    var isLeaf = !modelNode.hasChildren() || modelNode.get("service");
                    var cssClass = modelNode.get("cssClass");
                    cssClass = (cssClass ? cssClass : "");
                    var node = new InfoTreeNode({
                        mapModel: this.mapModel,
                        modelNode: modelNode,
                        isLeaf: isLeaf,
                        label: modelNode.title || modelNode.id,
                        checked: modelNode.get("enabled"),
                        uncollapsed: modelNode.uncollapsed,
                        isHeader: (modelNode.category && modelNode.category.isHeader) || false,
                        baseClass: cssClass,
                        i18n: this.i18n
                    });
                    this._listeners.connect("nodes", node, "onNodeClick", "_onNodeClick");
                    this._listeners.connect("nodes", node, "onInfoClick", "_onNodeInfoClick");
                    this._listeners.connect("nodes", node, "onIdentifyClick", "_onIdentifyClick");
                    return node;
                },

                resize: function (dim) {

                    if (this.mainNode) {
                        this.mainNode.resize(dim);
                    }

                },

                _toggleButtonClicked: function () {

                    this._collapse(this.collapseButton.get("checked"));

                },

                _collapse: function (collapsed) {

                    this._switchTogglerState(collapsed);

                    var children = this._currentNode.get("children");
                    d_array.forEach(children, function (child) {

                        this._toggleLeafNodesCollapse(child, collapsed);
                        var treenode = this._getTreeNodeForNode(child);
                        treenode.set("checked", collapsed);

                    }, this);

                },

                _switchTogglerState: function (collapsed) {

                    if (collapsed) {
                        this.collapseButton.set("label", this.i18n.uncollapse);
                        this.collapseButton.set("iconClass", "icon-plus");
                    } else {
                        this.collapseButton.set("label", this.i18n.collapse);
                        this.collapseButton.set("iconClass", "icon-minus");
                    }

                    this.collapseButton.set("checked", collapsed);

                    css.switchHidden(this.hintCheckLayersNode, collapsed);

                },
//BartVerbeeck Bug29971 in de buurt - checkbox not cleared
                _handleModelUpdate: function (args) {
                    this._buildCurrentView(this._currentNode);
                },

                _onNodeClick: function (evt) {
                    if (evt.isLeaf) {
                        this.onClick(evt.modelNode);
                    } else {
                        this._toggleLeafNodesCollapse(evt.modelNode);
                        if (this._checkAllCategoriesCollapsed()) {
                            this._switchTogglerState(true);
                        } else {
                            this._switchTogglerState(false);
                        }
                    }
                },

                _toggleLeafNodesCollapse: function (modelNode, collapsed) {

                    modelNode.collapsed = !modelNode.collapsed;

                    var leafes = this._getLeafesForCategory(modelNode);
                    collapsed = collapsed !== undefined ? collapsed : modelNode.collapsed;
                    modelNode.collapsed = collapsed;

                    d_array.forEach(leafes, function (leaf) {

                        css.switchHidden(leaf.domNode, collapsed);

                    }, this);

                },

                _checkAllCategoriesCollapsed: function () {

                    var children = this._currentNode.get("children"),
                        allCollapsed = true;
                    d_array.forEach(children, function (child) {
                        if (!child.collapsed) {
                            allCollapsed = false;
                        }
                    }, this);

                    return allCollapsed;

                },

                _buildCurrentView: function (node) {
                    var children = node.get("children");
                    this.treenodes = this.treenodes || [];
                    if (this.treenodes && this.treenodes.length > 0) {
                        this._listeners.disconnect("nodes");
                        d_array.forEach(this.treenodes, function (n) {
                            n.destroyRecursive();
                        });
                        this.treenodes = [];
                    }

                    if (children) {
                        d_array.forEach(children, function (n) {
                            var treenode = this._createNode(n, true);
                            treenode.placeAt(this.viewnode);
                            this.treenodes.push(treenode);
                            d_array.forEach(n.get("children"), function (child) {
                                var treenode = this._createNode(child);
                                treenode.placeAt(this.viewnode);
                                this.treenodes.push(treenode);
                                return treenode;
                            }, this);
                            return treenode;
                        }, this);
                    }
                },

                _getTreeNodeForNode: function (node) {

                    var result;

                    d_array.some(this.treenodes, function (treenode) {

                        if (treenode.modelNode.id === node.id) {
                            result = treenode;
                            return true;
                        }

                    }, this);

                    return result;

                },

                _getLeafesForCategory: function (modelNode) {

                    var leafes = [];

                    d_array.forEach(modelNode.get("children"), function (node) {

                        var treenode = this._getTreeNodeForNode(node);
                        if (treenode) {
                            leafes.push(treenode);
                        }

                    }, this);

                    return leafes;

                },

                _onIdentifyClick: function (node) {
                    this.eventService.postEvent("agiv/identify/NODE", {
                        node: node
                    });
                }
            }
        );
    }
);