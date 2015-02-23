define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/_base/html",
        "ct/_lang",
        "ct/array",
        "ct/_Connect",
        "ct/_when",
        "ct/mapping/mapcontent/ServiceTypes",
        "wizard/_BuilderWidget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "ct/store/ComplexMemory",
        "dijit/Tree",
        "ct/util/css",
        "dijit/registry",
        "dijit/tree/dndSource",
        "dojo/dnd/Source",
        "dojo/text!./templates/ContentModelBuilderWidget.html",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "dijit/layout/TabContainer",
        "dijit/form/Button"
    ],
    function (
        declare,
        d_lang,
        d_array,
        d_html,
        ct_lang,
        ct_array,
        _Connect,
        ct_when,
        ServiceTypes,
        _BuilderWidget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        ComplexMemory,
        Tree,
        css,
        registry,
        dndSource,
        Source,
        template
        ) {

        var nonCopyDndSource = declare([dndSource], {
            copyState: function () {
                return false;
            },
            itemCreator: function (
                nodes,
                row,
                source
                ) {
                //for apps
                return d_array.map(nodes, function (node) {
                    var sourceItem = source.getItem(node.id);
                    var app = sourceItem.data;
                    return {
                        "id": app.id + node.id,
                        "name": app.title,
                        "label": app.title,
                        "title": app.title,
                        appid: app.id,
                        "cssClass": "ctAppLink",
                        "enabled": false,
                        type: "app",
                        "props": {
                            link: "../" + app.id + "/",
                            imgUrl: "../" + app.id + "/" + app.thumbnailFile
                        }
                    };
                });
            }
        });
        var nonCopyDndSourceSingular = declare([dndSource], {
            copyState: function () {
                return false;
            }
        });

        var creatorFunction = function (
            types,
            duplicateFilterCb,
            item,
            hint
            ) {
            if (!hint && duplicateFilterCb) {
                var found;
                this.forInItems(function (
                    dndItem,
                    nodeId
                    ) {
                    if (!found && duplicateFilterCb(dndItem.data, item)) {
                        found = {
                            node: d_html.byId(nodeId),
                            data: dndItem.data,
                            type: dndItem.type
                        };
                    }
                }, this);
                if (found) {
                    return found;
                }
            }
            var itemNode = d_html.create("div", {
                "class": "app"
            });
            d_html.create("div", {
                "class": "avatar"
            }, itemNode);
            var contentNode = d_html.create("div", {
                "class": "content"
            }, itemNode);
            d_html.create("div", {
                innerHTML: item.title,
                "class": "title"
            }, contentNode);
            return {
                node: itemNode,
                data: d_lang.clone(item),
                type: types
            };
        };

        nonCopyDndSourceSingular.copyOnly = true;
        return declare([
                _BuilderWidget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            /**
             * @lends ct.bundles.map.config.MapModelBuilderWidget.prototype
             */
            {
                templateString: template,

                i18n: {
                    description: "Define map model with operational and base layers",
                    hint: "New services can be added in the Map Services menu.",
                    chooseVisibleLayer: "Initial visibility of layers (checked = visible)",
                    layerVisible: "Check to set initial visible state of layer",
                    categoryDescription: "Description:",
                    categoryDescriptionTooltip: "Description of the category node",
                    imageUrl: "URL for cover image:",
                    imageUrlTooltip: "URL of cover image (Size: 267x159 px, Formats: jpg, png, gif)",
                    defaultEnabled: "Category enabled:",
                    defaultEnabledTooltip: "Check to set category to enable",
                    detailsPaneTitle: "Change settings of category",
                    mapFlowPaneTitle: "If you are using the mapFlow, you can define the properties (description and image) in the section below",
                    detailsHint: "Select node to set details...",
                    servicesHint: "Drag services here...",
                    servicesTitle: "Services",
                    categoriesTitle: "Categories",
                    detailsTitle: "Details",
                    operationalLayer: "Operational layer",
                    baseLayer: "Base layer",
                    newCategoryDefaultTitle: "New Category"
                },

                baseClass: "ctContentModelBuilderWidget",

                /**
                 * @constructs
                 */
                constructor: function () {
                    this._listeners = new _Connect({
                        defaultConnectScope: this
                    });
                },

                postCreate: function () {
                    this.inherited(arguments);
                    css.switchHidden(this._getCapNode.domNode, true);
                },

                _setServiceTreeModelAttr: function (attr) {
                    this.serviceTreeModel = attr;
                    this.createServiceTree();
                },

                _setCategoryTreeModelAttr: function (attr) {
                    this.categoryTreeModel = attr;
                    this.createCategoryTree();
                },

                _getCategoryTreePathAttr: function () {
                    return this.categoryTree.path;
                },

                _setCategoryTreePathAttr: function (attr) {
                    this.categoryTree.set("path", attr);
                },

                _setAppsStoreAttr: function (s) {
                    this._appsStore = s;
                    this.createAppsList();
                },

                createAppsList: function () {

                    ct_when(this._appsStore.query({id: {$eqw: "*"}}), function (items) {
                        var applist = this._appsListNode = new Source(this._appsListNode,
                            {
                                creator: d_lang.partial(creatorFunction,
                                    ["app"],
                                    null),
                                accept: [],
                                copyOnly: true,
                                type: "app"
                            });
                        applist.insertNodes(false, items);

                    }, this);

                },

                createServiceTree: function () {
                    // Create the Tree.
                    if (this.servicesTree) {
                        var tree = this.servicesTree;
                        tree.dndController.selectNone();

                        tree.model.store.clearOnClose = true;
                        tree.model.store.close();

                        // Completely delete every node from the dijit.Tree
                        tree._itemNodesMap = {};
                        tree.rootNode.state = "UNCHECKED";
                        tree.model.root.children = null;

                        // Destroy the widget
                        tree.rootNode.destroyRecursive();

                        tree.model = this.serviceTreeModel;

                        tree.postMixInProperties();
                        tree._load();
                    } else {
                        this.servicesTree = new Tree({
                            model: this.serviceTreeModel,
                            showRoot: false,
                            dndController: nonCopyDndSourceSingular,
                            autoExpand: false,
                            checkItemAcceptance: function (
                                target,
                                source,
                                position
                                ) {
                                return false;
                            }
                        }, this._servicesTreeNode);
                    }

                },

                createCategoryTree: function () {
                    // Create the Tree.
                    this.categoryTree = new Tree({
                        model: this.categoryTreeModel,
                        showRoot: false,
                        dndController: nonCopyDndSource,
                        autoExpand: false,
                        checkItemAcceptance: function (
                            target,
                            source,
                            position
                            ) {
                            var isLayer = true;
                            if (source && source.type !== "app") {
                                ct_lang.forEachProp(source.selection,
                                    function (src) {
                                        var item = src.item;
                                        var isService = item.isService;
                                        isLayer = isLayer && !isService;
                                    });
                            }
                            var item = registry.getEnclosingWidget(target).item;
                            return isLayer && (item.category || (item.children && item.children.length > 0) );
                        }
                    }, this._categoryTreeNode);

                    this._listeners.connect(this.categoryTree, "onClick", function (item) {
                        if (!this._isLeaf(item)) {
                            this._selectedLayer = null;
                            this._updateDetails(item);
                        } else {
                            this._selectedLayer = item;
                            var serviceId = item.service;
                            if (item.layers) {
                                var layerId = item.layers[0];
                                var query = {service: serviceId};
                                if (layerId !== "*") {
                                    query.layer = layerId;
                                }
                                ct_when(this.identifyMappingStore.query(query, {}), function (resp) {
                                    var defaultValue = d_array.filter(resp, function (item) {
                                        return (item.defaultMapping === true);
                                    })[0];
                                    item.identifyConfigId = defaultValue ? defaultValue.identifyConfigID : "";
                                    var store = new ComplexMemory({idProperty: "identifyConfigID", data: resp});
                                    this.dataFormService.addStore(store, {id: "configStore"});
                                    this._updateDetails(item);
                                }, this);
                            } else {
                                this._updateDetails(item);
                            }
                        }
                    });
                },

                _isLeaf: function (item) {
                    if (item.category || (item.children && item.children.length > 0) || item === undefined) {
                        return false;
                    }
                    return true;
                },

                onGetCap: function (item) {
                },
                onAddCategory: function (item) {
                },
                onRemove: function (item) {
                },
                onUp: function (
                    item,
                    path
                    ) {
                },
                onDown: function (
                    item,
                    path
                    ) {
                },
                onChange: function () {
                },

                _onGetCapClick: function () {
                    if (this._selectedLayer) {
                        this.onGetCap(this._selectedLayer);
                    }
                },

                _onAddClick: function (evt) {
                    this.onAddCategory(this.categoryTree && this.categoryTree.selectedItem);
                },

                _onRemoveClick: function (evt) {
                    this.onRemove(this.categoryTree && this.categoryTree.selectedItem);
                },
                _onUpClick: function (evt) {
                    this.onUp(this.categoryTree && this.categoryTree.selectedItem,
                        this.categoryTree.path);
                },
                _onDownClick: function (evt) {
                    this.onDown(this.categoryTree && this.categoryTree.selectedItem,
                        this.categoryTree.path);
                },
                _updateDetails: function (item) {
                    item = item || (this.categoryTree && this.categoryTree.selectedItem);
                    if (!item) {
                        return;
                    }
                    var isLeaf = this._isLeaf(item);
                    var detailsNode = this._detailsNode;
                    this.clearDetailsPanel();
                    css.switchHidden(detailsNode, false);
                    css.switchHidden(this._detailsHintNode.domNode, true);
                    this._switchGetCapButton(item, isLeaf);
                    this._detailsContainer.resize();
                    var content = this._detailsPanel = this._createDetailsPanel(item, isLeaf);
                    this._detailsNode.set("content", content);
                },

                _switchGetCapButton: function (
                    item,
                    isLeaf
                    ) {
                    if (!isLeaf) {
                        css.switchHidden(this._getCapNode.domNode, true);
                        return;
                    }
                    var res = this.mrr.getMappingResourceByUniqueId(item.service);
                    var st = res && res.serviceType;

                    if (st && (st === ServiceTypes.WMS || st === ServiceTypes.INSPIRE_VIEW)) {
                        css.switchHidden(this._getCapNode.domNode, false);
                    } else {
                        css.switchHidden(this._getCapNode.domNode, true);
                    }

                },
                _setLoadingAttr: function (val) {
                    if (val) {
                        this._getCapNode.set("label", "Loading...");
                    } else {
                        this._getCapNode.set("label", this.i18n.fillinFromCapabilities);
                    }
                },

                clearDetailsPanel: function () {
                    this._switchGetCapButton();
                    css.switchHidden(this._detailsHintNode.domNode, false);
                    css.switchHidden(this._detailsNode, true);
                    this._detailsContainer.resize();
                    var detailsPanel = this._detailsPanel;
                    if (detailsPanel) {
                        detailsPanel.destroyRecursive();
                        this._detailsPanel = null;
                    }
                },

                _createDetailsPanel: function (
                    item,
                    isLeaf
                    ) {
                    var i18n = this.i18n;
                    var cols = 2;
                    var form = {
                        "dataform-version": "1.0.0",
                        "type": "gridpanel",
                        "cols": cols,
                        "showLabels": true,
                        "children": [
                            {
                                "colspan": cols,
                                "spanLabel": true,
                                "type": "label",
                                "value": i18n.detailsPaneTitle
                            },
                            {
                                "colspan": cols,
                                "type": "textbox",
                                "label": i18n.categoryTitle,
                                "tooltip": i18n.categoryTitleTooltip,
                                "cssClass": "ctWizardTextBox ctWizardTitle",
                                "field": "title",
                                "size": {
                                    "w": 200
                                }
                            }
                        ]
                    };

                    var children = form.children;
                    if (isLeaf) {
                        var res = this.mrr.getMappingResourceByUniqueId(item.service);
                        if (res) {
                            var t = res.title, u = res.serviceUrl;
                            if (u) {
                                children.unshift({
                                    "colspan": cols,
                                    "spanLabel": true,
                                    "type": "label",
                                    "value": u
                                });
                            }
                            if (t) {
                                children.unshift({
                                    "colspan": cols,
                                    "spanLabel": true,
                                    "type": "label",
                                    "value": t
                                });
                            }
                        }

                        if (!item.props) {
                            item.props = {};
                        }
                        if (!item.props.description) {
                            item.props.description = "";
                        }
                        if (!item.props.metadataUrl) {
                            item.props.metadataUrl = "";
                        }
                        if (!item.props.imgUrl) {
                            item.props.imgUrl = "";
                        }
                        if (!item.keywords) {
                            item.keywords = "";
                        }

                        children.push({
                            "colspan": cols,
                            "type": "textbox",
                            "label": i18n.categoryImgUrl,
                            "tooltip": i18n.categoryImgUrlTooltip,
                            "cssClass": "ctWizardTextBox ctWizardTitle",
                            "field": "props.imgUrl",
                            "size": {
                                "w": 200
                            }
                        });
                        children.push({
                            "colspan": cols,
                            "type": "textbox",
                            "label": i18n.metadataUrlDescription,
                            "tooltip": i18n.metadataUrlDescriptionTooltip,
                            "cssClass": "ctWizardTextBox ctWizardTitle",
                            "field": "props.metadataUrl",
                            "size": {
                                "w": 200
                            }
                        });
                        children.push({
                            "colspan": cols,
                            "type": "textarea",
                            "label": i18n.categoryDescription,
                            "tooltip": i18n.categoryDescriptionTooltip,
                            "cssClass": "ctWizardTextBox ctWizardDescription",
                            "field": "props.description",
                            "size": {
                                "w": 190,
                                "h": 100
                            }
                        });
                        if (!item.type || item.type !== "app") {
                            children.push({
                                "colspan": cols,
                                "type": "textbox",
                                "label": i18n.keywordList,
                                "tooltip": i18n.keywordListTooltip,
                                "cssClass": "ctWizardTextBox ctWizardKeywordList",
                                "field": "keywords",
                                "size": {
                                    "w": 200
                                }
                            });
                            children.push({
                                "colspan": cols,
                                "type": "numbertextbox",
                                "label": i18n.maxScaleTitle,
                                "tooltip": i18n.maxScaleTooltip,
                                "cssClass": "ctWizardTextBox ctWizardTitle",
                                "min": 0,
                                "field": "minScale",
                                "size": {
                                    "w": 200
                                }
                            });
                            children.push({
                                "colspan": cols,
                                "type": "numbertextbox",
                                "label": i18n.minScaleTitle,
                                "tooltip": i18n.minScaleTooltip,
                                "cssClass": "ctWizardTextBox ctWizardTitle",
                                "field": "maxScale",
                                "min": 0,
                                "size": {
                                    "w": 200
                                }
                            });
                            children.push({
                                "colspan": cols,
                                "type": "combobox",
                                "label": i18n.identifyConfig,
                                "tooltip": i18n.identifyConfigTooltip,
                                "cssClass": "ctWizardComboBox ctWizardIdentifyConfig",
                                "field": "identifyConfigId",
                                "store": "configStore",
                                "searchAttribute": "identifyConfigID",
                                "labelAttribute": "identifyConfigID"
                            });
                            children.push({
                                "colspan": cols,
                                "type": "textbox",
                                "label": i18n.restUrl,
                                "tooltip": i18n.restUrlTooltip,
                                "cssClass": "ctWizardTextBox",
                                "field": "RESTurl",
                                "size": {
                                    "w": 200
                                }
                            });
                            children.push({
                                "colspan": cols,
                                "type": "textbox",
                                "label": i18n.restLayerId,
                                "tooltip": i18n.restLayerIdTooltip,
                                "cssClass": "ctWizardTextBox",
                                "field": "RESTlayerId",
                                "size": {
                                    "w": 200
                                }
                            });
                            children.push({
                                "colspan": cols,
                                "type": "textbox",
                                "label": i18n.restTitleAttribute,
                                "tooltip": i18n.restTitleAttributeTooltip,
                                "cssClass": "ctWizardTextBox",
                                "field": "RESTtitleAttribute",
                                "size": {
                                    "w": 200
                                }
                            });
                        }

                    } else {
                        if (!item.category) {
                            item.category = {};
                        }
                        if (!item.category.description) {
                            item.category.description = "";
                        }
                        if (!item.category.imgUrl) {
                            item.category.imgUrl = "";
                        }
                        if (!item.category.isHeader) {
                            item.category.isHeader = false;
                        }

                        children.push({
                            "type": "checkbox",
                            "label": i18n.isHeaderTitle,
                            "tooltip": i18n.isHeaderTitleTooltip,
                            "cssClass": "ctWizardTextBox ctWizardHeader",
                            "field": "category.isHeader"
                        });
                        children.push({
                            "colspan": cols,
                            "type": "textbox",
                            "label": i18n.categoryImgUrl,
                            "tooltip": i18n.categoryImgUrlTooltip,
                            "cssClass": "ctWizardTextBox ctWizardDescription",
                            "field": "category.imgUrl",
                            "size": {
                                "w": 200
                            }
                        });
                        children.push({
                            "colspan": cols,
                            "type": "textarea",
                            "label": i18n.categoryDescription,
                            "tooltip": i18n.categoryDescriptionTooltip,
                            "cssClass": "ctWizardTextBox ctWizardDescription",
                            "field": "category.description",
                            "size": {
                                "w": 190,
                                "h": 100
                            }
                        });
                    }
                    if (item.type !== "app") {
                        children.push({
                            "colspan": cols,
                            "type": "checkbox",
                            "label": isLeaf ? i18n.defaultEnabledLayer : i18n.defaultEnabled,
                            "tooltip": isLeaf ? i18n.defaultEnabledLayerTooltip : i18n.defaultEnabledTooltip,
                            "cssClass": "ctWizardTextBox ctWizardTitle",
                            "field": "enabled"
                        });
                    }

                    var dataFormService = this.dataFormService;

                    var widget = dataFormService.createDataForm(form);

                    var binding = dataFormService.createBinding("object", {
                        data: item
                    });
                    widget.set("dataBinding", binding);
                    binding.watch("*", d_lang.hitch(this, function () {
                        this.categoryTreeModel.onChange(item);
                        this.onChange();
                    }));

                    return widget;
                },

                fireConfigChangeEvent: function (
                    config,
                    refreshPanel
                    ) {
                    this.inherited(arguments);
                    if (refreshPanel) {
                        this._updateDetails();
                    }
                },

                resize: function (dim) {
                    this.inherited(arguments);
                    if (dim && dim.h > 0) {
                        dim.h -= this.getHeadingHeight();
                        this.mainContainer.resize(dim);
                    }
                }

            });
    });