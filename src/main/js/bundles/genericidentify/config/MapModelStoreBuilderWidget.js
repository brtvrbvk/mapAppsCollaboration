define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "ct/array",
        "ct/_Connect",
        "wizard/_BuilderWidget",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dijit/Tree",
        "dijit/form/TextBox",
        "ct/util/css",
        "dojo/dnd/Source",
        "dijit/registry",
        "./MappingItem",
        "./ExtraInfoWidget",
        "dojo/text!./templates/MapModelStoreBuilderWidget.html",
        ".",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "dijit/layout/TabContainer",
        "dijit/form/Button"
    ],
    function (
        declare,
        d_lang,
        d_array,
        ct_array,
        _Connect,
        _BuilderWidget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        Tree,
        TextBox,
        css,
        Source,
        d_registry,
        MappingItem,
        ExtraInfoWidget,
        template,
        _moduleRoot
        ) {

        return _moduleRoot.MapModelStoreBuilderWidget = declare([
                _BuilderWidget,
                _TemplatedMixin,
                _WidgetsInTemplateMixin
            ],
            /**
             * @lends ct.bundles.genericidentify.config.MapModelStoreBuilderWidget.prototype
             */
            {
                templateString: template,

                i18n: {
                    description: "Define map model with operational and base layers",
                    hint: "New services can be added in the Map Services menu."
                },

                baseClass: "ctMapModelStoreBuilderWidget",

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
                    this.dnd = new Source(this.dndList, {
                        generateText: false,
                        simpleSelection: true,
                        //skipForm needs to be set in order for IE to treat the textboxes correctly
                        skipForm: true,
                        singular: true
                    });
                    this.dndInfo = new Source(this.dndInfoList, {
                        generateText: false,
                        simpleSelection: true,
                        //skipForm needs to be set in order for IE to treat the textboxes correctly
                        skipForm: true,
                        singular: true
                    });
                    this.ignoreList = new TextBox({},
                        this.ignoreListNode);
                    this._listeners.connect(this.dnd, "onDrop",
                        "_changeLayerConfig");
                    this._listeners.connect(this.dndInfo,
                        "onDrop",
                        "_changeLayerConfig");
                },

                _setGeneralTypeMappingAttr: function (items) {
                    this.generalTypeMapping = items;
                },

                _setLayerTypeMappingAttr: function (items) {
                    this.layerTypeMapping = items;
                },

                _setServiceTreeModelAttr: function (attr) {
                    this.serviceTreeModel = attr;
                    this._createServiceTree();
                },

                _onGeneralClick: function () {
                    this._createTypeMappingList();
                },

                _createServiceTree: function () {
                    // Create the Tree.
                    this.servicesTree = new Tree({
                            model: this.serviceTreeModel,
                            showRoot: false,
                            autoExpand: true
                        },
                        this._servicesTreeNode);

                    this._listeners.connect(this.servicesTree,
                        "onClick",
                        function (item) {
                            if (!this._isLeaf(item)) {
                                this.clearDetailsPanel();
                                return;
                            } else {
                                this._updateDetails(item);
                            }
                        });
                },

                _isLeaf: function (item) {
                    if (item.isService) {
                        return false;
                    }
                    return true;
                },

                _updateDetails: function (item) {
                    this.clearDetailsPanel();
                    if (!item || !item.service || !item.id || !this.layerTypeMapping) {
                        return;
                    }
                    this._hideDetailsContainer(false);

                    var layerMapping = ct_array.arraySearchFirst(this.layerTypeMapping,
                        {
                            layerId: item.id,
                            serviceId: item.service
                        });
                    if (!layerMapping) {
                        layerMapping = {
                            layerId: item.id,
                            serviceId: item.service,
                            mapping: [],
                            ignoreAttributes: "",
                            extraInfo: []
                        };
                        this.layerTypeMapping.push(layerMapping);
                    }
                    this._createLayerTypeMappingList(layerMapping);
                },

                _hideDetailsContainer: function (isHidden) {
                    css.switchHidden(this._detailsContainer.domNode,
                        isHidden);
                },

                clearDetailsPanel: function () {
                    this.clearItems(this.dnd);
                    this.clearItems(this.dndInfo);
                    this.currentLayerMapping = null;
                    this.currentGeneralMapping = null;
                    this._containers = [
                        this.generalList,
                        this.dndList,
                        this.generalInfoList,
                        this.dndInfoList
                    ];
                    d_array.forEach(this._containers,
                        function (container) {
                            this._removeChildren(container);
                            css.switchHidden(container.domNode,
                                true);
                        }, this);
                    this._hideDetailsContainer(true);
                    this._detailsContainer.resize();
                },

                _removeChildren: function (node) {
                    while (node.hasChildNodes()) {
                        node.removeChild(node.lastChild);
                    }
                },

                _createLayerTypeMappingList: function (layerMapping) {
                    if (!layerMapping) {
                        return;
                    }
                    this.clearDetailsPanel();
                    this._hideDetailsContainer(false);
                    css.switchHidden(this.dndList.domNode,
                        false);
                    css.switchHidden(this.dndInfoList.domNode,
                        false);
                    this.currentLayerMapping = layerMapping;

                    var mapping = layerMapping.mapping;
                    if (mapping && mapping.length > 0) {
                        mapping = ct_array.arraySort(mapping,
                            this.__renderPriorityComparator);
                        for (var i = 0; i < mapping.length; i++) {
                            var mi = new MappingItem({
                                services: this.services,
                                layers: this.layers,
                                i18n: this.i18n
                            });
                            mi.setMappingProperty(mapping[i]);
                            this.addItem(mi, this.dnd);
                            this._listeners.connect(mi,
                                "onChange",
                                "_changeLayerConfig");
                        }
                    }

                    if (this.ignoreWatch) {
                        this.ignoreWatch.unwatch();
                    }
                    this.ignoreList.set("value",
                        layerMapping.ignoreAttributes);
                    this.ignoreWatch = this.ignoreList.watch('value',
                        d_lang.hitch(this,
                            function (obj) {
                                this._changeLayerConfig();
                            }));

                    this._createExtraInfoList(this._getActiveExtraInfo());
                    this._detailsContainer.resize();
                },

                _createTypeMappingList: function () {
                    this.clearDetailsPanel();
                    this._hideDetailsContainer(false);
                    css.switchHidden(this.generalList.domNode,
                        false);
                    css.switchHidden(this.generalInfoList.domNode,
                        false);
                    this.currentGeneralMapping = true;

                    var mapping = this.generalTypeMapping.mapping;
                    if (mapping.length > 0) {
                        for (var i = 0; i < mapping.length; i++) {
                            var mi = new MappingItem({
                                services: this.services,
                                layers: this.layers,
                                i18n: this.i18n
                            });
                            mi.setMappingProperty(mapping[i]);
                            mi.placeAt(this.generalList);
                            this._listeners.connect(mi,
                                "onChange",
                                "_changeGeneralConfig");
                        }
                    }

                    if (this.ignoreWatch) {
                        this.ignoreWatch.unwatch();
                    }
                    this.ignoreList.set("value",
                        this.generalTypeMapping.ignoreAttributes);
                    this.ignoreWatch = this.ignoreList.watch('value',
                        d_lang.hitch(this,
                            function (obj) {
                                this._changeGeneralConfig();
                            }));

                    this._createExtraInfoList(this._getActiveExtraInfo());
                    this._detailsContainer.resize();
                },

                _createExtraInfoList: function (item) {
                    if (!item.isDnd) {
                        this._removeChildren(item.container);
                    } else {
                        this.clearItems(item.container);
                    }
                    if (item.extraInfo.length > 0) {
                        ct_array.arraySort(item.extraInfo,
                            this.__renderPriorityComparator);
                        d_array.forEach(item.extraInfo,
                            function (info) {
                                var infoWidget = new ExtraInfoWidget({
                                    i18n: this.i18n
                                });
                                infoWidget.setInfoContent(info);
                                if (!item.isDnd) {
                                    infoWidget.placeAt(item.container);
                                } else {
                                    this.addItem(infoWidget,
                                        item.container);
                                }
                                this._listeners.connect(infoWidget,
                                    "onChange",
                                    item.callback);
                            }, this);
                    }
                },

                _changeLayerConfig: function (evt) {
                    d_array.forEach(this.dnd.getAllNodes(),
                        function (
                            item,
                            i
                            ) {
                            var mi = d_registry.getEnclosingWidget(item);
                            var mapping = mi.getMappingProperty();
                            this.currentLayerMapping.mapping[i] = {
                                attributeName: mapping.attributeName,
                                displayName: mapping.displayName,
                                attributeValue: mapping.attributeValue,
                                displayValue: mapping.displayValue,
                                serviceId: mapping.serviceId,
                                layerId: mapping.layerId,
                                index: i + 1
                            };
                        }, this);
                    this._changeExtraInfo(this.currentLayerMapping);
                    this.currentLayerMapping.ignoreAttributes = this.ignoreList.get("value");
                    this._updateConfig();
                },

                _changeGeneralConfig: function () {
                    d_array.forEach(this.generalList.children,
                        function (
                            item,
                            i
                            ) {
                            var mi = d_registry.getEnclosingWidget(item);
                            var mapping = mi.getMappingProperty();
                            this.generalTypeMapping.mapping[i] = {
                                attributeName: mapping.attributeName,
                                displayName: mapping.displayName,
                                attributeValue: mapping.attributeValue,
                                displayValue: mapping.displayValue,
                                serviceId: mapping.serviceId,
                                layerId: mapping.layerId
                            };
                        }, this);
                    this._changeExtraInfo(this.generalTypeMapping);
                    this.generalTypeMapping.ignoreAttributes = this.ignoreList.get("value");
                    this._updateConfig();
                },

                _changeExtraInfo: function (typeMapping) {
                    d_array.forEach(this.formInfoContainer.getChildren(),
                        function (
                            info,
                            i
                            ) {
                            typeMapping.extraInfo[i] = info.getInfoContent();
                            typeMapping.extraInfo[i].index = i + 1;
                        }, this);
                },

                addItem: function (
                    item,
                    dndSource
                    ) {
                    dndSource.insertNodes(false, [item.domNode]);
                    dndSource.sync();
                },

                clearItems: function (dndSource) {
                    dndSource.selectAll();
                    dndSource.deleteSelectedNodes();
                },

                destroy: function () {
                    this.inherited(arguments);
                    this._listeners.disconnect();
                    this.clearItems(this.dnd);
                    this.clearItems(this.dndInfo);
                    this.dnd.destroy();
                    this.dndInfo.destroy();
                },

                __renderPriorityComparator: function (
                    a,
                    b
                    ) {
                    a = Number(a.index);
                    b = Number(b.index);
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
                        return -1;
                    }
                    else if (a == b) {
                        return 0;
                    }
                    return 1;
                },

                _onAddClick: function () {
                    if (!this.currentLayerMapping && !this.currentGeneralMapping) {
                        return;
                    }
                    if (this.currentLayerMapping) {
                        if (!this.currentLayerMapping.mapping) {
                            this.currentLayerMapping["mapping"] = [];
                        }
                        this.currentLayerMapping.mapping.push({
                            attributeName: "",
                            displayName: "",
                            attributeValue: "",
                            displayValue: "",
                            serviceId: "",
                            layerId: "",
                            index: this.currentLayerMapping.mapping.length + 1
                        });
                        this._createLayerTypeMappingList(this.currentLayerMapping);
                    } else {
                        if (!this.generalTypeMapping.mapping) {
                            this.generalTypeMapping["mapping"] = [];
                        }
                        this.generalTypeMapping.mapping.push({
                            attributeName: "",
                            displayName: "",
                            attributeValue: "",
                            displayValue: "",
                            serviceId: "",
                            layerId: ""
                        });
                        this._createTypeMappingList();
                    }
                },

                _onRemoveClick: function () {
                    if (!this.currentLayerMapping && !this.currentGeneralMapping) {
                        return;
                    }
                    var kill = [];
                    var typeMapping;
                    if (this.currentLayerMapping) {
                        typeMapping = this.currentLayerMapping;
                        for (var i = 0; i < this.currentLayerMapping.mapping.length; i++) {
                            var mi = d_registry.getEnclosingWidget(this.dnd.getAllNodes()[i]);
                            var checked = mi.getCheckBoxState();
                            if (checked) {
                                kill.push(i);
                            }
                        }
                    } else {
                        typeMapping = this.generalTypeMapping;
                        for (var i = 0; i < this.generalTypeMapping.mapping.length; i++) {
                            var mi = d_registry.getEnclosingWidget(this.generalList.children[i]);
                            var checked = mi.getCheckBoxState();
                            if (checked) {
                                kill.push(i);
                            }
                        }
                    }
                    for (var j = 0; j < kill.length; j++)
                        typeMapping.mapping.splice(kill[j] - j,
                            1);
                    if (this.currentLayerMapping) {
                        this._createLayerTypeMappingList(this.currentLayerMapping);
                    } else {
                        this._createTypeMappingList();
                    }
                    this._updateConfig();
                },

                _onAddInfoClick: function (evt) {
                    var item = this._getActiveExtraInfo();
                    item.extraInfo.push({
                        title: "",
                        description: "",
                        index: item.extraInfo.length + 1
                    });
                    this._createExtraInfoList(item);
                },

                _onRemoveInfoClick: function (evt) {
                    var kill = [];
                    d_array.forEach(this.formInfoContainer.getChildren(),
                        function (
                            info,
                            i
                            ) {
                            var checked = info.getCheckBoxState();
                            if (checked) {
                                kill.push(i);
                            }
                        }, this);
                    var item = this._getActiveExtraInfo();
                    for (var j = 0; j < kill.length; j++)
                        item.extraInfo.splice(kill[j] - j, 1);
                    this._createExtraInfoList(item);
                    this._updateConfig();
                },

                _getActiveExtraInfo: function () {
                    var result;
                    if (this.currentLayerMapping) {
                        if (!this.currentLayerMapping.extraInfo) {
                            this.currentLayerMapping["extraInfo"] = [];
                        }
                        result = {
                            extraInfo: this.currentLayerMapping.extraInfo,
                            callback: "_changeLayerConfig",
                            container: this.dndInfo,
                            isDnd: true
                        }
                    } else {
                        if (!this.generalTypeMapping.extraInfo) {
                            this.generalTypeMapping["extraInfo"] = [];
                        }
                        result = {
                            extraInfo: this.generalTypeMapping.extraInfo,
                            callback: "_changeGeneralConfig",
                            container: this.generalInfoList
                        }
                    }
                    return result;
                },

                _updateConfig: function () {
                    this.onUpdateConfig({
                        layerTypeMapping: this.layerTypeMapping,
                        generalTypeMapping: this.generalTypeMapping
                    });
                },

                onUpdateConfig: function (evt) {
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